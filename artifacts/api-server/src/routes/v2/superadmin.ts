import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { hashPassword } from "../../lib/auth";
import { sendPasswordResetEmail, sendSuspendEmail, sendReactivateEmail, sendDemoExtendedEmail } from "../../lib/email";
import type { PoolConnection } from "mysql2/promise";

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

// POST /api/v2/superadmin/societies — crea società + admin in MySQL (SA panel)
router.post("/superadmin/societies", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) return res.status(401).json({ error: "unauthorized" });

  const { nome, citta, piano, adminNome, adminCogn, adminEmail, adminPass } =
    req.body as Record<string, any>;

  if (!nome?.trim() || !adminNome?.trim() || !adminCogn?.trim() || !adminEmail?.trim() || !adminPass) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const VALID_PIANI = ["demo", "mister", "mister_pro", "societa"];
  const pianoNorm   = VALID_PIANI.includes(piano) ? (piano as string) : "demo";
  const DEMO_DAYS: Record<string, number> = { mister: 14, mister_pro: 14, societa: 10, demo: 14 };
  const demoExpires = new Date(Date.now() + (DEMO_DAYS[pianoNorm] ?? 14) * 24 * 60 * 60 * 1000);
  const clean       = (nome as string).trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5).padEnd(3, "X");
  const codice      = clean + Math.floor(Math.random() * 900 + 100);
  const normalizedEmail = (adminEmail as string).trim().toLowerCase();

  let conn: PoolConnection | null = null;
  try {
    conn = await (pool as any).getConnection();
    await conn.beginTransaction();

    const [dup] = (await conn.execute(
      "SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1", [normalizedEmail]
    )) as [any[], any];
    if (dup.length) {
      await conn.rollback();
      return res.status(409).json({ error: "email_exists" });
    }

    const [socRes] = (await conn.execute(
      `INSERT INTO societies (nome, citta, codice, piano, subscription_status, demo_scadenza, stato, billing_mode)
       VALUES (?, ?, ?, ?, 'demo', ?, 'attiva', 'omaggio')`,
      [(nome as string).trim(), ((citta as string) ?? "").trim(), codice, pianoNorm, demoExpires]
    )) as [any, any];
    const societyId: number = socRes.insertId;

    const hash = hashPassword(adminPass as string);
    const [userRes] = (await conn.execute(
      `INSERT INTO users (society_id, nome, cognome, email, password_hash, ruolo, stato, temp_password, is_account_owner)
       VALUES (?, ?, ?, ?, ?, 'admin', 'attivo', 1, 1)`,
      [societyId, (adminNome as string).trim(), (adminCogn as string).trim(), normalizedEmail, hash]
    )) as [any, any];
    const userId: number = userRes.insertId;

    await conn.commit();

    pool.execute(
      `INSERT INTO sa_audit_log (action, target_society_id, target_email, performed_by) VALUES ('create_society', ?, ?, 'SUPERADMIN')`,
      [societyId, normalizedEmail]
    ).catch(() => {});

    logger.info({ societyId, userId, email: normalizedEmail }, "superadmin: society+admin created in MySQL");

    return res.status(201).json({
      ok: true, societyId, userId, codice,
      demoExpires: demoExpires.toISOString(),
    });
  } catch (e: any) {
    if (conn) await conn.rollback().catch(() => {});
    logger.error({ err: e }, "superadmin/create-society error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  } finally {
    if (conn) conn.release();
  }
});

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
         s.billing_mode,
         s.stripe_customer_id,
         s.subscription_status,
         s.demo_scadenza,
         s.stato,
         s.created_at,
         u.email,
         u.is_account_owner,
         COUNT(DISTINCT u2.id) AS utenti
       FROM societies s
       LEFT JOIN users u  ON u.society_id  = s.id AND u.ruolo = 'admin' AND u.stato = 'attivo'
       LEFT JOIN users u2 ON u2.society_id = s.id AND u2.stato = 'attivo'
       WHERE s.id NOT IN (${EXCLUDED_IDS.join(",")})
       GROUP BY s.id, s.nome, s.citta, s.colore_primario, s.piano, s.billing_mode, s.stripe_customer_id, s.subscription_status, s.demo_scadenza, s.stato, s.created_at, u.email, u.is_account_owner
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

