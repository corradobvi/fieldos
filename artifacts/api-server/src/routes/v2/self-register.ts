import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { signJWT, hashPassword } from "../../lib/auth";
import { sendWelcomeEmails } from "../../lib/email";
import type { PoolConnection } from "mysql2/promise";

const router = Router();

// Step 1 self-register: il piano viene scelto in Step 2 (#scegli-piano).
// La demo trial parte comunque a 14 giorni dalla creazione, piano = NULL fino a select-plan.
const DEMO_DAYS_DEFAULT = 14;

const PHONE_IT_REGEX = /^\+39\d{9,10}$/;

// POST /api/v2/auth/self-register
// Registrazione autonoma: crea società + admin user e restituisce JWT subito.
router.post("/auth/self-register", async (req, res) => {
  const { nome, cognome, email, password, phone, nomeSocieta, citta,
          marketingConsent, utm_data } =
    req.body as Record<string, any>;

  if (!nome?.trim() || !cognome?.trim() || !email?.trim() || !password || !nomeSocieta?.trim()) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "invalid_email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password_too_short" });
  }
  // Privacy: auto-accept (disclaimer mostrato sopra il bottone Continua sul frontend).
  // privacy_accepted_at viene comunque registrato server-side.
  const phoneNorm = typeof phone === "string" ? phone.replace(/\s/g, "") : "";
  if (!PHONE_IT_REGEX.test(phoneNorm)) {
    return res.status(400).json({ error: "phone_required", message: "Cellulare obbligatorio in formato +39XXXXXXXXX" });
  }

  const normalizedEmail  = email.trim().toLowerCase();
  // piano NON viene scelto qui: resterà NULL su societies fino allo Step 2 /societies/select-plan

  // Parse UTM data (silent fail — never blocks registration)
  let utmSource:   string | null = null;
  let utmMedium:   string | null = null;
  let utmCampaign: string | null = null;
  let utmContent:  string | null = null;
  let utmTerm:     string | null = null;
  let fbclid:      string | null = null;
  if (utm_data && typeof utm_data === "object") {
    utmSource   = typeof utm_data.utm_source   === "string" ? utm_data.utm_source.slice(0, 100)   : null;
    utmMedium   = typeof utm_data.utm_medium   === "string" ? utm_data.utm_medium.slice(0, 100)   : null;
    utmCampaign = typeof utm_data.utm_campaign === "string" ? utm_data.utm_campaign.slice(0, 255) : null;
    utmContent  = typeof utm_data.utm_content  === "string" ? utm_data.utm_content.slice(0, 255)  : null;
    utmTerm     = typeof utm_data.utm_term     === "string" ? utm_data.utm_term.slice(0, 255)     : null;
    fbclid      = typeof utm_data.fbclid       === "string" ? utm_data.fbclid.slice(0, 500)       : null;
  }
  const demoDays         = DEMO_DAYS_DEFAULT;
  const demoExpires      = new Date(Date.now() + demoDays * 24 * 60 * 60 * 1000);
  const codice           = _generateCode(nomeSocieta.trim());

  let conn: PoolConnection | null = null;
  try {
    conn = await (pool as any).getConnection();
    await conn.beginTransaction();

    // Email unica globalmente
    const [dup] = (await conn.execute(
      "SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1",
      [normalizedEmail]
    )) as [any[], any];
    if (dup.length) {
      await conn.rollback();
      return res.status(409).json({ error: "email_exists" });
    }

    // Crea società — piano NULL: lo sceglie lo Step 2 (/societies/select-plan)
    const [socRes] = (await conn.execute(
      `INSERT INTO societies
         (nome, citta, codice, piano, subscription_status, demo_scadenza, stato)
       VALUES (?, ?, ?, NULL, 'demo', ?, 'attiva')`,
      [nomeSocieta.trim(), (citta ?? "").trim(), codice, demoExpires]
    )) as [any, any];
    const societyId: number = socRes.insertId;

    // Crea admin user (attivo subito, senza approvazione)
    const hash = hashPassword(password);
    const mktConsent = marketingConsent === true;
    const [userRes] = (await conn.execute(
      `INSERT INTO users
         (society_id, nome, cognome, email, password_hash, ruolo, stato, phone,
          whatsapp_number, privacy_accepted_at, marketing_consent, marketing_consent_at,
          is_account_owner, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid)
       VALUES (?, ?, ?, ?, ?, 'admin', 'attivo', ?,
               ?, NOW(), ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
      [societyId, nome.trim(), cognome.trim(), normalizedEmail, hash, phoneNorm,
       phoneNorm, mktConsent, mktConsent ? new Date() : null,
       utmSource, utmMedium, utmCampaign, utmContent, utmTerm, fbclid]
    )) as [any, any];
    const userId: number = userRes.insertId;

    // Crea leva iniziale di default
    await conn.execute(
      "INSERT INTO leve (society_id, nome, ordine) VALUES (?, ?, 0)",
      [societyId, "Prima Squadra"]
    );

    await conn.commit();

    // Create WhatsApp contact tracking record (fire-and-forget after commit)
    pool.execute(
      `INSERT INTO demo_whatsapp_contact (user_id, user_email, user_phone, user_first_name, user_last_name, demo_plan_key, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, normalizedEmail, phoneNorm, nome.trim(), cognome.trim(), "pending_step2"]
    ).catch((e: any) => logger.warn({ err: e?.message }, "demo-wa contact insert failed"));

    // JWT con societyPiano: null — il middleware requireAuth ritornerà 403 plan_required
    // su qualunque route protetta tranne /societies/select-plan, finché l'utente non sceglie.
    const token = signJWT({ userId, societyId, role: "admin", email: normalizedEmail, societyPiano: null });

    // Webhook Superchat in background — non blocca la risposta
    _superchatWebhook({ phone: phoneNorm, nome: nome.trim(), email: normalizedEmail, piano: "pending_step2" }).catch(() => {});

    // Email in background — piano effettivo verrà scelto in Step 2, per ora indichiamo "demo"
    sendWelcomeEmails({
      nome:       nome.trim(),
      cognome:    cognome.trim(),
      email:      normalizedEmail,
      phone:      phoneNorm,
      nomeSocieta: nomeSocieta.trim(),
      citta:      (citta ?? "").trim(),
      piano:      "demo",
      demoExpires,
      societyId,
    }).catch(() => {});

    logger.info({ userId, societyId, email: normalizedEmail }, "self-register ok (piano pending step2)");

    return res.status(201).json({
      token,
      user: {
        id:             userId,
        societyId,
        nome:           nome.trim(),
        cognome:        cognome.trim(),
        email:          normalizedEmail,
        ruolo:          "admin",
        isAccountOwner: true,
      },
      society: {
        id:          societyId,
        nome:        nomeSocieta.trim(),
        citta:       (citta ?? "").trim(),
        piano:       null,
        codice,
        demoExpires: demoExpires.toISOString(),
        demoDays,
      },
    });
  } catch (e: any) {
    if (conn) await conn.rollback().catch(() => {});
    logger.error({ err: e }, "self-register error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  } finally {
    if (conn) conn.release();
  }
});

async function _superchatWebhook(opts: { phone: string; nome: string; email: string; piano: string }): Promise<void> {
  const url = process.env.SUPERCHAT_WEBHOOK_URL;
  if (!url) return; // non configurato — salta silenziosamente
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: opts.phone, name: opts.nome, email: opts.email, piano: opts.piano }),
  });
  if (!resp.ok) {
    logger.warn({ status: resp.status, email: opts.email }, "superchat webhook failed");
  } else {
    logger.info({ email: opts.email }, "superchat webhook ok");
  }
}

function _generateCode(nome: string): string {
  const clean = nome.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5).padEnd(3, "X");
  const rand  = Math.floor(Math.random() * 900 + 100);
  return `${clean}${rand}`;
}

export default router;
