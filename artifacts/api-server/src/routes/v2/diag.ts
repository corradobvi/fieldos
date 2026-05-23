import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";

const router = Router();
const SA_SECRET = process.env.SA_SECRET ?? "super123";

// POST /api/v2/superadmin/_diag/cleanup-preview
// Endpoint TEMPORANEO — protetto da x-sa-secret — diagnostica read-only per cleanup MySQL
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
    const saList = saRows.length ? saRows[0].societa_list : null;

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
      societies_target: societies,
      users_linked: users,
      blobs_existing: blobs,
      sa_societies_list: saList,
      corrado_users: corradoUsers,
      banner_test_demo: bannerTest,
    });
  } catch (e: any) {
    logger.error({ err: e }, "cleanup-preview error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

export default router;
