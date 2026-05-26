import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

function checkAuth(req: any, res: any): boolean {
  const secret = req.headers["x-sa-secret"];
  const saSecret = process.env.SA_SECRET ?? "super123";
  if (secret !== saSecret) { res.status(401).json({ error: "unauthorized" }); return false; }
  return true;
}

router.get("/superadmin/_diag/push", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const societyId = parseInt(String(req.query.societyId || '38'));
  try {
    const [total] = await pool.execute(`SELECT COUNT(*) AS n FROM push_subscriptions`) as [any[], any];
    const [bySoc] = await pool.execute(
      `SELECT COUNT(*) AS n FROM push_subscriptions WHERE society_key = ?`,
      [`fieldos_state_soc_${societyId}`]
    ) as [any[], any];
    const [sample] = await pool.execute(
      `SELECT id, user_id, society_key, CHAR_LENGTH(subscription) AS sub_size, updated_at
       FROM push_subscriptions ORDER BY id DESC LIMIT 10`
    ) as [any[], any];
    const [socSubs] = await pool.execute(
      `SELECT id, user_id, CHAR_LENGTH(subscription) AS sub_size, updated_at
       FROM push_subscriptions WHERE society_key = ? ORDER BY id`,
      [`fieldos_state_soc_${societyId}`]
    ) as [any[], any];
    const [bySocAll] = await pool.execute(
      `SELECT society_key, COUNT(*) AS n FROM push_subscriptions GROUP BY society_key ORDER BY n DESC`
    ) as [any[], any];
    return res.json({
      total: total[0].n,
      by_society_38: bySoc[0].n,
      by_society_all: bySocAll,
      society_38_subs: socSubs,
      sample_recent: sample,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

export default router;
