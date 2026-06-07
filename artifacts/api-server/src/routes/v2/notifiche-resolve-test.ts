// [DIAG] Endpoint TEMPORANEO per verificare il nuovo resolveRecipients.
// Da rimuovere prima del 2026-08-01.
//
// Auth: requireAuth + requireRole(admin/mister_admin) + same-society guard.
// Nessuna push inviata: ritorna SOLO la lista di userId con ruolo + leva
// che resolveRecipients restituirebbe.
//
// GET /api/v2/notifiche/_resolve-test
//   ?eventType=<RecipientEvent>
//   [&leva=U11]
//   [&playerId=123]
//   [&chatId=staff_U11]
//   [&convocati=1,2,3]           (CSV → convocatiPlayerIds)
//   [&directUsers=4,5,6]         (CSV → directUserIds)
//   [&senderUserId=7]            (default: userId del JWT)

import { Router, Request, Response } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";
import { resolveRecipients, RecipientContext } from "../../lib/recipient-resolver";

const router = Router();

function _gate(req: Request, res: Response): { societyId: number; userId: number } | null {
  const j = req.jwtUser!;
  if (j.role !== "admin" && j.role !== "mister_admin") {
    res.status(403).json({ error: "forbidden", detail: "admin/mister_admin only" });
    return null;
  }
  return { societyId: j.societyId, userId: j.userId };
}

function _csv(v: any): number[] {
  if (!v) return [];
  return String(v)
    .split(",")
    .map(s => parseInt(s.trim(), 10))
    .filter(n => Number.isFinite(n) && n > 0);
}

router.get("/notifiche/_resolve-test", requireAuth, async (req, res) => {
  const ctx0 = _gate(req, res); if (!ctx0) return;
  const { societyId, userId } = ctx0;

  const eventType = String(req.query.eventType || "").trim();
  if (!eventType) {
    return res.status(400).json({ error: "eventType_required" });
  }

  const senderQ = Number(req.query.senderUserId);
  const senderUserId = Number.isFinite(senderQ) && senderQ > 0 ? senderQ : userId;

  const ctx: RecipientContext = {
    societyId,
    leva: req.query.leva ? String(req.query.leva) : null,
    playerId: req.query.playerId ? parseInt(String(req.query.playerId), 10) : null,
    chatId: req.query.chatId ? String(req.query.chatId) : null,
    convocatiPlayerIds: _csv(req.query.convocati),
    directUserIds: _csv(req.query.directUsers),
    senderUserId,
  };

  try {
    const ids = await resolveRecipients(eventType, ctx);

    // Arricchimento read-only: ruolo + leva per ciascun id (no SELECT massivo se vuoto).
    let details: any[] = [];
    if (ids.length) {
      const ph = ids.map(() => "?").join(",");
      const [rows] = (await pool.execute(
        `SELECT id, nome, cognome, ruolo, leva, stato
           FROM users WHERE society_id = ? AND id IN (${ph})
           ORDER BY ruolo, cognome, nome`,
        [societyId, ...ids]
      )) as [any[], any];
      details = (rows as any[]).map(r => ({
        id: Number(r.id),
        nome: r.nome,
        cognome: r.cognome,
        ruolo: r.ruolo,
        leva: r.leva,
        stato: r.stato,
      }));
    }

    return res.json({
      input: { eventType, ctx },
      recipients_count: ids.length,
      recipients_ids: ids,
      recipients_detail: details,
      note: "[DIAG] read-only test endpoint, nessuna push inviata",
    });
  } catch (e: any) {
    logger.error({ err: e?.message, eventType }, "_resolve-test error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

export default router;
