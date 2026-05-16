import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";

const router = Router();

const SA_SECRET = process.env.SA_SECRET ?? "super123";

const EXCLUDED_IDS = [99, 99999];

// GET /api/v2/superadmin/societies — lista completa da MySQL, protetta da X-SA-Secret
router.get("/superadmin/societies", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const [rows] = (await pool.execute(
      `SELECT
         s.id,
         s.nome,
         s.citta,
         s.colore_primario   AS colori,
         s.piano,
         s.subscription_status,
         s.demo_scadenza,
         s.stato,
         s.created_at,
         u.email,
         COUNT(DISTINCT u2.id) AS utenti
       FROM societies s
       LEFT JOIN users u  ON u.society_id  = s.id AND u.ruolo = 'admin' AND u.stato = 'attivo'
       LEFT JOIN users u2 ON u2.society_id = s.id AND u2.stato = 'attivo'
       WHERE s.id NOT IN (${EXCLUDED_IDS.join(",")})
       GROUP BY s.id
       ORDER BY s.created_at DESC`
    )) as [any[], any];

    return res.json({ societies: rows });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/societies error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
