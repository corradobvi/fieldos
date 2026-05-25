import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";

const router = Router();

function checkAuth(req: any, res: any): boolean {
  const secret   = req.headers["x-admin-secret"];
  const saSecret = process.env.ADMIN_RESET_SECRET;
  if (!saSecret || secret !== saSecret) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

// GET /api/v2/_admin/audit-users-baiardo-polis
router.get("/_admin/audit-users-baiardo-polis", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    // Q1: Test MisterPro
    const [q1] = await pool.execute(`
      SELECT u.id, u.email, u.ruolo AS role, u.society_id, s.nome AS societa_nome,
             s.piano, s.subscription_status, s.stato
      FROM users u
      LEFT JOIN societies s ON s.id = u.society_id
      WHERE u.email LIKE '%testmister%' OR u.email LIKE '%test.misterpro%'
      LIMIT 10
    `) as [any[], any];

    // Q2: Baiardo
    const [q2] = await pool.execute(`
      SELECT u.id, u.email, u.ruolo AS role, u.society_id, s.nome AS societa_nome,
             s.piano, s.subscription_status, s.stato
      FROM users u
      LEFT JOIN societies s ON s.id = u.society_id
      WHERE s.nome LIKE '%aiardo%' OR u.email LIKE '%federico%'
      LIMIT 20
    `) as [any[], any];

    // Q3: Polis
    const [q3] = await pool.execute(`
      SELECT u.id, u.email, u.ruolo AS role, u.society_id, s.nome AS societa_nome,
             s.piano, s.subscription_status, s.stato
      FROM users u
      LEFT JOIN societies s ON s.id = u.society_id
      WHERE u.email = 'mister@polis.it' OR s.nome LIKE '%olis%'
      LIMIT 20
    `) as [any[], any];

    // Q4: Conta utenti per società
    const [q4] = await pool.execute(`
      SELECT s.id, s.nome, s.piano, s.subscription_status, s.stato,
             COUNT(u.id) AS num_users,
             SUM(u.ruolo = 'allenatore' OR u.ruolo = 'mister_admin') AS num_misters,
             SUM(u.ruolo = 'admin') AS num_admins
      FROM societies s
      LEFT JOIN users u ON u.society_id = s.id
      WHERE s.nome LIKE '%aiardo%' OR s.nome LIKE '%olis%'
         OR s.nome LIKE '%MisterPro%' OR s.nome LIKE '%test%'
         OR s.id IN (38, 40, 41)
      GROUP BY s.id, s.nome, s.piano, s.subscription_status, s.stato
      ORDER BY s.id
    `) as [any[], any];

    logger.info({ q1: q1.length, q2: q2.length, q3: q3.length, q4: q4.length }, "admin: audit-users");
    return res.json({
      q1_test_misterpro: q1,
      q2_baiardo:        q2,
      q3_polis:          q3,
      q4_societies_counts: q4,
    });
  } catch (e: any) {
    logger.error({ err: e }, "admin: audit-users failed");
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

export default router;
