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
    const [soc] = await pool.execute(
      `SELECT id, nome, codice FROM societies WHERE id = ?`, [societyId]
    ) as [any[], any];

    const [players] = await pool.execute(
      `SELECT id, nome, cognome, cognome_iniziale, leva, numero, incomplete,
              parental_consent_given_by, parental_consent_at, created_at
       FROM players WHERE society_id = ?
       ORDER BY id DESC LIMIT 30`, [societyId]
    ) as [any[], any];

    // Schema check
    const [schema] = await pool.execute(
      `SHOW COLUMNS FROM players`
    ) as [any[], any];
    const cogSchemaCols = schema.filter((c: any) => c.Field === 'cognome_iniziale' || c.Field === 'incomplete' || c.Field === 'parental_consent_given_by');

    return res.json({
      society: soc[0] || null,
      players,
      schema_cog: cogSchemaCols,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

export default router;
