import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { signJWT, hashPassword } from "../../lib/auth";

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
    // Q9: simula login Federico Verni Baiardo — genera v2Token come farebbe il backend live
    let q9_simulate_login_baiardo: any = null;
    try {
      const [r] = await pool.execute(
        `SELECT id, society_id FROM users
         WHERE LOWER(email) = ? AND society_id = ? AND stato = 'attivo' LIMIT 1`,
        ['info@baiardo.it', 40]
      ) as [any[], any];
      if (r.length) {
        const token = signJWT({ userId: r[0].id, societyId: 40, role: 'admin', email: 'info@baiardo.it' });
        q9_simulate_login_baiardo = {
          would_receive_v2Token: !!token,
          token_prefix:          token ? token.slice(0, 25) + '...' : null,
          token_length:          token ? token.length : 0,
          jwt_secret_present:    !!process.env.JWT_SECRET,
          jwt_secret_length:     (process.env.JWT_SECRET || '').length,
        };
      } else {
        q9_simulate_login_baiardo = { error: "user not found in users MySQL" };
      }
    } catch (e: any) {
      q9_simulate_login_baiardo = { error: e?.message };
    }

    // Q10: cerca mister@polis.it in TUTTI i blob della tabella society_state
    const [q10] = await pool.execute(`
      SELECT \`key\`, CHAR_LENGTH(state_json) AS blob_size
      FROM society_state
      WHERE state_json LIKE '%mister@polis.it%'
         OR \`key\` LIKE '%polis%'
         OR \`key\` = 'fieldos_state_v1'
      LIMIT 20
    `) as [any[], any];

    return res.json({
      q1_test_misterpro: q1,
      q2_baiardo:        q2,
      q3_polis:          q3,
      q4_societies_counts: q4,
      q5_blob_keys:      q5,
      q6_blob_users:     blobUsers,
      q7_baiardo_users_detail: q7,
      q8_simulate_privacy_check_baiardo: q8,
      q9_simulate_login_baiardo,
      q10_polis_blobs:   q10,
      q11_full_users:    await (async () => {
        const out: any = {};
        for (const k of ['fieldos_state_soc_40', 'fieldos_state_soc_5', 'fieldos_state_v1']) {
          try {
            const [r] = await pool.execute(`SELECT state_json FROM society_state WHERE \`key\` = ? LIMIT 1`, [k]) as [any[], any];
            if (!r.length) { out[k] = '(blob not found)'; continue; }
            const state = JSON.parse(r[0].state_json);
            const users = Array.isArray(state.USERS_DB) ? state.USERS_DB : [];
            out[k] = users.map((u: any) => ({
              email: u.email, nome: u.nome, cogn: u.cogn, role: u.role,
              has_pass: !!u.pass, pass_len: u.pass ? String(u.pass).length : 0,
              nomeSocieta: state.nomeSocieta,
            }));
          } catch (e: any) { out[k] = { error: e?.message }; }
        }
        return out;
      })(),
    });
  } catch (e: any) {
    logger.error({ err: e }, "admin: audit-users failed");
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

// POST /api/v2/_admin/migrate-polis
// Migra società Polis Genova (blob soc_5) in tabelle MySQL societies + users
// Idempotente: skip insert se row già esiste
router.post("/_admin/migrate-polis", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const [blobRow] = await pool.execute(
      `SELECT state_json FROM society_state WHERE \`key\` = ? LIMIT 1`,
      ['fieldos_state_soc_5']
    ) as [any[], any];
    if (!blobRow.length) return res.status(404).json({ error: "blob soc_5 not found" });
    const state = JSON.parse(blobRow[0].state_json);
    const blobUsers = Array.isArray(state.USERS_DB) ? state.USERS_DB : [];

    // Step 1: insert society id=5 if missing
    const [existSoc] = await pool.execute(
      `SELECT id FROM societies WHERE id = 5 LIMIT 1`
    ) as [any[], any];
    let societyAction = 'already_exists';
    if (!existSoc.length) {
      await pool.execute(
        `INSERT INTO societies (id, nome, citta, piano, subscription_status, stato)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [5, state.nomeSocieta || 'Polis Genova', state.cittaSocieta || null,
         'mister_pro', 'demo', 'attiva']
      );
      societyAction = 'inserted';
    }

    // Step 2: insert users one-by-one (skip if email+society_id already exists)
    const userResults: any[] = [];
    for (const u of blobUsers) {
      if (!u.email || !u.role) continue;
      const email = String(u.email).toLowerCase().trim();
      const [existU] = await pool.execute(
        `SELECT id FROM users WHERE LOWER(email) = ? AND society_id = ? LIMIT 1`,
        [email, 5]
      ) as [any[], any];
      if (existU.length) {
        userResults.push({ email, action: 'already_exists', id: existU[0].id });
        continue;
      }
      const passHash = u.pass ? hashPassword(String(u.pass)) : hashPassword(Math.random().toString(36));
      const [ins] = await pool.execute(
        `INSERT INTO users (society_id, nome, cognome, email, password_hash, ruolo, stato)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [5, u.nome || '', u.cogn || '', email, passHash, u.role, 'attivo']
      ) as [any, any];
      userResults.push({ email, action: 'inserted', id: ins.insertId, role: u.role });
    }

    logger.info({ society: societyAction, users: userResults.length }, "admin: migrate-polis done");
    return res.json({ ok: true, society: societyAction, users: userResults });
  } catch (e: any) {
    logger.error({ err: e }, "admin: migrate-polis failed");
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

export default router;
