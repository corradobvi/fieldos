import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { signJWT, hashPassword } from "../../lib/auth";
import { sendWelcomeEmails } from "../../lib/email";
import type { PoolConnection } from "mysql2/promise";

const router = Router();

const DEMO_DAYS: Record<string, number> = {
  mister:     14,
  mister_pro: 14,
  societa:    10,
};

const VALID_PIANI = new Set(["mister", "mister_pro", "societa"]);

// POST /api/v2/auth/self-register
// Registrazione autonoma: crea società + admin user e restituisce JWT subito.
router.post("/auth/self-register", async (req, res) => {
  const { nome, cognome, email, password, phone, nomeSocieta, citta, piano } =
    req.body as Record<string, string | undefined>;

  if (!nome?.trim() || !cognome?.trim() || !email?.trim() || !password || !nomeSocieta?.trim()) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "invalid_email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password_too_short" });
  }

  const normalizedEmail  = email.trim().toLowerCase();
  const pianoNorm        = VALID_PIANI.has(piano ?? "") ? (piano as string) : "mister";
  const demoDays         = DEMO_DAYS[pianoNorm] ?? 14;
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

    // Crea società
    const [socRes] = (await conn.execute(
      `INSERT INTO societies
         (nome, citta, codice, piano, subscription_status, demo_scadenza, stato)
       VALUES (?, ?, ?, ?, 'demo', ?, 'attiva')`,
      [nomeSocieta.trim(), (citta ?? "").trim(), codice, pianoNorm, demoExpires]
    )) as [any, any];
    const societyId: number = socRes.insertId;

    // Crea admin user (attivo subito, senza approvazione)
    const hash = hashPassword(password);
    const [userRes] = (await conn.execute(
      `INSERT INTO users
         (society_id, nome, cognome, email, password_hash, ruolo, stato, phone)
       VALUES (?, ?, ?, ?, ?, 'admin', 'attivo', ?)`,
      [societyId, nome.trim(), cognome.trim(), normalizedEmail, hash, (phone ?? "").trim()]
    )) as [any, any];
    const userId: number = userRes.insertId;

    // Crea leva iniziale di default
    await conn.execute(
      "INSERT INTO leve (society_id, nome, ordine) VALUES (?, ?, 0)",
      [societyId, "Prima Squadra"]
    );

    await conn.commit();

    const token = signJWT({ userId, societyId, role: "admin", email: normalizedEmail });

    // Webhook Superchat in background — non blocca la risposta
    _superchatWebhook({ phone: (phone ?? "").trim(), nome: nome.trim(), email: normalizedEmail, piano: pianoNorm }).catch(() => {});

    // Email in background — non blocca la risposta
    sendWelcomeEmails({
      nome: nome.trim(),
      cognome: cognome.trim(),
      email: normalizedEmail,
      phone: (phone ?? "").trim(),
      nomeSocieta: nomeSocieta.trim(),
      piano: pianoNorm,
      demoExpires,
    }).catch(() => {});

    logger.info({ userId, societyId, email: normalizedEmail, piano: pianoNorm }, "self-register ok");

    return res.status(201).json({
      token,
      user: {
        id:       userId,
        societyId,
        nome:     nome.trim(),
        cognome:  cognome.trim(),
        email:    normalizedEmail,
        ruolo:    "admin",
      },
      society: {
        id:          societyId,
        nome:        nomeSocieta.trim(),
        citta:       (citta ?? "").trim(),
        piano:       pianoNorm,
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
