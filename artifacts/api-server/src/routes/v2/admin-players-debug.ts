import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

function checkAuth(req: any, res: any): boolean {
  const secret = req.headers["x-sa-secret"];
  const saSecret = process.env.SA_SECRET ?? "super123";
  if (secret !== saSecret) { res.status(401).json({ error: "unauthorized" }); return false; }
  return true;
}

// GET /api/v2/superadmin/_diag/players?societyId=38
router.get("/superadmin/_diag/players", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const societyId = parseInt(String(req.query.societyId || '38'));
  try {
    const [players] = await pool.execute(
      `SELECT id, nome, cognome, cognome_iniziale, leva, numero, incomplete,
              approval_status, birth_date, created_at
       FROM players WHERE society_id = ? ORDER BY id DESC LIMIT 30`, [societyId]
    ) as [any[], any];
    const [schema] = await pool.execute(
      `SHOW COLUMNS FROM players WHERE Field IN ('approval_status','incomplete','cognome','birth_date')`
    ) as [any[], any];
    const [guardians] = await pool.execute(
      `SELECT pg.id, pg.player_id, pg.user_id, pg.role, pg.consent_given, pg.consent_at,
              u.email AS guardian_email, u.nome AS guardian_nome
       FROM player_guardians pg
       LEFT JOIN users u ON u.id = pg.user_id
       WHERE pg.player_id IN (SELECT id FROM players WHERE society_id = ?)`, [societyId]
    ) as [any[], any];
    return res.json({ players, schema, guardians });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

export default router;
