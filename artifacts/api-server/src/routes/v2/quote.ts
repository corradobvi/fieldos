import { Router, Request, Response, NextFunction } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { sendPushToUsers, societyKeyFor } from "../../lib/push-sender";
import { resolveRecipients } from "../../lib/recipient-resolver";
import { addNotificaToBlob } from "./minors";

const router = Router();

const PLAN_TIER: Record<string, number> = {
  mister: 0, gratuito: 0, mister_pro: 1, base: 1, societa: 2, premium: 2,
};

function requirePlan(minPlan: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { societyId } = req.jwtUser!;
      if (!societyId) { res.status(403).json({ error: "plan_upgrade_required", pianoMin: minPlan }); return; }
      const [rows] = await pool.execute("SELECT piano FROM societies WHERE id = ?", [societyId]) as [any[], any];
      if (!rows.length) { res.status(403).json({ error: "society_not_found" }); return; }
      const tier = PLAN_TIER[rows[0].piano] ?? -1;
      if (tier < (PLAN_TIER[minPlan] ?? 99)) {
        res.status(403).json({ error: "plan_upgrade_required", pianoMin: minPlan }); return;
      }
      next();
    } catch (e) { next(e); }
  };
}

// GET /api/v2/quote?leva=U14&stato=in_attesa
router.get("/quote", requireAuth, requireRole("admin", "dirigente"), requirePlan("societa"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { leva, stato } = req.query as Record<string, string>;

  try {
    const [rows] = (await pool.execute(
      `SELECT q.id, q.player_id, q.importo, q.scadenza, q.stato, q.leva, q.stagione, q.nota,
              p.nome, p.cognome
       FROM quote q
       JOIN players p ON p.id = q.player_id
       WHERE q.society_id = ?
         ${leva ? "AND q.leva = ?" : ""}
         ${stato ? "AND q.stato = ?" : ""}
       ORDER BY q.scadenza, p.cognome`,
      [societyId, ...(leva ? [leva] : []), ...(stato ? [stato] : [])]
    )) as [any[], any];
    return res.json(rows);
  } catch (e: any) {
    logger.error({ err: e }, "GET quote error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/quote
router.post("/quote", requireAuth, requireRole("admin", "dirigente"), requirePlan("societa"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { playerId, importo, scadenza, stato, leva, stagione, nota } = req.body as Record<string, any>;
  if (!playerId) return res.status(400).json({ error: "playerId_required" });

  try {
    const [result] = (await pool.execute(
      "INSERT INTO quote (society_id, player_id, importo, scadenza, stato, leva, stagione, nota) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [societyId, playerId, importo ?? null, scadenza ?? null,
       stato ?? "in_attesa", leva ?? null, stagione ?? null, nota ?? null]
    )) as [any, any];
    return res.status(201).json({ id: result.insertId });
  } catch (e: any) {
    logger.error({ err: e }, "POST quota error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/v2/quote/:id
router.put("/quote/:id", requireAuth, requireRole("admin", "dirigente"), requirePlan("societa"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { importo, scadenza, stato, nota } = req.body as Record<string, any>;

  try {
    const [result] = (await pool.execute(
      `UPDATE quote SET
        importo  = COALESCE(?, importo),
        scadenza = COALESCE(?, scadenza),
        stato    = COALESCE(?, stato),
        nota     = COALESCE(?, nota)
       WHERE id = ? AND society_id = ?`,
      [importo ?? null, scadenza ?? null, stato ?? null, nota ?? null,
       req.params.id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/quote/:id
router.delete("/quote/:id", requireAuth, requireRole("admin", "dirigente"), requirePlan("societa"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    await pool.execute("DELETE FROM quote WHERE id = ? AND society_id = ?", [req.params.id, societyId]);
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/quote/sollecita — sollecito manuale insoluti.
//
// Cablaggio resolver unico per evento quota (Opzione B): le quote vivono nel
// blob FE (state.quotes[]), non in MySQL. Il FE filtra le quote scadute e
// passa la lista al BE che risolve i destinatari via resolveRecipients('quota')
// e invia push web + card blob (addNotificaToBlob con CAS).
//
// NIENTE requirePlan: il sollecito esiste anche su piani non-societa (il
// gating UI lato FE gestisce la visibilita' del bottone). Il cron/check
// automatico al login resta FE (checkQuoteReminders).
//
// Body: { quotes: Array<{ playerId: number, title: string, body: string }> }
// Risposta: { ok: true, sollecitati: number }
router.post("/quote/sollecita",
  requireAuth,
  requireRole("admin", "dirigente", "mister_admin"),
  async (req, res) => {
    const { societyId, userId } = req.jwtUser!;
    const body = req.body as { quotes?: unknown };

    if (!Array.isArray(body?.quotes) || !body!.quotes!.length) {
      return res.status(400).json({ error: "quotes_required", detail: "body.quotes deve essere un array non vuoto" });
    }

    // Sanifica + cap a 500 per evitare abusi
    const items: Array<{ playerId: number; title: string; body: string }> = [];
    for (const raw of body!.quotes!) {
      const pid = Number((raw as any)?.playerId);
      const title = String((raw as any)?.title || "").slice(0, 200);
      const bodyTxt = String((raw as any)?.body || "").slice(0, 500);
      if (!Number.isFinite(pid) || pid <= 0 || !title.trim()) continue;
      items.push({ playerId: pid, title, body: bodyTxt });
      if (items.length >= 500) break;
    }
    if (!items.length) return res.json({ ok: true, sollecitati: 0 });

    let sollecitati = 0;
    for (const q of items) {
      try {
        const ids = await resolveRecipients("quota", {
          societyId,
          playerId: q.playerId,
          senderUserId: userId,
        });
        if (!ids.length) continue;
        // Push web (fire-and-forget) + card blob (addNotificaToBlob ha CAS+retry).
        sendPushToUsers(ids, societyKeyFor(societyId), {
          title: q.title,
          body:  q.body,
          tag:   "quota",
        }).catch((e: any) => logger.warn({ err: e?.message, playerId: q.playerId }, "quote/sollecita: push error"));
        addNotificaToBlob(societyId, ids, {
          type:  "quota",
          title: q.title,
          body:  q.body,
        }).catch(() => { /* gia' loggato dentro helper */ });
        sollecitati++;
      } catch (e: any) {
        logger.warn({ err: e?.message, playerId: q.playerId }, "quote/sollecita: item failed");
      }
    }

    return res.json({ ok: true, sollecitati });
  }
);

export default router;
