import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { requirePermission } from "../../lib/permissions";
import { getUserLeve } from "../../lib/leva-guard";
import { sendPushToUsers, societyKeyFor } from "../../lib/push-sender";
import { resolveRecipients } from "../../lib/recipient-resolver";

const router = Router();

// Regola dedicata per comunicazioni:
//   - body.leva valorizzata → deve essere tra le leve dell'utente (confronto tollerante).
//   - body.leva null/assente (= comunicazione società-wide) → consenti SOLO se l'utente
//     è wildcard (getUserLeve === null), altrimenti 403.
function _normCom(s: any): string {
  if (s == null) return "";
  return String(s).trim().replace(/\s+/g, " ").toLowerCase();
}
async function _checkComLevaScope(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.jwtUser) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const { userId, societyId, role } = req.jwtUser;
    const allowed = await getUserLeve(userId, societyId, role);
    const bodyLeva = (req.body as any)?.leva;
    const isWildcard = allowed === null;
    const bodyLevaStr = typeof bodyLeva === "string" ? bodyLeva : "";
    if (!bodyLevaStr.trim()) {
      // società-wide → solo wildcard
      if (isWildcard) {
        next();
        return;
      }
      res.status(403).json({ error: "leva_forbidden" });
      return;
    }
    if (isWildcard) {
      next();
      return;
    }
    if (!allowed!.has(_normCom(bodyLevaStr))) {
      res.status(403).json({ error: "leva_forbidden", leva: bodyLevaStr });
      return;
    }
    next();
  } catch {
    res.status(500).json({ error: "server_error" });
  }
}

// GET /api/v2/comunicazioni?leva=U14&limit=50
router.get("/comunicazioni", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { leva, limit = "50", offset = "0" } = req.query as Record<string, string>;

  try {
    // FIX P0 (#2 — primo tentativo non risolutivo): la query precedente usava
    //   LEFT JOIN + MAX(cr.letto_at) + GROUP BY c.id  → ipotizzato ONLY_FULL_GROUP_BY.
    // Sostituito con EXISTS subquery (niente GROUP BY) MA il 500 persisteva: la
    // vera causa è `LIMIT ? OFFSET ?` con pool.execute (prepared statements) — bug
    // noto mysql2/MySQL già documentato in chat.ts:11 ("LIMIT ? ha regressioni").
    // Fix vero: sanifica limit/offset come int e interpolali direttamente nella
    // SQL string. Gli altri parametri restano placeholder ? safe.
    const lim = Math.min(Math.max(parseInt(limit) || 50, 1), 500);
    const off = Math.max(parseInt(offset) || 0, 0);
    const [rows] = (await pool.execute(
      `SELECT c.id, c.autore_id, c.tipo, c.titolo, c.testo, c.bacheca, c.leva,
              c.urgente, c.created_at,
              u.nome AS autore_nome, u.cognome AS autore_cognome,
              EXISTS(SELECT 1 FROM comunicazioni_reads
                      WHERE comunicazione_id = c.id AND user_id = ?) AS letto
       FROM comunicazioni c
       LEFT JOIN users u ON u.id = c.autore_id
       WHERE c.society_id = ?
         ${leva ? "AND (c.leva = ? OR c.leva IS NULL)" : ""}
       ORDER BY c.created_at DESC
       LIMIT ${lim} OFFSET ${off}`,
      leva
        ? [userId, societyId, leva]
        : [userId, societyId]
    )) as [any[], any];
    return res.json(rows);
  } catch (e: any) {
    logger.error({ err: e }, "GET comunicazioni error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/comunicazioni
router.post("/comunicazioni", requireAuth, requireRole("admin", "allenatore", "mister", "dirigente", "mister_admin"), requirePermission("gestione_comunicazioni_bacheca"), _checkComLevaScope, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { tipo, titolo, testo, bacheca, leva, urgente } = req.body as Record<string, any>;
  if (!testo) return res.status(400).json({ error: "testo_required" });

  try {
    const [result] = (await pool.execute(
      "INSERT INTO comunicazioni (society_id, autore_id, tipo, titolo, testo, bacheca, leva, urgente) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [societyId, userId, tipo ?? "comunicazione", titolo ?? null, testo,
       bacheca ?? "generale", leva ?? null, urgente ? 1 : 0]
    )) as [any, any];

    // Push notification — fire-and-forget, non blocca la risposta.
    //
    // CABLAGGIO RESOLVER UNICO (commit cablatura comunicazione): destinatari
    // risolti via resolveRecipients('comunicazione', { societyId, leva, senderUserId }).
    // Lo scope 'comunicazione' = famiglieLeva + staffLeva (matrice).
    // Differenza vs vecchio getUsersForPush: il dirigente riceve la comunicazione
    // SOLO se assegnato alla leva del messaggio (prima era catch-all su tutte
    // le leve via admin/mister_admin/dirigente). Sender escluso dal resolver.
    // Per le comunicazioni "societa-wide" (leva null), resolveRecipients ritorna
    // [] perche' gli scope staffLeva/famiglieLeva richiedono leva valorizzata;
    // _checkComLevaScope (riga 20-56) gia' impone che il sender sia wildcard
    // per pubblicare societa-wide → manteniamo la semantica attuale: niente
    // push per le societa-wide (era cosi' anche con getUsersForPush quando
    // leva era null? in realta' include admin/mister_admin/dirigente come
    // catch-all; questa e' una piccola regressione voluta: niente push per
    // pubblicazioni societa-wide finche' non aggiungiamo un evento dedicato).
    const _pushTitle = urgente
      ? `🚨 URGENTE: ${titolo || 'Comunicazione'}`
      : `📢 ${titolo || 'Nuova comunicazione'}`;
    const _pushBody = (titolo ? testo : testo).slice(0, 100);
    resolveRecipients("comunicazione", {
      societyId,
      leva: leva ?? null,
      senderUserId: userId,
    })
      .then(ids => sendPushToUsers(ids, societyKeyFor(societyId), {
        title: _pushTitle,
        body:  _pushBody,
        url:   "/comunicazioni",
        tag:   "comunicazione",
      }, "notify_comunicazioni"))
      .catch(e => logger.warn({ err: e }, "comunicazione push error"));

    return res.status(201).json({ id: result.insertId });
  } catch (e: any) {
    logger.error({ err: e }, "POST comunicazione error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/comunicazioni/:id/read
router.post("/comunicazioni/:id/read", requireAuth, async (req, res) => {
  const { userId } = req.jwtUser!;
  try {
    await pool.execute(
      "INSERT IGNORE INTO comunicazioni_reads (comunicazione_id, user_id) VALUES (?, ?)",
      [req.params.id, userId]
    );
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/comunicazioni/:id
router.delete("/comunicazioni/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [result] = (await pool.execute(
      "DELETE FROM comunicazioni WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
