import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`      VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    is_demo     TINYINT(1) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

// GET /api/public/societies?q=searchterm
// Returns public list of societies (no sensitive data)
router.get("/public/societies", async (req, res) => {
  const q = ((req.query.q as string) || "").trim().toLowerCase();

  try {
    await pool.execute(CREATE_TABLE_SQL);

    const [rows] = (await pool.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    )) as [any[], any];

    const results: Array<{
      id: number;
      nome: string;
      leveCount: number;
      leve: string[];
    }> = [];

    for (const row of rows) {
      let state: any;
      try {
        state = JSON.parse(row.state_json as string);
      } catch {
        continue;
      }

      // Skip if explicitly hidden from public search
      if (state.ricercaPubblica === false) continue;

      const nome: string = state.nomeSocieta || "";
      if (!nome || nome.toLowerCase().includes("demo")) continue;

      // Apply search filter if provided
      if (q && !nome.toLowerCase().includes(q)) continue;

      // Derive societyId from the key
      let societyId = 0;
      const match = (row.key as string).match(/fieldos_state_soc_(\d+)$/);
      if (match) societyId = parseInt(match[1], 10);

      const leveList: string[] = Array.isArray(state.leve) ? state.leve : [];

      results.push({
        id: societyId,
        nome,
        leveCount: leveList.length,
        leve: leveList,
      });
    }

    // Sort by name
    results.sort((a, b) => a.nome.localeCompare(b.nome, "it"));

    return res.json({ societies: results });
  } catch (e: any) {
    logger.error({ err: e }, "public/societies error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/public/join-request
// Body: { societyId, nome, cogn, email, pass, titoloFamiliare, figlioDichiarato, messaggio }
router.post("/public/join-request", async (req, res) => {
  const {
    societyId,
    nome,
    cogn,
    email,
    pass,
    titoloFamiliare,
    figlioDichiarato,
    messaggio,
  } = req.body as Record<string, any>;

  if (!nome || !cogn || !email || !pass) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const emailLower = (email as string).toLowerCase().trim();
  const stateKey =
    societyId === 0 || societyId === "0"
      ? "fieldos_state_v1"
      : `fieldos_state_soc_${societyId}`;

  try {
    await pool.execute(CREATE_TABLE_SQL);

    const [rows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ?",
      [stateKey]
    )) as [any[], any];

    if (!rows.length) {
      return res.status(404).json({ error: "society_not_found" });
    }

    let state: any;
    try {
      state = JSON.parse(rows[0].state_json as string);
    } catch {
      return res.status(500).json({ error: "state_parse_error" });
    }

    // Check if society accepts requests
    if (state.accettaRichieste === false) {
      return res
        .status(403)
        .json({ error: "requests_disabled" });
    }

    // Check for duplicate email in active users
    const usersDB: any[] = Array.isArray(state.USERS_DB) ? state.USERS_DB : [];
    if (usersDB.find((u: any) => (u.email || "").toLowerCase() === emailLower)) {
      return res.status(409).json({ error: "email_already_exists" });
    }

    // Check for duplicate pending request
    const pending: any[] = Array.isArray(state.pendingUsers) ? state.pendingUsers : [];
    if (pending.find((p: any) => (p.email || "").toLowerCase() === emailLower)) {
      return res.status(409).json({ error: "request_already_sent" });
    }

    // Add new pending request
    const newId = typeof state.nextPendingUserId === "number" ? state.nextPendingUserId : (pending.length + 1);
    const newRequest = {
      id: newId,
      nome: String(nome).trim(),
      cogn: String(cogn).trim(),
      email: emailLower,
      pass: String(pass),
      role: "genitore",
      titoloFamiliare: titoloFamiliare || "papa",
      figli: figlioDichiarato ? [String(figlioDichiarato).trim()] : [],
      figliIds: [],
      leva: "",
      messaggio: String(messaggio || "").trim(),
      fromSearch: true,
      ts: Date.now(),
    };

    state.pendingUsers = [...pending, newRequest];
    state.nextPendingUserId = newId + 1;

    // Add notification for admin users
    const notifiche: any[] = Array.isArray(state.notifiche) ? state.notifiche : [];
    let nextNotifId = typeof state.nextNotificaId === "number" ? state.nextNotificaId : (notifiche.length + 1);
    usersDB
      .filter((u: any) => u.role === "admin" && u.stato === "attivo")
      .forEach((adm: any) => {
        notifiche.push({
          id: nextNotifId++,
          toUserId: adm.id,
          type: "nuova_richiesta",
          title: "📬 Nuova richiesta di accesso",
          body: `${String(nome).trim()} ${String(cogn).trim()} vuole unirsi alla squadra`,
          ts: Date.now(),
          read: false,
        });
      });
    state.notifiche = notifiche;
    state.nextNotificaId = nextNotifId;

    // Save updated state
    await pool.execute(
      "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
      [JSON.stringify(state), stateKey]
    );

    logger.info({ societyId, nome, cogn, email: emailLower }, "join-request submitted");
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "join-request error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

// POST /api/public/forgot-password
// Body: { email }
// Genera una password temporanea, la imposta sull'utente in MySQL, la restituisce in chiaro (MVP)
router.post("/public/forgot-password", async (req, res) => {
  const { email } = req.body as Record<string, any>;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "missing_fields" });
  }

  const emailLower = (email as string).toLowerCase().trim();

  try {
    await pool.execute(CREATE_TABLE_SQL);

    const [rows] = (await pool.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    )) as [any[], any];

    for (const row of rows) {
      let state: any;
      try { state = JSON.parse(row.state_json as string); } catch { continue; }

      const users: any[] = state.USERS_DB || [];
      const userIdx = users.findIndex((u: any) => (u.email || "").toLowerCase() === emailLower);
      if (userIdx === -1) continue;

      const user = users[userIdx];
      const tempPass = _generateTempPassword();
      user.pass = tempPass;
      user.tempPassword = true;

      await pool.execute(
        "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
        [JSON.stringify(state), row.key]
      );

      logger.info({ email: emailLower }, "forgot-password: temp password set");
      return res.json({ found: true, tempPass, nome: user.nome, cogn: user.cogn });
    }

    return res.json({ found: false });
  } catch (e: any) {
    logger.error({ err: e }, "forgot-password error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

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

export default router;
