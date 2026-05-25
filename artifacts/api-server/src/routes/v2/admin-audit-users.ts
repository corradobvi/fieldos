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

    // Q7: dettaglio utenti MySQL per Baiardo (stato esatto, password presente, privacy)
    const [q7] = await pool.execute(`
      SELECT id, email, nome, cognome, ruolo, society_id, stato,
             CHAR_LENGTH(password_hash) AS pwd_len,
             privacy_accepted_at, is_account_owner
      FROM users WHERE society_id = 40
    `) as [any[], any];

    // Q8: simula esattamente la query del _mysqlPrivacyCheck per info@baiardo.it
    const [q8] = await pool.execute(
      `SELECT id, email, society_id, stato, privacy_accepted_at, is_account_owner
       FROM users
       WHERE LOWER(email) = ? AND society_id = ? AND stato = 'attivo'
       LIMIT 1`,
      ['info@baiardo.it', 40]
    ) as [any[], any];

    // Q5: blob state keys per identificare utenti legacy non migrati
    const [q5] = await pool.execute(`
      SELECT \`key\`, CHAR_LENGTH(state_json) AS blob_size, updated_at
      FROM society_state
      WHERE \`key\` LIKE 'fieldos_state_soc_40%'
         OR \`key\` LIKE '%polis%'
         OR \`key\` = 'fieldos_state_v1'
      ORDER BY \`key\`
      LIMIT 30
    `) as [any[], any];

    // Q6: blob state di Baiardo e di Polis — estrai utenti
    const blobUsers: any = { baiardo: [], polis: [] };
    for (const r of q5) {
      try {
        const [stateRow] = await pool.execute(
          `SELECT state_json FROM society_state WHERE \`key\` = ? LIMIT 1`,
          [r.key]
        ) as [any[], any];
        if (!stateRow.length) continue;
        const state = JSON.parse(stateRow[0].state_json);
        const users = Array.isArray(state.USERS_DB) ? state.USERS_DB : [];
        const summary = users.map((u: any) => ({
          id: u.id, email: u.email, nome: u.nome, cogn: u.cogn,
          role: u.role, stato: u.stato, password_hash_present: !!u.password_hash,
        }));
        if (String(r.key).includes('soc_40')) blobUsers.baiardo.push({ key: r.key, users: summary });
        else if (String(r.key).toLowerCase().includes('polis')) blobUsers.polis.push({ key: r.key, users: summary });
        else blobUsers[r.key] = summary;
      } catch (_) {}
    }

    logger.info({ q1: q1.length, q2: q2.length, q3: q3.length, q4: q4.length, q5: q5.length }, "admin: audit-users");
    return res.json({
      q1_test_misterpro: q1,
      q2_baiardo:        q2,
      q3_polis:          q3,
      q4_societies_counts: q4,
      q5_blob_keys:      q5,
      q6_blob_users:     blobUsers,
      q7_baiardo_users_detail: q7,
      q8_simulate_privacy_check_baiardo: q8,
    });
  } catch (e: any) {
    logger.error({ err: e }, "admin: audit-users failed");
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

export default router;
