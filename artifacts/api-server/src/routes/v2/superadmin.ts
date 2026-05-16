import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { hashPassword } from "../../lib/auth";
import { sendPasswordResetEmail } from "../../lib/email";

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
       GROUP BY s.id
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
    return res.json({ ok: true, email: user.email });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/reset-password error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
