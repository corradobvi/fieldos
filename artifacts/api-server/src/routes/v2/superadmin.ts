import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { hashPassword } from "../../lib/auth";
import { sendPasswordResetEmail, sendSuspendEmail, sendReactivateEmail, sendDemoExtendedEmail } from "../../lib/email";

const router = Router();

const SA_SECRET = process.env.SA_SECRET ?? "super123";

const EXCLUDED_IDS = [99, 99999];

function _generateTempPassword(): string {
  const upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower   = "abcdefghjkmnpqrstuvwxyz";
  const digits  = "23456789";
  const special = "!@#$";
  const all = upper + lower + digits + special;
  const chars = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  while (chars.length < 8) chars.push(all[Math.floor(Math.random() * all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

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
       GROUP BY s.id, s.nome, s.citta, s.colore_primario, s.piano, s.subscription_status, s.demo_scadenza, s.stato, s.created_at, u.email
       ORDER BY s.created_at DESC`
    )) as [any[], any];

    return res.json({ societies: rows });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/societies error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/superadmin/reset-password — reset password admin di una società
router.post("/superadmin/reset-password", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { email } = req.body as { email?: string; societyId?: number };
  if (!email) return res.status(400).json({ error: "missing_email" });

  try {
    const [rows] = (await pool.execute(
      `SELECT u.id, u.nome, u.cognome, u.email, s.nome AS society_nome
       FROM users u JOIN societies s ON s.id = u.society_id
       WHERE LOWER(u.email) = ? AND u.stato = 'attivo'
       LIMIT 1`,
      [email.trim().toLowerCase()]
    )) as [any[], any];

    if (!rows.length) return res.status(404).json({ error: "user_not_found" });
    const user = rows[0];

    const tempPass = _generateTempPassword();
    const hash = hashPassword(tempPass);

    await pool.execute(
      `UPDATE users SET password_hash = ?, temp_password = 1 WHERE id = ?`,
      [hash, user.id]
    );

    await sendPasswordResetEmail({
      email: user.email,
      nome: user.nome,
      cognome: user.cognome,
      nomeSocieta: user.society_nome,
      tempPass,
    });

    logger.info({ userId: user.id, email: user.email }, "superadmin password reset");
    // Audit log
    await pool.execute(
      `INSERT INTO sa_audit_log (action, target_society_id, target_email) VALUES (?, ?, ?)`,
      ["password_reset", null, user.email]
    ).catch(() => {});
    return res.json({ ok: true, email: user.email });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/reset-password error");
    return res.status(500).json({ error: "server_error" });
  }
});

// Helper: get admin user info for a society
async function getSocietyAdmin(societyId: number) {
  const [rows] = (await pool.execute(
    `SELECT u.id, u.nome, u.cognome, u.email, s.nome AS society_nome, s.demo_scadenza
     FROM users u JOIN societies s ON s.id = u.society_id
     WHERE u.society_id = ? AND u.ruolo = 'admin' AND u.stato = 'attivo'
     LIMIT 1`,
    [societyId]
  )) as [any[], any];
  return rows[0] ?? null;
}

// POST /api/v2/superadmin/societies/:id/suspend
router.post("/superadmin/societies/:id/suspend", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) return res.status(401).json({ error: "unauthorized" });
  const societyId = parseInt(req.params.id);
  if (isNaN(societyId)) return res.status(400).json({ error: "invalid_id" });
  const { reason } = req.body as { reason?: string };

  try {
    await pool.execute(
      `UPDATE societies SET stato = 'sospesa', suspended_at = NOW(), suspended_reason = ? WHERE id = ?`,
      [reason || null, societyId]
    );
    const admin = await getSocietyAdmin(societyId);
    if (admin) {
      await sendSuspendEmail({ email: admin.email, nome: admin.nome, cognome: admin.cognome, nomeSocieta: admin.society_nome, reason });
    }
    await pool.execute(
      `INSERT INTO sa_audit_log (action, target_society_id, target_email, reason) VALUES (?, ?, ?, ?)`,
      ["suspend", societyId, admin?.email ?? null, reason || null]
    ).catch(() => {});
    logger.info({ societyId, reason }, "society suspended");
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/suspend error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/superadmin/societies/:id/reactivate
router.post("/superadmin/societies/:id/reactivate", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) return res.status(401).json({ error: "unauthorized" });
  const societyId = parseInt(req.params.id);
  if (isNaN(societyId)) return res.status(400).json({ error: "invalid_id" });

  try {
    await pool.execute(
      `UPDATE societies SET stato = 'attiva', suspended_at = NULL, suspended_reason = NULL WHERE id = ?`,
      [societyId]
    );
    const admin = await getSocietyAdmin(societyId);
    if (admin) {
      await sendReactivateEmail({ email: admin.email, nome: admin.nome, cognome: admin.cognome, nomeSocieta: admin.society_nome });
    }
    await pool.execute(
      `INSERT INTO sa_audit_log (action, target_society_id, target_email) VALUES (?, ?, ?)`,
      ["reactivate", societyId, admin?.email ?? null]
    ).catch(() => {});
    logger.info({ societyId }, "society reactivated");
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/reactivate error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/superadmin/societies/:id/extend-demo
router.post("/superadmin/societies/:id/extend-demo", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) return res.status(401).json({ error: "unauthorized" });
  const societyId = parseInt(req.params.id);
  if (isNaN(societyId)) return res.status(400).json({ error: "invalid_id" });
  const { days, reason } = req.body as { days?: number; reason?: string };
  const daysNum = parseInt(String(days));
  if (isNaN(daysNum) || daysNum < 1 || daysNum > 60) return res.status(400).json({ error: "invalid_days" });

  try {
    const [socRows] = (await pool.execute(
      `SELECT demo_scadenza FROM societies WHERE id = ?`, [societyId]
    )) as [any[], any];
    if (!socRows.length) return res.status(404).json({ error: "not_found" });

    const current = socRows[0].demo_scadenza;
    const base = current && new Date(current) > new Date() ? new Date(current) : new Date();
    base.setDate(base.getDate() + daysNum);
    const newExpiresAt = base;

    await pool.execute(
      `UPDATE societies SET demo_scadenza = ? WHERE id = ?`,
      [newExpiresAt, societyId]
    );

    const admin = await getSocietyAdmin(societyId);
    if (admin) {
      await sendDemoExtendedEmail({ email: admin.email, nome: admin.nome, cognome: admin.cognome, nomeSocieta: admin.society_nome, days: daysNum, newExpiresAt });
    }
    await pool.execute(
      `INSERT INTO sa_audit_log (action, target_society_id, target_email, reason, metadata) VALUES (?, ?, ?, ?, ?)`,
      ["extend_demo", societyId, admin?.email ?? null, reason || null, JSON.stringify({ days: daysNum, new_expires_at: newExpiresAt.toISOString() })]
    ).catch(() => {});
    logger.info({ societyId, days: daysNum, newExpiresAt }, "demo extended");
    return res.json({ ok: true, new_expires_at: newExpiresAt.toISOString() });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/extend-demo error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/superadmin/societies/:id/set-plan — aggiorna piano in MySQL + audit log
// Necessario per prevenire che _syncSubscriptionStatus lato client sovrascriva il piano
// impostato manualmente dal SA (che aggiorna solo il blob, non MySQL).
router.post("/superadmin/societies/:id/set-plan", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) return res.status(401).json({ error: "unauthorized" });
  const societyId = parseInt(req.params.id);
  if (isNaN(societyId)) return res.status(400).json({ error: "invalid_id" });
  const { piano } = req.body as { piano?: string };
  const VALID_PIANI = ["demo", "mister", "mister_pro", "societa"];
  if (!piano || !VALID_PIANI.includes(piano)) {
    return res.status(400).json({ error: "invalid_piano" });
  }

  try {
    await pool.execute(
      `UPDATE societies SET piano = ? WHERE id = ?`,
      [piano, societyId]
    );
    await pool.execute(
      `INSERT INTO sa_audit_log (action, target_society_id, performed_by, reason, metadata, created_at)
       VALUES ('plan_changed', ?, 'SUPERADMIN', ?, ?, NOW())`,
      [societyId, `Piano cambiato a ${piano}`, JSON.stringify({ piano })]
    ).catch(() => {});
    logger.info({ societyId, piano }, "superadmin: piano updated in MySQL");
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/set-plan error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
