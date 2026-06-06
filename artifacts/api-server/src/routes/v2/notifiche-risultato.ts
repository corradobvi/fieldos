import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { sendPushToUsers, societyKeyFor } from "../../lib/push-sender";
import { _levaMatchClause } from "../../lib/leva-match";

const router = Router();

// Destinatari notifica risultato = SOLO genitori/nonni della leva.
// PATH 1: GDPR moderno via player_guardians (pg.user_id → users).
// PATH 2: legacy via users.leva valorizzato (no player_guardians) usando lo stesso
// _levaMatchClause della chat (exact/prefix/JSON-array/Tutte/null/''). Senza PATH 2,
// i genitori legacy NON risultavano destinatari e la push non arrivava — sintomo
// "risultato non notificato ai genitori" anche dopo il fix push-sender (perche'
// quel helper NON e' usato da questo endpoint, ha una query locale).
async function getGuardiansForLeva(
  societyId: number,
  leva: string,
  excludeUserId?: number
): Promise<number[]> {
  try {
    // PATH 1 — player_guardians (flusso /claim GDPR).
    let q1 = `SELECT DISTINCT pg.user_id AS id
             FROM player_guardians pg
             JOIN players p ON p.id = pg.player_id
             JOIN users u ON u.id = pg.user_id
             WHERE p.society_id = ? AND p.leva = ? AND u.stato = 'attivo'
               AND u.ruolo IN ('genitore','nonno')`;
    const p1: any[] = [societyId, leva];
    if (excludeUserId) { q1 += " AND pg.user_id != ?"; p1.push(excludeUserId); }
    const [r1] = (await pool.execute(q1, p1)) as [any[], any];

    // PATH 2 — legacy via users.leva. Stesso match della chat (multi-leva, prefix, ecc.).
    const lc = _levaMatchClause(leva);
    let q2 = `SELECT id FROM users
             WHERE society_id = ? AND stato = 'attivo'
               AND ruolo IN ('genitore','nonno')
               AND ${lc.sql}`;
    const p2: any[] = [societyId, ...lc.params];
    if (excludeUserId) { q2 += " AND id != ?"; p2.push(excludeUserId); }
    const [r2] = (await pool.execute(q2, p2)) as [any[], any];

    // Dedup union: stessi utenti registrati in entrambi i path non vengono spammati.
    const ids = new Set<number>();
    for (const r of (r1 as any[])) ids.add(Number(r.id));
    for (const r of (r2 as any[])) ids.add(Number(r.id));
    return Array.from(ids);
  } catch (e: any) {
    logger.warn({ err: e?.message }, "notifiche-risultato: getGuardiansForLeva error");
    return [];
  }
}

// POST /api/v2/notifiche/risultato-partita
// Body: { leva, title, body }  — societyId è preso dal JWT, lista destinatari risolta server-side
router.post(
  "/notifiche/risultato-partita",
  requireAuth,
  requireRole("admin", "allenatore", "mister", "dirigente", "mister_admin"),
  async (req, res) => {
    const { societyId, userId } = req.jwtUser!;
    const { leva, title, body } = req.body as Record<string, any>;

    if (!leva || !title) return res.status(400).json({ error: "leva_title_required" });
    if (String(title).length > 200 || String(body || "").length > 500) {
      return res.status(400).json({ error: "payload_too_large" });
    }

    try {
      const ids = await getGuardiansForLeva(societyId, String(leva), userId);
      if (!ids.length) return res.json({ ok: true, sent: 0, recipients: 0 });

      const result = await sendPushToUsers(ids, societyKeyFor(societyId), {
        title: String(title),
        body: String(body || ""),
        tag: `risultato-${leva}`,
      });

      return res.json({ ok: true, recipients: ids.length, sent: result.sent, errors: result.errors });
    } catch (e: any) {
      logger.error({ err: e?.message }, "POST notifiche/risultato-partita error");
      return res.status(500).json({ error: "server_error" });
    }
  }
);

export default router;
