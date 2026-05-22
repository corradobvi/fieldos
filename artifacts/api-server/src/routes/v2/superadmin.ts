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

// POST /api/v2/superadmin/migrate-society — TEMPORARY: migra utenti blob → MySQL in una transazione
// Legge le password plain-text direttamente dal blob sorgente (mai trasmesse dal client).
// Rimuovere dopo uso.
router.post("/superadmin/migrate-society", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) return res.status(401).json({ error: "unauthorized" });

  const { sourceBlob, newSocietyData, userMappings } = req.body as {
    sourceBlob: string;
    newSocietyData: {
      nome: string; citta?: string; piano: string; billingMode?: string;
      colorePrimario?: string; coloreAccento?: string; logoUrl?: string;
      codice?: string; demo_scadenza?: string | null;
    };
    userMappings: Array<{
      email: string; nome: string; cognome: string; ruolo: string;
      leva?: string; phone?: string; isAccountOwner?: boolean;
    }>;
  };

  if (!sourceBlob || !newSocietyData?.nome || !Array.isArray(userMappings) || !userMappings.length) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const checks: Record<string, any> = {};
  let conn: PoolConnection | null = null;

  try {
    // === V1: Nessuna email duplicata in MySQL ===
    const emails = userMappings.map(u => u.email.toLowerCase());
    const phV1 = emails.map(() => "?").join(",");
    const [dupRows] = (await pool.execute(
      `SELECT id, email, society_id FROM users WHERE LOWER(email) IN (${phV1})`,
      emails
    )) as [any[], any];
    checks.v1_duplicate_emails = { ok: dupRows.length === 0, found: dupRows };
    if (dupRows.length > 0) {
      return res.status(409).json({
        error: "duplicate_emails", checks,
        detail: `Email già in MySQL: ${dupRows.map((r: any) => r.email).join(", ")}`,
      });
    }

    // === V2: Colonne richieste in users ===
    const requiredUserCols = ["is_account_owner", "cognome", "temp_password", "phone", "leva", "ruolo"];
    const [userColRows] = (await pool.execute("SHOW COLUMNS FROM users")) as [any[], any];
    const userColNames: string[] = userColRows.map((c: any) => c.Field);
    const missingUserCols = requiredUserCols.filter(c => !userColNames.includes(c));
    checks.v2_user_columns = { ok: missingUserCols.length === 0, columns: userColNames, missing: missingUserCols };
    if (missingUserCols.length > 0) {
      return res.status(500).json({ error: "missing_user_columns", checks, detail: missingUserCols });
    }

    // === V3: Colonne richieste in societies ===
    const requiredSocCols = ["billing_mode", "demo_scadenza", "codice", "colore_primario", "colore_accento", "logo_url", "stato"];
    const [socColRows] = (await pool.execute("SHOW COLUMNS FROM societies")) as [any[], any];
    const socColNames: string[] = socColRows.map((c: any) => c.Field);
    const missingSocCols = requiredSocCols.filter(c => !socColNames.includes(c));
    checks.v3_society_columns = { ok: missingSocCols.length === 0, columns: socColNames, missing: missingSocCols };
    if (missingSocCols.length > 0) {
      return res.status(500).json({ error: "missing_society_columns", checks, detail: missingSocCols });
    }

    // === Leggi blob sorgente e recupera password plain-text per ogni utente ===
    const [blobRows] = (await pool.execute(
      "SELECT state_json FROM society_state WHERE `key` = ? LIMIT 1",
      [sourceBlob]
    )) as [any[], any];
    if (!blobRows.length) {
      return res.status(404).json({ error: "source_blob_not_found", sourceBlob, checks });
    }
    let sourceState: any;
    try { sourceState = JSON.parse(blobRows[0].state_json as string); } catch {
      return res.status(500).json({ error: "source_blob_parse_error", checks });
    }
    const blobUsers: any[] = sourceState.USERS_DB || [];

    const usersReady: Array<{ mapping: typeof userMappings[0]; plainPass: string }> = [];
    for (const mapping of userMappings) {
      const bu = blobUsers.find(
        (u: any) => typeof u.email === "string" && u.email.toLowerCase() === mapping.email.toLowerCase()
      );
      if (!bu || !bu.pass) {
        return res.status(400).json({ error: "user_not_in_blob", email: mapping.email, checks });
      }
      usersReady.push({ mapping, plainPass: bu.pass });
    }

    // === TRANSACTION ===
    conn = await (pool as any).getConnection();
    await conn.beginTransaction();

    try {
      // STEP 3: INSERT societies
      const sd = newSocietyData;
      const [socRes] = (await conn.execute(
        `INSERT INTO societies
           (nome, citta, piano, colore_primario, colore_accento, logo_url, codice, stato, billing_mode, demo_scadenza)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'attiva', ?, ?)`,
        [sd.nome, sd.citta ?? "", sd.piano,
         sd.colorePrimario ?? "#1A7A4A", sd.coloreAccento ?? "#FFD93D",
         sd.logoUrl ?? null, sd.codice ?? null,
         sd.billingMode ?? "stripe", sd.demo_scadenza ?? null]
      )) as [any, any];
      const newSocietyId: number = socRes.insertId;

      // STEP 4: INSERT users (password hashata PBKDF2 server-side)
      const insertedUsers: any[] = [];
      for (const { mapping, plainPass } of usersReady) {
        const pwHash = hashPassword(plainPass);
        const [uRes] = (await conn.execute(
          `INSERT INTO users
             (society_id, nome, cognome, email, password_hash, ruolo, leva, phone, stato, temp_password)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'attivo', FALSE)`,
          [newSocietyId, mapping.nome, mapping.cognome, mapping.email.toLowerCase(),
           pwHash, mapping.ruolo, mapping.leva ?? null, mapping.phone ?? null]
        )) as [any, any];
        const newUserId: number = uRes.insertId;
        if (mapping.isAccountOwner) {
          await conn.execute("UPDATE users SET is_account_owner = 1 WHERE id = ?", [newUserId]);
        }
        insertedUsers.push({
          id: newUserId, email: mapping.email,
          ruolo: mapping.ruolo, isAccountOwner: mapping.isAccountOwner ?? false,
        });
      }

      // STEP 5: Crea nuovo blob fieldos_state_soc_<newSocietyId> (copia da sourceBlob)
      const newBlobKey = `fieldos_state_soc_${newSocietyId}`;
      const newState = { ...sourceState };
      newState.nomeSocieta = sd.nome;
      newState.coloriPrimari = sd.colorePrimario ?? sourceState.coloriPrimari;
      newState.coloriAccento = sd.coloreAccento ?? sourceState.coloriAccento;
      newState.codiceSocieta = sd.codice ?? "";
      const newStateJson = JSON.stringify(newState);
      await conn.execute(
        `INSERT INTO society_state (\`key\`, state_json, is_demo) VALUES (?, ?, 0)
         ON DUPLICATE KEY UPDATE state_json = VALUES(state_json)`,
        [newBlobKey, newStateJson]
      );

      // STEP 6: Aggiorna SA blob aggiungendo entry Baiardo
      const [saRows] = (await conn.execute(
        "SELECT state_json FROM society_state WHERE `key` = 'fieldos_sa_v1' LIMIT 1"
      )) as [any[], any];
      if (saRows.length) {
        const saState = JSON.parse(saRows[0].state_json as string);
        const adminMapping = userMappings.find(u => u.ruolo === "admin");
        saState.saSocieties = [...(saState.saSocieties || []), {
          id: newSocietyId, nome: sd.nome, citta: sd.citta ?? "",
          colori: sd.colorePrimario ?? "#1A7A4A",
          leva: adminMapping?.leva ?? "Tutte", piano: sd.piano,
          stato: "attivo", email: adminMapping?.email ?? "",
          note: "", utenti: userMappings.length,
          giocatori: (sourceState.players || []).length,
          createdAt: Date.now(), lastActivity: null,
          scadenzaDemo: null, billingMode: sd.billingMode ?? "stripe",
          stripeCustomerId: null, fromMySQL: true,
        }];
        await conn.execute(
          "UPDATE society_state SET state_json = ? WHERE `key` = 'fieldos_sa_v1'",
          [JSON.stringify(saState)]
        );
      }

      await conn.commit();
      logger.info({ newSocietyId, nome: sd.nome, usersCount: insertedUsers.length }, "migrate-society: COMMIT OK");

      // V6: verifica post-commit
      const [verSoc] = (await pool.execute(
        "SELECT id, nome, citta, piano, billing_mode, colore_primario, colore_accento, stato FROM societies WHERE id = ?",
        [newSocietyId]
      )) as [any[], any];
      const [verUsers] = (await pool.execute(
        "SELECT id, email, ruolo, is_account_owner, society_id, nome, cognome FROM users WHERE society_id = ?",
        [newSocietyId]
      )) as [any[], any];

      return res.json({
        ok: true, checks,
        new_society_id: newSocietyId,
        new_blob_key: newBlobKey,
        users_created: insertedUsers,
        sa_blob_updated: true,
        verification: { society: verSoc[0] ?? null, users: verUsers },
      });

    } catch (txErr: any) {
      await conn.rollback();
      logger.error({ err: txErr }, "migrate-society: ROLLBACK");
      return res.status(500).json({
        error: "transaction_failed",
        detail: txErr?.sqlMessage ?? txErr?.message,
        checks,
      });
    }

  } catch (e: any) {
    logger.error({ err: e }, "migrate-society: outer error");
    return res.status(500).json({ error: "server_error", detail: e?.message, checks });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