// PATCH /api/v2/superadmin/societies/:id — aggiorna nome/citta in MySQL
router.patch("/superadmin/societies/:id", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) return res.status(401).json({ error: "unauthorized" });
  const societyId = parseInt(req.params.id);
  if (isNaN(societyId)) return res.status(400).json({ error: "invalid_id" });
  const { nome, citta } = req.body as { nome?: string; citta?: string };
  if (!nome && !citta) return res.status(400).json({ error: "nothing_to_update" });

  const updates: string[] = [];
  const params: any[] = [];
  if (nome) { updates.push("nome = ?"); params.push(nome.trim()); }
  if (citta !== undefined) { updates.push("citta = ?"); params.push(citta?.trim() ?? null); }
  params.push(societyId);

  try {
    const [result] = (await pool.execute(
      `UPDATE societies SET ${updates.join(", ")} WHERE id = ?`, params
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    await pool.execute(
      `INSERT INTO sa_audit_log (action, target_society_id, performed_by, reason, created_at) VALUES ('rename', ?, 'SUPERADMIN', ?, NOW())`,
      [societyId, nome ? `Rinominata in: ${nome}` : `Città aggiornata`]
    ).catch(() => {});
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/patch society error");
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
    const [modeRows] = (await pool.execute(
      `SELECT billing_mode FROM societies WHERE id = ?`, [societyId]
    )) as [any[], any];
    if (!modeRows.length) return res.status(404).json({ error: "not_found" });
    if (modeRows[0].billing_mode !== 'omaggio') {
      return res.status(403).json({
        error: "billing_mode_stripe",
        message: "Impossibile modificare il piano: società in modalità Stripe. Disattiva la fatturazione automatica prima.",
      });
    }

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

// POST /api/v2/superadmin/societies/:id/set-billing-mode
router.post("/superadmin/societies/:id/set-billing-mode", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) return res.status(401).json({ error: "unauthorized" });
  const societyId = parseInt(req.params.id);
  if (isNaN(societyId)) return res.status(400).json({ error: "invalid_id" });
  const { mode, cancel_stripe_sub } = req.body as { mode?: string; cancel_stripe_sub?: boolean };
  if (mode !== "stripe" && mode !== "omaggio") return res.status(400).json({ error: "invalid_mode" });

  try {
    const [socRows] = (await pool.execute(
      `SELECT billing_mode, stripe_subscription_id FROM societies WHERE id = ?`,
      [societyId]
    )) as [any[], any];
    if (!socRows.length) return res.status(404).json({ error: "not_found" });

    const currentMode = socRows[0].billing_mode as string;
    const stripeSubId = socRows[0].stripe_subscription_id as string | null;

    // 1. Aggiorna billing_mode PRIMA di qualsiasi operazione Stripe (evita race condition)
    await pool.execute(
      `UPDATE societies SET billing_mode = ? WHERE id = ?`,
      [mode, societyId]
    );
    logger.info({ societyId, from: currentMode, to: mode }, "superadmin: billing_mode updated");

    // 2. stripe→omaggio + cancel_stripe_sub: cancella la sub Stripe immediatamente
    if (currentMode === "stripe" && mode === "omaggio" && cancel_stripe_sub && stripeSubId) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (key) {
        try {
          const r = await fetch(`https://api.stripe.com/v1/subscriptions/${stripeSubId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${key}` },
          });
          if (r.ok) {
            logger.info({ stripeSubId, societyId }, "superadmin: Stripe subscription cancelled");
          } else {
            const errBody = await r.json() as any;
            logger.warn({ stripeSubId, err: errBody?.error?.message }, "superadmin: Stripe cancel failed");
          }
        } catch (e: any) {
          logger.warn({ err: e }, "superadmin: Stripe cancel request error");
        }
      }
    }

    // 3. Audit log
    await pool.execute(
      `INSERT INTO sa_audit_log (action, target_society_id, performed_by, reason, metadata, created_at)
       VALUES ('billing_mode_changed', ?, 'SUPERADMIN', ?, ?, NOW())`,
      [
        societyId,
        `billing_mode: ${currentMode} → ${mode}`,
        JSON.stringify({ from: currentMode, to: mode, cancel_stripe_sub: cancel_stripe_sub ?? false, stripe_subscription_id: stripeSubId ?? null }),
      ]
    ).catch(() => {});

    return res.json({ ok: true, billing_mode: mode });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/set-billing-mode error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/superadmin/societies/:id/audit-log?limit=50
router.get("/superadmin/societies/:id/audit-log", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) return res.status(401).json({ error: "unauthorized" });
  const societyId = parseInt(req.params.id);
  if (isNaN(societyId)) return res.status(400).json({ error: "invalid_id" });
  const rawLimit = parseInt(String(req.query.limit ?? "50"), 10);
  const safeLimit = Math.min(Math.max(1, isNaN(rawLimit) ? 50 : rawLimit), 100);

  try {
    const [rows] = (await pool.execute(
      `SELECT id, action, target_email, performed_by, reason, metadata, created_at
       FROM sa_audit_log
       WHERE target_society_id = ?
       ORDER BY created_at DESC
       LIMIT ${safeLimit}`,
      [societyId]
    )) as [any[], any];
    return res.json({ entries: rows });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/audit-log error");
    return res.status(500).json({ error: "server_error" });
  }
});

// [REMOVED] migrate-society endpoint — usato per Baiardo (2026-05-22) e Ronco Scrivia (2026-05-22)

// [REMOVED] migrate-users-to-existing — usato per FASE 2bis (dir.test, mister.due, mister.testsocieta) 2026-05-22

// [REMOVED] cleanup-orphaned-blobs — FASE 3 2026-05-22: soc_1/soc_201/soc_2 già assenti, SA blob pulito

// [REMOVED] purge-test-blobs — FASE 4 2026-05-22: tutti i blob di test già assenti dal DB; SA blob ridotto a 8 entries

// [REMOVED] diagnostic-dump — usato per verifica post-migrazione 2026-05-23

// [REMOVED] phone-diag — PARTE A diagnostica colonna phone 2026-05-22

export default router;
