import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";

const router = Router();
const SA_SECRET = process.env.SA_SECRET ?? "super123";

const SAFE_IDS = [8, 37, 38, 39, 40, 41, 42];

router.post("/superadmin/_diag/cleanup-execute", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { confirmDelete, societyIds } = req.body as { confirmDelete?: boolean; societyIds?: number[] };
  if (!confirmDelete || !Array.isArray(societyIds) || societyIds.length === 0) {
    return res.status(400).json({ error: "missing_confirmation" });
  }
  const intersection = societyIds.filter(id => SAFE_IDS.includes(id));
  if (intersection.length > 0) {
    return res.status(400).json({ error: "safe_society_in_delete_list", safe_ids_found: intersection });
  }

  const conn = await (pool as any).getConnection();
  try {
    await conn.beginTransaction();

    const placeholdersSafe = SAFE_IDS.map(() => '?').join(',');
    const [safeBefore] = await conn.execute(`SELECT COUNT(*) AS n FROM users WHERE society_id IN (${placeholdersSafe})`, SAFE_IDS) as [any[], any];

    const ph = societyIds.map(() => '?').join(',');
    const [delUsers] = await conn.execute(`DELETE FROM users WHERE society_id IN (${ph})`, societyIds) as [any, any];
    const blobKeys = societyIds.map(id => `fieldos_state_soc_${id}`);
    const [delBlobs] = await conn.execute(`DELETE FROM society_state WHERE \`key\` IN (${blobKeys.map(() => '?').join(',')})`, blobKeys) as [any, any];

    const [saRows] = await conn.execute("SELECT state_json FROM society_state WHERE `key` = 'fieldos_sa_v1'") as [any[], any];
    let saEntriesRemoved = 0;
    if (saRows.length) {
      let saState: any;
      try { saState = JSON.parse(saRows[0].state_json); } catch { saState = {}; }
      const before: any[] = Array.isArray(saState.saSocieties) ? saState.saSocieties : [];
      saState.saSocieties = before.filter((s: any) => !societyIds.includes(s.id));
      saEntriesRemoved = before.length - saState.saSocieties.length;
      await conn.execute("UPDATE society_state SET state_json = ? WHERE `key` = 'fieldos_sa_v1'", [JSON.stringify(saState)]);
    }

    const [delSoc] = await conn.execute(`DELETE FROM societies WHERE id IN (${ph})`, societyIds) as [any, any];

    const [safeAfter] = await conn.execute(`SELECT COUNT(*) AS n FROM users WHERE society_id IN (${placeholdersSafe})`, SAFE_IDS) as [any[], any];
    if (safeAfter[0].n !== safeBefore[0].n) {
      await conn.rollback();
      return res.status(500).json({ ok: false, error: "safe_societies_touched", rollback: true });
    }

    const [remSoc] = await conn.execute("SELECT id, nome FROM societies ORDER BY id") as [any[], any];
    const [remUsers] = await conn.execute("SELECT id, email, society_id FROM users ORDER BY society_id, id") as [any[], any];

    await conn.commit();
    logger.info({ societyIds, users: delUsers.affectedRows, societies: delSoc.affectedRows }, "cleanup-execute committed");
    return res.json({
      ok: true,
      societies_deleted: delSoc.affectedRows,
      users_deleted: delUsers.affectedRows,
      blobs_deleted: delBlobs.affectedRows,
      sa_entries_removed: saEntriesRemoved,
      post_cleanup_societies: remSoc,
      post_cleanup_users: remUsers,
    });
  } catch (e: any) {
    await conn.rollback();
    return res.status(500).json({ ok: false, error: e?.message, rollback: true });
  } finally {
    conn.release();
  }
});

export default router;
