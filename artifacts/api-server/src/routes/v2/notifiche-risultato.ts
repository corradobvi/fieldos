import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { sendPushToUsers, societyKeyFor } from "../../lib/push-sender";

const router = Router();

async function getGuardiansForLeva(
  societyId: number,
  leva: string,
  excludeUserId?: number
): Promise<number[]> {
  try {
    let q = `SELECT DISTINCT pg.user_id AS id
             FROM player_guardians pg
             JOIN players p ON p.id = pg.player_id
             JOIN users u ON u.id = pg.user_id
             WHERE p.society_id = ? AND p.leva = ? AND u.stato = 'attivo'`;
    const params: any[] = [societyId, leva];
    if (excludeUserId) { q += " AND pg.user_id != ?"; params.push(excludeUserId); }
    const [rows] = (await pool.execute(q, params)) as [any[], any];
    return rows.map((r: any) => r.id as number);
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
  requireRole("admin", "allenatore", "dirigente", "mister_admin"),
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
