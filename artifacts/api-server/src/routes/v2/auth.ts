import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { signJWT, verifyPassword, hashPassword, requireAuth } from "../../lib/auth";

const router = Router();

// POST /api/v2/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: "missing_fields" });

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [rows] = (await pool.execute(
      `SELECT u.id, u.society_id, u.nome, u.cognome, u.email, u.password_hash,
              u.ruolo, u.leva, u.stato, u.temp_password, u.figli,
              s.nome AS society_nome, s.citta, s.colore_primario, s.colore_accento,
              s.codice, s.piano, s.stato AS society_stato, s.logo_url
       FROM users u
       JOIN societies s ON s.id = u.society_id
       WHERE LOWER(u.email) = ? AND u.stato = 'attivo' AND s.stato = 'attiva'
       LIMIT 1`,
      [normalizedEmail]
    )) as [any[], any];

    if (!rows.length) return res.status(401).json({ error: "invalid_credentials" });
    const user = rows[0];

    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    // Read founding_promo_pending separately — column may not exist yet on older DBs
    let foundingPromoPending: string | null = null;
    try {
      const [fp] = await pool.execute(
        "SELECT founding_promo_pending FROM users WHERE id = ?", [user.id]
      ) as [any[], any];
      foundingPromoPending = fp[0]?.founding_promo_pending || null;
    } catch (_) {}

    const token = signJWT({
      userId: user.id,
      societyId: user.society_id,
      role: user.ruolo,
      email: user.email,
    });

    logger.info({ userId: user.id, societyId: user.society_id }, "v2 login ok");

    return res.json({
      token,
      user: {
        id: user.id,
        societyId: user.society_id,
        nome: user.nome,
        cognome: user.cognome,
        email: user.email,
        ruolo: user.ruolo,
        leva: user.leva,
        tempPassword: user.temp_password === 1,
        figli: user.figli ? JSON.parse(user.figli) : [],
        foundingPromoPending,
      },
      society: {
        id: user.society_id,
        nome: user.society_nome,
        citta: user.citta,
        colorePrimario: user.colore_primario,
        coloreAccento: user.colore_accento,
        codice: user.codice,
        piano: user.piano,
        logoUrl: user.logo_url,
      },
    });
  } catch (e: any) {
    logger.error({ err: e }, "v2 login error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/auth/register — registrazione genitore tramite codice società
router.post("/auth/register", async (req, res) => {
  const { code, nome, cognome, email, password } = req.body as Record<string, string>;
  if (!code || !nome || !cognome || !email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (password.length < 6) return res.status(400).json({ error: "password_too_short" });

  const normalizedEmail = email.trim().toLowerCase();
  const upperCode = code.trim().toUpperCase();

  try {
    const [socRows] = (await pool.execute(
      "SELECT id, nome FROM societies WHERE UPPER(codice) = ? AND stato = 'attiva' LIMIT 1",
      [upperCode]
    )) as [any[], any];

    if (!socRows.length) return res.status(400).json({ error: "invalid_code" });
    const society = socRows[0];

    const [existing] = (await pool.execute(
      "SELECT id FROM users WHERE LOWER(email) = ? AND society_id = ?",
      [normalizedEmail, society.id]
    )) as [any[], any];

    if (existing.length) return res.status(409).json({ error: "email_exists" });

    const hash = hashPassword(password);
    const [result] = (await pool.execute(
      "INSERT INTO users (society_id, nome, cognome, email, password_hash, ruolo, stato) VALUES (?, ?, ?, ?, ?, 'genitore', 'pendente')",
      [society.id, nome.trim(), cognome.trim(), normalizedEmail, hash]
    )) as [any, any];

    logger.info({ societyId: society.id, email: normalizedEmail }, "v2 register: pending approval");
    return res.status(201).json({ ok: true, societyName: society.nome, pending: true });
  } catch (e: any) {
    logger.error({ err: e }, "v2 register error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/auth/verify-code
router.post("/auth/verify-code", async (req, res) => {
  const { code } = req.body as { code?: string };
  if (!code?.trim()) return res.status(400).json({ valid: false, error: "missing_code" });
  const upperCode = code.trim().toUpperCase();

  try {
    // Check new societies table first
    const [rows] = (await pool.execute(
      "SELECT id, nome FROM societies WHERE UPPER(codice) = ? AND stato = 'attiva' LIMIT 1",
      [upperCode]
    )) as [any[], any];

    if (rows.length) {
      return res.json({ valid: true, societyId: rows[0].id, societyName: rows[0].nome });
    }

    // Fallback: scan legacy society_state blob (existing architecture)
    const [blobRows] = (await pool.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    )) as [any[], any];

    for (const row of blobRows) {
      let state: any;
      try { state = JSON.parse(row.state_json); } catch { continue; }
      const rowCode = (state.codiceSocieta ?? "").trim().toUpperCase();
      if (!rowCode || rowCode !== upperCode) continue;
      const stateKey: string = row.key;
      let societyId = 0;
      const match = stateKey.match(/fieldos_state_soc_(\d+)$/);
      if (match) societyId = parseInt(match[1], 10);
      return res.json({ valid: true, societyId, stateKey, societyName: state.nomeSocieta ?? "MyVivaio" });
    }

    return res.json({ valid: false });
  } catch (e: any) {
    logger.error({ err: e }, "v2 verify-code error");
    return res.status(500).json({ valid: false, error: "server_error" });
  }
});

// POST /api/v2/auth/change-password
router.post("/auth/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body as Record<string, string>;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "missing_fields" });
  if (newPassword.length < 6) return res.status(400).json({ error: "password_too_short" });

  const userId = req.jwtUser!.userId;

  try {
    const [rows] = (await pool.execute(
      "SELECT password_hash FROM users WHERE id = ?", [userId]
    )) as [any[], any];

    if (!rows.length) return res.status(404).json({ error: "not_found" });
    if (!verifyPassword(currentPassword, rows[0].password_hash)) {
      return res.status(401).json({ error: "wrong_current_password" });
    }

    await pool.execute(
      "UPDATE users SET password_hash = ?, temp_password = FALSE WHERE id = ?",
      [hashPassword(newPassword), userId]
    );

    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "change-password error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
