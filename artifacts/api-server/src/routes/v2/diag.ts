import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";

const router = Router();
const SA_SECRET = process.env.SA_SECRET ?? "super123";

// POST /api/v2/superadmin/_diag/cleanup-preview
router.post("/superadmin/_diag/cleanup-preview", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const [societies] = (await pool.execute(
      `SELECT id, nome, citta, piano, billing_mode, subscription_status, demo_scadenza, stato, created_at
       FROM societies WHERE id IN (1, 2, 6, 7, 29, 30) ORDER BY id`
    )) as [any[], any];
    const [users] = (await pool.execute(
      `SELECT id, email, ruolo, society_id, nome, cognome, created_at
       FROM users WHERE society_id IN (1, 2, 6, 7, 29, 30) ORDER BY society_id, id`
    )) as [any[], any];
    const [blobs] = (await pool.execute(
      `SELECT \`key\`, LENGTH(state_json) AS bytes,
         JSON_LENGTH(JSON_EXTRACT(state_json, '$.USERS_DB')) AS n_utenti
       FROM society_state
       WHERE \`key\` IN ('fieldos_state_soc_1','fieldos_state_soc_2','fieldos_state_soc_6','fieldos_state_soc_7','fieldos_state_soc_29','fieldos_state_soc_30')`
    )) as [any[], any];
    const [saRows] = (await pool.execute(
      `SELECT JSON_EXTRACT(state_json, '$.saSocieties') AS societa_list
       FROM society_state WHERE \`key\` = 'fieldos_sa_v1'`
    )) as [any[], any];
    const [corradoUsers] = (await pool.execute(
      `SELECT id, email, society_id, ruolo FROM users WHERE email LIKE 'corradob.vi%'`
    )) as [any[], any];
    const [bannerTest] = (await pool.execute(
      `SELECT s.id as soc_id, s.nome, u.id as user_id, u.email
       FROM societies s LEFT JOIN users u ON u.society_id = s.id
       WHERE s.nome = 'Banner Test Demo'`
    )) as [any[], any];
    logger.info({ endpoint: "cleanup-preview" }, "diag cleanup-preview called");
    return res.json({
      societies_target: societies, users_linked: users, blobs_existing: blobs,
      sa_societies_list: saRows.length ? saRows[0].societa_list : null,
      corrado_users: corradoUsers, banner_test_demo: bannerTest,
    });
  } catch (e: any) {
    logger.error({ err: e }, "cleanup-preview error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

// POST /api/v2/superadmin/_diag/cleanup-execute
router.post("/superadmin/_diag/cleanup-execute", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { confirmDelete, societyIds } = req.body as { confirmDelete?: boolean; societyIds?: number[] };

  if (!confirmDelete || !Array.isArray(societyIds) || societyIds.length === 0) {
    return res.status(400).json({ error: "missing_confirmation", message: "Body deve contenere confirmDelete:true e societyIds:[...]" });
  }

  const SAFE_IDS = [8, 37, 38, 39, 40, 41, 42];
  // Guard: nessun safe id deve essere nella lista di eliminazione
  const intersection = societyIds.filter(id => SAFE_IDS.includes(id));
  if (intersection.length > 0) {
    return res.status(400).json({ error: "safe_society_in_delete_list", safe_ids_found: intersection });
  }

  const conn = await (pool as any).getConnection();
  try {
    await conn.beginTransaction();

    // Verifica pre-delete: conta utenti delle società SAFE (non devono essere toccati)
    const placeholdersSafe = SAFE_IDS.map(() => '?').join(',');
    const [safeBefore] = await conn.execute(
      `SELECT COUNT(*) AS n FROM users WHERE society_id IN (${placeholdersSafe})`,
      SAFE_IDS
    ) as [any[], any];
    const safeCountBefore = safeBefore[0].n;

    // 1. Elimina utenti
    const placeholders = societyIds.map(() => '?').join(',');
    const [delUsers] = await conn.execute(
      `DELETE FROM users WHERE society_id IN (${placeholders})`,
      societyIds
    ) as [any, any];
    const usersDeleted: number = delUsers.affectedRows;

    // 2. Elimina society_state blobs per quelle società
    const blobKeys = societyIds.map(id => `fieldos_state_soc_${id}`);
    const blobPlaceholders = blobKeys.map(() => '?').join(',');
    const [delBlobs] = await conn.execute(
      `DELETE FROM society_state WHERE \`key\` IN (${blobPlaceholders})`,
      blobKeys
    ) as [any, any];
    const blobsDeleted: number = delBlobs.affectedRows;

    // 3. Aggiorna SA blob — rimuovi entries con id nella lista
    const [saRows] = await conn.execute(
      "SELECT state_json FROM society_state WHERE `key` = 'fieldos_sa_v1'"
    ) as [any[], any];
    let saEntriesRemoved = 0;
    if (saRows.length) {
      let saState: any;
      try { saState = JSON.parse(saRows[0].state_json); } catch { saState = {}; }
      const before: any[] = Array.isArray(saState.saSocieties) ? saState.saSocieties : [];
      const after = before.filter((s: any) => !societyIds.includes(s.id));
      saEntriesRemoved = before.length - after.length;
      saState.saSocieties = after;
      await conn.execute(
        "UPDATE society_state SET state_json = ? WHERE `key` = 'fieldos_sa_v1'",
        [JSON.stringify(saState)]
      );
    }

    // 4. Elimina società
    const [delSoc] = await conn.execute(
      `DELETE FROM societies WHERE id IN (${placeholders})`,
      societyIds
    ) as [any, any];
    const societiesDeleted: number = delSoc.affectedRows;

    // Verifica post-delete: i safe non devono essere cambiati
    const [safeAfter] = await conn.execute(
      `SELECT COUNT(*) AS n FROM users WHERE society_id IN (${placeholdersSafe})`,
      SAFE_IDS
    ) as [any[], any];
    const safeCountAfter = safeAfter[0].n;
    if (safeCountAfter !== safeCountBefore) {
      await conn.rollback();
      logger.error({ safeCountBefore, safeCountAfter }, "cleanup-execute ROLLBACK: safe societies touched");
      return res.status(500).json({
        ok: false, error: "safe_societies_touched", rollback: true,
        safeCountBefore, safeCountAfter,
      });
    }

    // Snapshot post-cleanup per verifica
    const [remSocieties] = await conn.execute(
      "SELECT id, nome FROM societies ORDER BY id"
    ) as [any[], any];
    const [remUsers] = await conn.execute(
      "SELECT id, email, society_id FROM users ORDER BY society_id, id"
    ) as [any[], any];

    await conn.commit();

    logger.info({ societyIds, usersDeleted, blobsDeleted, saEntriesRemoved, societiesDeleted }, "cleanup-execute committed");

    return res.json({
      ok: true,
      societies_deleted: societiesDeleted,
      users_deleted: usersDeleted,
      blobs_deleted: blobsDeleted,
      sa_entries_removed: saEntriesRemoved,
      societies_remaining_intact: SAFE_IDS,
      post_cleanup_societies: remSocieties,
      post_cleanup_users: remUsers,
    });
  } catch (e: any) {
    await conn.rollback();
    logger.error({ err: e }, "cleanup-execute ROLLBACK on error");
    return res.status(500).json({ ok: false, error: e?.message, rollback: true });
  } finally {
    conn.release();
  }
});

export default router;
