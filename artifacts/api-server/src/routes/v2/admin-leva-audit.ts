// ─────────────────────────────────────────────────────────────────────────────
// TEMPORANEO — diagnostico read-only per progettare il guard leva server-side.
// GET /api/v2/admin/leva-audit
//
// Da RIMUOVERE nel commit del guard. Nessun parametro client: scopa SEMPRE su
// req.jwtUser.societyId. Demo society negate.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";

const router = Router();

const DEMO_SOC_IDS = new Set<number>([0, 99, 99999]);
function rejectDemo(req: any, res: any): boolean {
  const sid = req.jwtUser?.societyId;
  if (typeof sid !== "number" || DEMO_SOC_IDS.has(sid)) {
    res.status(400).json({ error: "demo_society_not_allowed" });
    return true;
  }
  return false;
}

router.get(
  "/admin/leva-audit",
  requireAuth,
  requireRole("admin", "allenatore", "dirigente", "preparatore_portieri", "mister_admin"),
  async (req, res) => {
    if (rejectDemo(req, res)) return;
    const { societyId, userId, role } = req.jwtUser!;
    try {
      const [staff] = (await pool.execute(
        `SELECT id, ruolo, leva, stato, email
           FROM users
          WHERE society_id = ?
            AND ruolo IN ('admin','allenatore','dirigente','preparatore_portieri','mister_admin')
          ORDER BY ruolo, cognome, nome`,
        [societyId]
      )) as [any[], any];

      const [leve_matches] = (await pool.execute(
        "SELECT DISTINCT leva FROM matches WHERE societa_id = ? ORDER BY leva",
        [societyId]
      )) as [any[], any];

      const [leve_campionato] = (await pool.execute(
        "SELECT DISTINCT leva FROM campionato_settings WHERE societa_id = ? ORDER BY leva",
        [societyId]
      )) as [any[], any];

      const [leve_tornei] = (await pool.execute(
        "SELECT DISTINCT leva FROM tornei WHERE societa_id = ? ORDER BY leva",
        [societyId]
      )) as [any[], any];

      // Tabella leve: convenzione schema.ts → society_id (non societa_id)
      const [leve_tabella] = (await pool.execute(
        "SELECT id, nome FROM leve WHERE society_id = ? ORDER BY ordine, nome",
        [societyId]
      )) as [any[], any];

      const [amichevoli_senza_leva] = (await pool.execute(
        `SELECT id, data, avversario
           FROM matches
          WHERE societa_id = ?
            AND tipo = 'amichevole'
            AND (leva IS NULL OR leva = '')
          ORDER BY data DESC`,
        [societyId]
      )) as [any[], any];

      return res.json({
        me: { userId, role, societyId },
        staff,
        leve_matches:    (leve_matches as any[]).map((r: any) => r.leva),
        leve_campionato: (leve_campionato as any[]).map((r: any) => r.leva),
        leve_tornei:     (leve_tornei as any[]).map((r: any) => r.leva),
        leve_tabella,
        amichevoli_senza_leva,
      });
    } catch (e: any) {
      logger.error({ err: e?.message }, "GET admin/leva-audit error");
      return res.status(500).json({ error: "server_error", detail: e?.message });
    }
  }
);

export default router;
