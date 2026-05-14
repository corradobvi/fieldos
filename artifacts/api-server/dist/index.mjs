// src/app.ts
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "node:fs";

// src/routes/index.ts
import { Router as Router23 } from "express";

// src/routes/health.ts
import { Router } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";
var router = Router();
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({ ...data, v: "2026-05-13-v4" });
});
router.get("/healthz/db", async (_req, res) => {
  const raw = process.env["DATABASE_URL"] ?? "";
  let host = "(not set)";
  if (raw) {
    try {
      const u = new URL(raw);
      host = `${u.hostname}:${u.port || 3306}/${u.pathname.slice(1)}`;
    } catch {
      host = "(invalid URL)";
    }
  }
  try {
    await pool.execute("SELECT 1");
    res.json({ db: "ok", host });
  } catch (e) {
    res.status(500).json({ db: "error", host, code: e?.code, message: e?.message?.slice(0, 120) });
  }
});
var health_default = router;

// src/routes/state.ts
import { Router as Router2 } from "express";
import { pool as pool2 } from "@workspace/db";

// src/lib/logger.ts
import pino from "pino";
var usePretty = process.env.NODE_ENV === "development";
var logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']"
  ],
  ...usePretty ? {
    transport: {
      target: "pino-pretty",
      options: { colorize: true }
    }
  } : {}
});

// src/routes/state.ts
var router2 = Router2();
var CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`      VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    is_demo     TINYINT(1) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;
var MIN_STATE_BYTES = 200;
function wouldDowngrade(newJson, existingJson) {
  try {
    const n = JSON.parse(newJson);
    const e = JSON.parse(existingJson);
    const existingHasRealData = Array.isArray(e.players) && e.players.length > 0 || Array.isArray(e.USERS_DB) && e.USERS_DB.length > 6 || typeof e.nextUserId === "number" && e.nextUserId > 7;
    const newIsEmpty = (!Array.isArray(n.players) || n.players.length === 0) && (!Array.isArray(n.USERS_DB) || n.USERS_DB.length <= 6) && (typeof n.nextUserId !== "number" || n.nextUserId <= 7);
    return existingHasRealData && newIsEmpty;
  } catch {
    return false;
  }
}
router2.get("/state/:key", async (req, res) => {
  try {
    await pool2.execute(CREATE_TABLE_SQL);
    const [rows] = await pool2.execute(
      "SELECT state_json, is_demo FROM `society_state` WHERE `key` = ?",
      [req.params.key]
    );
    if (!rows.length) return res.status(404).json({ error: "not found" });
    return res.json({
      key: req.params.key,
      stateJson: rows[0].state_json,
      isDemo: rows[0].is_demo === 1
    });
  } catch (e) {
    logger.error({ err: e }, "state GET failed");
    return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
  }
});
router2.put("/state/:key", async (req, res) => {
  const { stateJson, isDemo } = req.body;
  if (typeof stateJson !== "string") {
    return res.status(400).json({ error: "stateJson must be a string" });
  }
  const isDemoWrite = isDemo === true;
  const isDemoVal = isDemoWrite ? 1 : 0;
  try {
    await pool2.execute(CREATE_TABLE_SQL);
    const [existing] = await pool2.execute(
      "SELECT state_json, LENGTH(state_json) as sz, is_demo FROM `society_state` WHERE `key` = ?",
      [req.params.key]
    );
    if (existing.length) {
      const existingSz = Number(existing[0].sz);
      const existingIsReal = existing[0].is_demo === 0;
      if (stateJson.length < MIN_STATE_BYTES && existingSz >= MIN_STATE_BYTES) {
        logger.warn(
          { key: req.params.key, newSize: stateJson.length, existingSize: existingSz },
          "PUT rejected: near-empty would overwrite real data"
        );
        return res.status(409).json({
          error: "would_overwrite_real_data",
          detail: "Il nuovo stato \xE8 troppo piccolo per sovrascrivere dati esistenti."
        });
      }
      if (isDemoWrite && existingIsReal) {
        logger.warn({ key: req.params.key }, "PUT rejected: demo write on real-data row");
        return res.status(409).json({
          error: "demo_cannot_overwrite_real",
          detail: "Dati demo non possono sovrascrivere dati reali."
        });
      }
      if (!isDemoWrite && existingIsReal && wouldDowngrade(stateJson, existing[0].state_json)) {
        logger.warn({ key: req.params.key }, "PUT rejected: would downgrade data");
        return res.status(409).json({
          error: "would_downgrade_data",
          detail: "Il nuovo stato ha meno dati di quelli esistenti. Operazione annullata."
        });
      }
    }
    await pool2.execute(
      `INSERT INTO \`society_state\` (\`key\`, \`state_json\`, \`is_demo\`) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         \`state_json\` = ?,
         \`is_demo\`    = IF(\`is_demo\` = 0, 0, ?)`,
      [req.params.key, stateJson, isDemoVal, stateJson, isDemoVal]
    );
    return res.json({ key: req.params.key, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (e) {
    logger.error({ err: e }, "state PUT failed");
    return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
  }
});
var state_default = router2;

// src/routes/login.ts
import { Router as Router3 } from "express";
import { pool as pool3 } from "@workspace/db";
var router3 = Router3();
var CREATE_TABLE_SQL2 = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`      VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    is_demo     TINYINT(1) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;
router3.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const normalizedEmail = email.toLowerCase().trim();
  try {
    await pool3.execute(CREATE_TABLE_SQL2);
    const [saRows] = await pool3.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ?",
      ["fieldos_sa_v1"]
    );
    let societies = [];
    if (saRows.length) {
      try {
        const saState = JSON.parse(saRows[0].state_json);
        societies = Array.isArray(saState.saSocieties) ? saState.saSocieties : [];
      } catch {
      }
    }
    async function searchKey(stateKey, societyId) {
      const [stateRows] = await pool3.execute(
        "SELECT state_json FROM `society_state` WHERE `key` = ?",
        [stateKey]
      );
      if (!stateRows.length) return null;
      let state;
      try {
        state = JSON.parse(stateRows[0].state_json);
      } catch {
        return null;
      }
      const users = state.USERS_DB || [];
      const user = users.find(
        (u) => typeof u.email === "string" && u.email.toLowerCase() === normalizedEmail && u.pass === password
      );
      if (!user) return null;
      return { state, stateKey, societyId, user, stateJson: stateRows[0].state_json };
    }
    const checkedKeys = /* @__PURE__ */ new Set();
    for (const soc of societies) {
      const stato = soc.stato ?? "attivo";
      const stateKey = soc.id === 0 ? "fieldos_state_v1" : `fieldos_state_soc_${soc.id}`;
      checkedKeys.add(stateKey);
      const found = await searchKey(stateKey, soc.id);
      if (!found) continue;
      if (found.user.stato === "sospeso") {
        return res.status(403).json({ error: "suspended" });
      }
      if (stato === "sospeso") {
        return res.status(403).json({ error: "society_suspended", message: "La societ\xE0 \xE8 sospesa. Contatta il supporto." });
      }
      if (stato === "archiviato") {
        return res.status(403).json({ error: "society_archived", message: "La societ\xE0 \xE8 archiviata. Contatta il supporto." });
      }
      if (stato === "eliminato") {
        return res.status(403).json({ error: "society_deleted", message: "La societ\xE0 \xE8 stata eliminata." });
      }
      const scadenzaDemo = soc.scadenzaDemo;
      const pianoSoc = soc.piano ?? "demo";
      if (pianoSoc === "demo" && scadenzaDemo && scadenzaDemo < Date.now()) {
        return res.status(403).json({ error: "demo_expired" });
      }
      logger.info({ email: normalizedEmail, societyId: soc.id, stateKey }, "login ok (SA-guided)");
      return res.json({ societyId: soc.id, stateKey, user: found.user, stateJson: found.stateJson });
    }
    const [allKeys] = await pool3.execute(
      "SELECT `key` FROM `society_state` WHERE (`key` LIKE 'fieldos_state_soc_%' OR `key` = 'fieldos_state_v1') AND `key` NOT LIKE 'fieldos_demo%'"
    );
    for (const row of allKeys) {
      const stateKey = row.key;
      if (checkedKeys.has(stateKey)) continue;
      const socIdMatch = stateKey.match(/fieldos_state_soc_(\d+)$/);
      const societyId = socIdMatch ? parseInt(socIdMatch[1]) : 0;
      const found = await searchKey(stateKey, societyId);
      if (!found) continue;
      if (found.user.stato === "sospeso") {
        return res.status(403).json({ error: "suspended" });
      }
      logger.info({ email: normalizedEmail, societyId, stateKey }, "login ok (orphan-key fallback)");
      return res.json({ societyId, stateKey, user: found.user, stateJson: found.stateJson });
    }
    return res.status(401).json({ error: "invalid_credentials" });
  } catch (e) {
    logger.error({ err: e }, "login error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
var login_default = router3;

// src/routes/auth.ts
import { Router as Router4 } from "express";
import { pool as pool4 } from "@workspace/db";
var router4 = Router4();
var CREATE_TABLE_SQL3 = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`      VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    is_demo     TINYINT(1) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;
router4.post("/auth/verify-code", async (req, res) => {
  const { code } = req.body;
  if (typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ valid: false, error: "missing_code" });
  }
  const upperCode = code.trim().toUpperCase();
  try {
    await pool4.execute(CREATE_TABLE_SQL3);
    const [rows] = await pool4.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    );
    for (const row of rows) {
      let state;
      try {
        state = JSON.parse(row.state_json);
      } catch {
        continue;
      }
      const rowCode = (state.codiceSocieta ?? "").trim().toUpperCase();
      if (!rowCode || rowCode !== upperCode) continue;
      const stateKey = row.key;
      let societyId = 0;
      const match = stateKey.match(/fieldos_state_soc_(\d+)$/);
      if (match) societyId = parseInt(match[1], 10);
      const societyName = state.nomeSocieta || "MyVivaio";
      logger.info({ code: upperCode, societyId, stateKey }, "verify-code: found");
      return res.json({ valid: true, societyId, stateKey, societyName });
    }
    logger.info({ code: upperCode }, "verify-code: not found");
    return res.json({ valid: false });
  } catch (e) {
    logger.error({ err: e }, "verify-code error");
    return res.status(500).json({ valid: false, error: "server_error" });
  }
});
var auth_default = router4;

// src/routes/assist.ts
import { Router as Router5 } from "express";
var router5 = Router5();
var ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
var SYSTEM_PROMPT = `Sei l'assistente di MyVivaio, piattaforma italiana di gestione per societ\xE0 di calcio giovanile.
Rispondi in italiano semplice e diretto, massimo 3-4 frasi.
Conosci tutte le funzioni dell'app: rosa giocatori, presenze, convocazioni, comunicazioni, chat interna, campionati, tornei, amichevoli, calendario, quote, documenti, impostazioni.
Non inventare funzioni che non esistono. Se non sai rispondere, dillo chiaramente.`;
router5.post("/ai-assist", async (req, res) => {
  const { question, section, role } = req.body;
  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "missing_question" });
  }
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    return res.status(503).json({ error: "ai_not_configured" });
  }
  const userMsg = [
    section ? `Sezione attiva: ${section}.` : "",
    role ? `Ruolo utente: ${role}.` : "",
    `Domanda: ${question.trim()}`
  ].filter(Boolean).join(" ");
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }]
      })
    });
    if (!response.ok) {
      const body = await response.text();
      logger.warn({ status: response.status, body }, "Anthropic API error");
      return res.status(502).json({ error: "ai_error", detail: body.slice(0, 200) });
    }
    const data = await response.json();
    const answer = data?.content?.[0]?.text ?? "";
    return res.json({ answer });
  } catch (e) {
    logger.error({ err: e }, "ai-assist fetch error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
var assist_default = router5;

// src/routes/push.ts
import { Router as Router6 } from "express";
import webpush from "web-push";
import { pool as pool5 } from "@workspace/db";
var router6 = Router6();
var VAPID_PUBLIC = process.env["VAPID_PUBLIC_KEY"] ?? "";
var VAPID_PRIVATE = process.env["VAPID_PRIVATE_KEY"] ?? "";
var VAPID_SUBJECT = process.env["VAPID_SUBJECT"] ?? "mailto:admin@myvivaio.app";
if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}
var CREATE_SUBS_TABLE = `
  CREATE TABLE IF NOT EXISTS \`push_subscriptions\` (
    \`id\`                INT AUTO_INCREMENT PRIMARY KEY,
    \`user_id\`           INT NOT NULL,
    \`society_key\`       VARCHAR(255) NOT NULL,
    \`subscription_json\` TEXT NOT NULL,
    \`updated_at\`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY \`uq_user_society\` (\`user_id\`, \`society_key\`)
  )
`;
async function ensureTable() {
  await pool5.execute(CREATE_SUBS_TABLE);
}
router6.get("/push/vapid-public", (_req, res) => {
  if (!VAPID_PUBLIC) return res.status(503).json({ error: "push_not_configured" });
  return res.json({ publicKey: VAPID_PUBLIC });
});
router6.post("/push/subscribe", async (req, res) => {
  const { userId, societyKey, subscription } = req.body;
  if (typeof userId !== "number" || typeof societyKey !== "string" || !societyKey || !subscription) {
    return res.status(400).json({ error: "missing_fields" });
  }
  try {
    await ensureTable();
    const subJson = JSON.stringify(subscription);
    await pool5.execute(
      `INSERT INTO \`push_subscriptions\` (\`user_id\`, \`society_key\`, \`subscription_json\`)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE \`subscription_json\` = ?, \`updated_at\` = NOW()`,
      [userId, societyKey, subJson, subJson]
    );
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "push subscribe error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
router6.post("/push/send", async (req, res) => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(503).json({ error: "push_not_configured" });
  }
  const { userId, societyKey, notification } = req.body;
  if (typeof userId !== "number" || typeof societyKey !== "string" || !societyKey || !notification) {
    return res.status(400).json({ error: "missing_fields" });
  }
  try {
    await ensureTable();
    const [rows] = await pool5.execute(
      "SELECT subscription_json FROM `push_subscriptions` WHERE `user_id` = ? AND `society_key` = ?",
      [userId, societyKey]
    );
    if (!rows.length) return res.json({ ok: true, sent: 0 });
    const payload = JSON.stringify(notification);
    let sent = 0;
    let expired = false;
    for (const row of rows) {
      let sub;
      try {
        sub = JSON.parse(row.subscription_json);
      } catch {
        continue;
      }
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (e) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          expired = true;
          await pool5.execute(
            "DELETE FROM `push_subscriptions` WHERE `user_id` = ? AND `society_key` = ?",
            [userId, societyKey]
          ).catch(() => {
          });
        } else {
          logger.warn({ err: e, userId }, "push send warning");
        }
      }
    }
    return res.json({ ok: true, sent, expired });
  } catch (e) {
    logger.error({ err: e }, "push send error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
var push_default = router6;

// src/routes/upload.ts
import { Router as Router7 } from "express";
import { pool as pool6 } from "@workspace/db";
var router7 = Router7();
var CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS \`photo_uploads\` (
    \`id\`          INT AUTO_INCREMENT PRIMARY KEY,
    \`society_key\` VARCHAR(255) NOT NULL,
    \`photo_key\`   VARCHAR(255) NOT NULL,
    \`mime_type\`   VARCHAR(50)  NOT NULL DEFAULT 'image/jpeg',
    \`data\`        MEDIUMBLOB   NOT NULL,
    \`updated_at\`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY \`uq_soc_photo\` (\`society_key\`, \`photo_key\`)
  )
`;
var _tableReady = false;
async function ensureTable2() {
  if (_tableReady) return;
  await pool6.execute(CREATE_TABLE);
  _tableReady = true;
}
router7.post("/upload/photo", async (req, res) => {
  const { societyKey, photoKey, dataBase64 } = req.body;
  if (!societyKey || !photoKey || !dataBase64) {
    return res.status(400).json({ error: "missing_fields" });
  }
  let base64Data = dataBase64;
  let mime = "image/jpeg";
  const dataUriMatch = dataBase64.match(/^data:([^;]+);base64,(.+)$/s);
  if (dataUriMatch) {
    mime = dataUriMatch[1];
    base64Data = dataUriMatch[2];
  }
  if (base64Data.length > 28e5) {
    return res.status(413).json({ error: "photo_too_large" });
  }
  try {
    await ensureTable2();
    const buf = Buffer.from(base64Data, "base64");
    await pool6.execute(
      `INSERT INTO \`photo_uploads\` (\`society_key\`, \`photo_key\`, \`mime_type\`, \`data\`)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE \`mime_type\` = VALUES(\`mime_type\`), \`data\` = VALUES(\`data\`)`,
      [societyKey, photoKey, mime, buf]
    );
    const url = `/api/photo/${encodeURIComponent(societyKey)}/${encodeURIComponent(photoKey)}`;
    logger.info({ societyKey, photoKey, bytes: buf.length }, "photo uploaded");
    return res.json({ ok: true, url });
  } catch (e) {
    logger.error({ err: e }, "photo upload error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
router7.get("/photo/:societyKey/:photoKey", async (req, res) => {
  try {
    await ensureTable2();
    const [rows] = await pool6.execute(
      "SELECT mime_type, data FROM `photo_uploads` WHERE society_key = ? AND photo_key = ?",
      [req.params.societyKey, req.params.photoKey]
    );
    if (!rows.length) return res.status(404).send("Not found");
    res.setHeader("Content-Type", rows[0].mime_type || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    return res.send(rows[0].data);
  } catch (e) {
    logger.error({ err: e }, "photo GET error");
    return res.status(500).send("Server error");
  }
});
router7.delete("/upload/photo/:societyKey/:photoKey", async (req, res) => {
  try {
    await ensureTable2();
    await pool6.execute(
      "DELETE FROM `photo_uploads` WHERE society_key = ? AND photo_key = ?",
      [req.params.societyKey, req.params.photoKey]
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
var upload_default = router7;

// src/routes/public.ts
import { Router as Router8 } from "express";
import { pool as pool7 } from "@workspace/db";
var router8 = Router8();
var CREATE_TABLE_SQL4 = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`      VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    is_demo     TINYINT(1) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;
router8.get("/public/societies", async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  try {
    await pool7.execute(CREATE_TABLE_SQL4);
    const [rows] = await pool7.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    );
    const results = [];
    for (const row of rows) {
      let state;
      try {
        state = JSON.parse(row.state_json);
      } catch {
        continue;
      }
      if (state.ricercaPubblica === false) continue;
      const nome = state.nomeSocieta || "";
      if (!nome || nome.toLowerCase().includes("demo")) continue;
      if (q && !nome.toLowerCase().includes(q)) continue;
      let societyId = 0;
      const match = row.key.match(/fieldos_state_soc_(\d+)$/);
      if (match) societyId = parseInt(match[1], 10);
      const leveList = Array.isArray(state.leve) ? state.leve : [];
      results.push({
        id: societyId,
        nome,
        leveCount: leveList.length,
        leve: leveList
      });
    }
    results.sort((a, b) => a.nome.localeCompare(b.nome, "it"));
    return res.json({ societies: results });
  } catch (e) {
    logger.error({ err: e }, "public/societies error");
    return res.status(500).json({ error: "server_error" });
  }
});
router8.post("/public/join-request", async (req, res) => {
  const {
    societyId,
    nome,
    cogn,
    email,
    pass,
    titoloFamiliare,
    figlioDichiarato,
    messaggio
  } = req.body;
  if (!nome || !cogn || !email || !pass) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const emailLower = email.toLowerCase().trim();
  const stateKey = societyId === 0 || societyId === "0" ? "fieldos_state_v1" : `fieldos_state_soc_${societyId}`;
  try {
    await pool7.execute(CREATE_TABLE_SQL4);
    const [rows] = await pool7.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ?",
      [stateKey]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "society_not_found" });
    }
    let state;
    try {
      state = JSON.parse(rows[0].state_json);
    } catch {
      return res.status(500).json({ error: "state_parse_error" });
    }
    if (state.accettaRichieste === false) {
      return res.status(403).json({ error: "requests_disabled" });
    }
    const usersDB = Array.isArray(state.USERS_DB) ? state.USERS_DB : [];
    if (usersDB.find((u) => (u.email || "").toLowerCase() === emailLower)) {
      return res.status(409).json({ error: "email_already_exists" });
    }
    const pending = Array.isArray(state.pendingUsers) ? state.pendingUsers : [];
    if (pending.find((p) => (p.email || "").toLowerCase() === emailLower)) {
      return res.status(409).json({ error: "request_already_sent" });
    }
    const newId = typeof state.nextPendingUserId === "number" ? state.nextPendingUserId : pending.length + 1;
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
      ts: Date.now()
    };
    state.pendingUsers = [...pending, newRequest];
    state.nextPendingUserId = newId + 1;
    const notifiche = Array.isArray(state.notifiche) ? state.notifiche : [];
    let nextNotifId = typeof state.nextNotificaId === "number" ? state.nextNotificaId : notifiche.length + 1;
    usersDB.filter((u) => u.role === "admin" && u.stato === "attivo").forEach((adm) => {
      notifiche.push({
        id: nextNotifId++,
        toUserId: adm.id,
        type: "nuova_richiesta",
        title: "\u{1F4EC} Nuova richiesta di accesso",
        body: `${String(nome).trim()} ${String(cogn).trim()} vuole unirsi alla squadra`,
        ts: Date.now(),
        read: false
      });
    });
    state.notifiche = notifiche;
    state.nextNotificaId = nextNotifId;
    await pool7.execute(
      "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
      [JSON.stringify(state), stateKey]
    );
    logger.info({ societyId, nome, cogn, email: emailLower }, "join-request submitted");
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "join-request error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
router8.post("/public/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "missing_fields" });
  }
  const emailLower = email.toLowerCase().trim();
  try {
    await pool7.execute(CREATE_TABLE_SQL4);
    const [rows] = await pool7.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    );
    for (const row of rows) {
      let state;
      try {
        state = JSON.parse(row.state_json);
      } catch {
        continue;
      }
      const users = state.USERS_DB || [];
      const userIdx = users.findIndex((u) => (u.email || "").toLowerCase() === emailLower);
      if (userIdx === -1) continue;
      const user = users[userIdx];
      const tempPass = _generateTempPassword();
      user.pass = tempPass;
      user.tempPassword = true;
      await pool7.execute(
        "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
        [JSON.stringify(state), row.key]
      );
      logger.info({ email: emailLower }, "forgot-password: temp password set");
      return res.json({ found: true, tempPass, nome: user.nome, cogn: user.cogn });
    }
    return res.json({ found: false });
  } catch (e) {
    logger.error({ err: e }, "forgot-password error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
function _generateTempPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$";
  const all = upper + lower + digits + special;
  const chars = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)]
  ];
  while (chars.length < 8) chars.push(all[Math.floor(Math.random() * all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
var public_default = router8;

// src/routes/v2/index.ts
import { Router as Router22 } from "express";
import { pool as pool21 } from "@workspace/db";

// src/routes/v2/schema.ts
var SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS societies (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(255) NOT NULL,
  citta           VARCHAR(255),
  colore_primario VARCHAR(7)   DEFAULT '#1A7A4A',
  colore_accento  VARCHAR(7)   DEFAULT '#FFD93D',
  logo_url        TEXT,
  codice          VARCHAR(50)  UNIQUE,
  piano                  VARCHAR(50)  DEFAULT 'demo',
  subscription_status    VARCHAR(20)  DEFAULT 'demo',
  demo_scadenza          DATETIME,
  stato                  VARCHAR(20)  DEFAULT 'attiva',
  stripe_customer_id     VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  society_id      INT          NOT NULL,
  nome            VARCHAR(255) NOT NULL,
  cognome         VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(512) NOT NULL,
  ruolo           VARCHAR(50)  NOT NULL,
  leva            VARCHAR(100),
  stato           VARCHAR(20)  DEFAULT 'attivo',
  temp_password   BOOLEAN      DEFAULT FALSE,
  figli           TEXT,
  phone           VARCHAR(50),
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email_society (email, society_id),
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS players (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  society_id           INT          NOT NULL,
  nome                 VARCHAR(255) NOT NULL,
  cognome              VARCHAR(255) NOT NULL,
  soprannome           VARCHAR(255),
  numero               INT,
  ruolo_campo          VARCHAR(50),
  anno_nascita         INT,
  leva                 VARCHAR(100),
  telefono_genitore    VARCHAR(50),
  email_genitore       VARCHAR(255),
  note                 TEXT,
  foto_url             TEXT,
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_players (
  user_id    INT NOT NULL,
  player_id  INT NOT NULL,
  PRIMARY KEY (user_id, player_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leve (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  nome        VARCHAR(100) NOT NULL,
  ordine      INT          DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_leva (society_id, nome),
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  tipo        VARCHAR(50)  NOT NULL,
  titolo      VARCHAR(255) NOT NULL,
  leva        VARCHAR(100),
  luogo       VARCHAR(255),
  data_inizio DATE,
  ora_inizio  TIME,
  data_fine   DATE,
  ora_fine    TIME,
  note        TEXT,
  ricorrente  BOOLEAN      DEFAULT FALSE,
  freq        VARCHAR(50),
  giorni      VARCHAR(100),
  fino_al     DATE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS presenze (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  player_id   INT          NOT NULL,
  event_id    INT          NOT NULL,
  stato       VARCHAR(20)  DEFAULT 'assente',
  nota        TEXT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pres (player_id, event_id),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id)  REFERENCES events(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comunicazioni (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  autore_id   INT,
  tipo        VARCHAR(50),
  titolo      VARCHAR(255),
  testo       TEXT,
  bacheca     VARCHAR(100),
  leva        VARCHAR(100),
  urgente     BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comunicazioni_reads (
  comunicazione_id  INT NOT NULL,
  user_id           INT NOT NULL,
  letto_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comunicazione_id, user_id),
  FOREIGN KEY (comunicazione_id) REFERENCES comunicazioni(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)          REFERENCES users(id)         ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  chat_id     VARCHAR(100) NOT NULL,
  autore_id   INT,
  testo       TEXT,
  foto_url    TEXT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chat (society_id, chat_id, created_at),
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quote (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT             NOT NULL,
  player_id   INT             NOT NULL,
  importo     DECIMAL(10, 2),
  scadenza    DATE,
  stato       VARCHAR(20)     DEFAULT 'in_attesa',
  leva        VARCHAR(100),
  stagione    VARCHAR(20),
  nota        TEXT,
  created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id)  REFERENCES players(id)   ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifiche (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  user_id     INT,
  tipo        VARCHAR(50),
  titolo      VARCHAR(255),
  messaggio   TEXT,
  letto       BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT,
  society_key     VARCHAR(255),
  subscription    TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_push (user_id, society_key)
);

CREATE TABLE IF NOT EXISTS churn_feedback (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  society_id INT NOT NULL,
  motivo     VARCHAR(100),
  dettaglio  TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
var MIGRATIONS_SQL = `
ALTER TABLE societies ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'demo';
ALTER TABLE users ADD COLUMN phone VARCHAR(50);
ALTER TABLE societies ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE societies ADD COLUMN stripe_subscription_id VARCHAR(255)
`;
var SEED_SQL = `
INSERT IGNORE INTO societies (nome, citta, codice, piano, stato)
  VALUES ('Polis Genova', 'Genova', 'POLIS18', 'base', 'attiva');

INSERT IGNORE INTO societies (nome, citta, codice, piano, stato)
  VALUES ('Stella Azzurra Demo', 'Italia', 'STELLA25', 'demo', 'attiva');
`;

// src/routes/v2/auth.ts
import { Router as Router9 } from "express";
import { pool as pool8 } from "@workspace/db";

// src/lib/auth.ts
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
var JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
var JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60;
function signJWT(payload) {
  const full = { ...payload, exp: Math.floor(Date.now() / 1e3) + JWT_EXPIRY_SECONDS };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}
function verifyJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expected = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Math.floor(Date.now() / 1e3)) return null;
    return payload;
  } catch {
    return null;
  }
}
function hashPassword(plain) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(plain, salt, 1e5, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(plain, stored) {
  try {
    if (!stored.includes(":")) {
      return plain === stored;
    }
    const [salt, hash] = stored.split(":");
    const attempt = pbkdf2Sync(plain, salt, 1e5, 64, "sha512").toString("hex");
    const hashBuf = Buffer.from(hash, "hex");
    const attemptBuf = Buffer.from(attempt, "hex");
    return hashBuf.length === attemptBuf.length && timingSafeEqual(hashBuf, attemptBuf);
  } catch {
    return false;
  }
}
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const payload = verifyJWT(auth.slice(7));
  if (!payload) {
    res.status(401).json({ error: "invalid_token" });
    return;
  }
  req.jwtUser = payload;
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.jwtUser) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    if (!roles.includes(req.jwtUser.role)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    next();
  };
}

// src/routes/v2/auth.ts
var router9 = Router9();
router9.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "missing_fields" });
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const [rows] = await pool8.execute(
      `SELECT u.id, u.society_id, u.nome, u.cognome, u.email, u.password_hash,
              u.ruolo, u.leva, u.stato, u.temp_password, u.figli,
              s.nome AS society_nome, s.citta, s.colore_primario, s.colore_accento,
              s.codice, s.piano, s.stato AS society_stato, s.logo_url
       FROM users u
       JOIN societies s ON s.id = u.society_id
       WHERE LOWER(u.email) = ? AND u.stato = 'attivo' AND s.stato = 'attiva'
       LIMIT 1`,
      [normalizedEmail]
    );
    if (!rows.length) return res.status(401).json({ error: "invalid_credentials" });
    const user = rows[0];
    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: "invalid_credentials" });
    }
    const token = signJWT({
      userId: user.id,
      societyId: user.society_id,
      role: user.ruolo,
      email: user.email
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
        figli: user.figli ? JSON.parse(user.figli) : []
      },
      society: {
        id: user.society_id,
        nome: user.society_nome,
        citta: user.citta,
        colorePrimario: user.colore_primario,
        coloreAccento: user.colore_accento,
        codice: user.codice,
        piano: user.piano,
        logoUrl: user.logo_url
      }
    });
  } catch (e) {
    logger.error({ err: e }, "v2 login error");
    return res.status(500).json({ error: "server_error" });
  }
});
router9.post("/auth/register", async (req, res) => {
  const { code, nome, cognome, email, password } = req.body;
  if (!code || !nome || !cognome || !email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (password.length < 6) return res.status(400).json({ error: "password_too_short" });
  const normalizedEmail = email.trim().toLowerCase();
  const upperCode = code.trim().toUpperCase();
  try {
    const [socRows] = await pool8.execute(
      "SELECT id, nome FROM societies WHERE UPPER(codice) = ? AND stato = 'attiva' LIMIT 1",
      [upperCode]
    );
    if (!socRows.length) return res.status(400).json({ error: "invalid_code" });
    const society = socRows[0];
    const [existing] = await pool8.execute(
      "SELECT id FROM users WHERE LOWER(email) = ? AND society_id = ?",
      [normalizedEmail, society.id]
    );
    if (existing.length) return res.status(409).json({ error: "email_exists" });
    const hash = hashPassword(password);
    const [result] = await pool8.execute(
      "INSERT INTO users (society_id, nome, cognome, email, password_hash, ruolo, stato) VALUES (?, ?, ?, ?, ?, 'genitore', 'pendente')",
      [society.id, nome.trim(), cognome.trim(), normalizedEmail, hash]
    );
    logger.info({ societyId: society.id, email: normalizedEmail }, "v2 register: pending approval");
    return res.status(201).json({ ok: true, societyName: society.nome, pending: true });
  } catch (e) {
    logger.error({ err: e }, "v2 register error");
    return res.status(500).json({ error: "server_error" });
  }
});
router9.post("/auth/verify-code", async (req, res) => {
  const { code } = req.body;
  if (!code?.trim()) return res.status(400).json({ valid: false, error: "missing_code" });
  const upperCode = code.trim().toUpperCase();
  try {
    const [rows] = await pool8.execute(
      "SELECT id, nome FROM societies WHERE UPPER(codice) = ? AND stato = 'attiva' LIMIT 1",
      [upperCode]
    );
    if (rows.length) {
      return res.json({ valid: true, societyId: rows[0].id, societyName: rows[0].nome });
    }
    const [blobRows] = await pool8.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    );
    for (const row of blobRows) {
      let state;
      try {
        state = JSON.parse(row.state_json);
      } catch {
        continue;
      }
      const rowCode = (state.codiceSocieta ?? "").trim().toUpperCase();
      if (!rowCode || rowCode !== upperCode) continue;
      const stateKey = row.key;
      let societyId = 0;
      const match = stateKey.match(/fieldos_state_soc_(\d+)$/);
      if (match) societyId = parseInt(match[1], 10);
      return res.json({ valid: true, societyId, stateKey, societyName: state.nomeSocieta ?? "MyVivaio" });
    }
    return res.json({ valid: false });
  } catch (e) {
    logger.error({ err: e }, "v2 verify-code error");
    return res.status(500).json({ valid: false, error: "server_error" });
  }
});
router9.post("/auth/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "missing_fields" });
  if (newPassword.length < 6) return res.status(400).json({ error: "password_too_short" });
  const userId = req.jwtUser.userId;
  try {
    const [rows] = await pool8.execute(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    if (!verifyPassword(currentPassword, rows[0].password_hash)) {
      return res.status(401).json({ error: "wrong_current_password" });
    }
    await pool8.execute(
      "UPDATE users SET password_hash = ?, temp_password = FALSE WHERE id = ?",
      [hashPassword(newPassword), userId]
    );
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "change-password error");
    return res.status(500).json({ error: "server_error" });
  }
});
var auth_default2 = router9;

// src/routes/v2/self-register.ts
import { Router as Router10 } from "express";
import { pool as pool9 } from "@workspace/db";

// src/lib/email.ts
var RESEND_API = "https://api.resend.com/emails";
var FROM = "MyVivaio <noreply@myvivaio.app>";
var ADMIN_TO = "info@myvivaio.app";
async function sendMail(to, subject, html) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    logger.warn("RESEND_API_KEY not set \u2014 email skipped");
    return;
  }
  const resp = await fetch(RESEND_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html })
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Resend ${resp.status}: ${body}`);
  }
}
async function sendWelcomeEmails(opts) {
  const { nome, cognome, email, phone, nomeSocieta, piano, demoExpires } = opts;
  const pianoLabel = piano === "mister" ? "Mister" : piano === "mister_pro" ? "Mister Pro" : "Societ\xE0";
  const dataReg = (/* @__PURE__ */ new Date()).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const waLink = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : null;
  const adminHtml = `
<div style="font-family:sans-serif;max-width:480px;color:#1e293b;">
  <h2 style="color:#1A7A4A;margin-bottom:4px;">\u{1F195} Nuova registrazione \u2014 MyVivaio</h2>
  <p style="color:#64748b;font-size:.85rem;margin-top:0;">${dataReg}</p>
  <table style="border-collapse:collapse;width:100%;margin-top:12px;">
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;white-space:nowrap;">Nome</td>
      <td style="padding:8px 0;font-weight:700;">${nome} ${cognome}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Email</td>
      <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#1A7A4A;">${email}</a></td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">WhatsApp</td>
      <td style="padding:8px 0;">${waLink ? `<a href="${waLink}" style="color:#1A7A4A;font-weight:700;">${phone}</a>` : "\u2014"}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Societ\xE0</td>
      <td style="padding:8px 0;font-weight:700;">${nomeSocieta}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Piano</td>
      <td style="padding:8px 0;">${pianoLabel}</td>
    </tr>
    <tr>
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Demo scade</td>
      <td style="padding:8px 0;">${demoExpires.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</td>
    </tr>
  </table>
  ${waLink ? `<p style="margin-top:20px;"><a href="${waLink}" style="background:#25d366;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">\u{1F4AC} Apri WhatsApp</a></p>` : ""}
</div>`;
  try {
    await sendMail(
      ADMIN_TO,
      `[MyVivaio] Nuova registrazione: ${nome} ${cognome} \u2014 ${nomeSocieta}`,
      adminHtml
    );
    logger.info({ email }, "admin notification sent");
  } catch (e) {
    logger.error({ err: e }, "email send failed (non-blocking)");
  }
}

// src/routes/v2/self-register.ts
var router10 = Router10();
var DEMO_DAYS = {
  mister: 14,
  mister_pro: 14,
  societa: 10
};
var VALID_PIANI = /* @__PURE__ */ new Set(["mister", "mister_pro", "societa"]);
router10.post("/auth/self-register", async (req, res) => {
  const { nome, cognome, email, password, phone, nomeSocieta, citta, piano } = req.body;
  if (!nome?.trim() || !cognome?.trim() || !email?.trim() || !password || !nomeSocieta?.trim()) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "invalid_email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password_too_short" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const pianoNorm = VALID_PIANI.has(piano ?? "") ? piano : "mister";
  const demoDays = DEMO_DAYS[pianoNorm] ?? 14;
  const demoExpires = new Date(Date.now() + demoDays * 24 * 60 * 60 * 1e3);
  const codice = _generateCode(nomeSocieta.trim());
  let conn = null;
  try {
    conn = await pool9.getConnection();
    await conn.beginTransaction();
    const [dup] = await conn.execute(
      "SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1",
      [normalizedEmail]
    );
    if (dup.length) {
      await conn.rollback();
      return res.status(409).json({ error: "email_exists" });
    }
    const [socRes] = await conn.execute(
      `INSERT INTO societies
         (nome, citta, codice, piano, subscription_status, demo_scadenza, stato)
       VALUES (?, ?, ?, ?, 'demo', ?, 'attiva')`,
      [nomeSocieta.trim(), (citta ?? "").trim(), codice, pianoNorm, demoExpires]
    );
    const societyId = socRes.insertId;
    const hash = hashPassword(password);
    const [userRes] = await conn.execute(
      `INSERT INTO users
         (society_id, nome, cognome, email, password_hash, ruolo, stato, phone)
       VALUES (?, ?, ?, ?, ?, 'admin', 'attivo', ?)`,
      [societyId, nome.trim(), cognome.trim(), normalizedEmail, hash, (phone ?? "").trim()]
    );
    const userId = userRes.insertId;
    await conn.execute(
      "INSERT INTO leve (society_id, nome, ordine) VALUES (?, ?, 0)",
      [societyId, "Prima Squadra"]
    );
    await conn.commit();
    const token = signJWT({ userId, societyId, role: "admin", email: normalizedEmail });
    _superchatWebhook({ phone: (phone ?? "").trim(), nome: nome.trim(), email: normalizedEmail, piano: pianoNorm }).catch(() => {
    });
    sendWelcomeEmails({
      nome: nome.trim(),
      cognome: cognome.trim(),
      email: normalizedEmail,
      phone: (phone ?? "").trim(),
      nomeSocieta: nomeSocieta.trim(),
      piano: pianoNorm,
      demoExpires
    }).catch(() => {
    });
    logger.info({ userId, societyId, email: normalizedEmail, piano: pianoNorm }, "self-register ok");
    return res.status(201).json({
      token,
      user: {
        id: userId,
        societyId,
        nome: nome.trim(),
        cognome: cognome.trim(),
        email: normalizedEmail,
        ruolo: "admin"
      },
      society: {
        id: societyId,
        nome: nomeSocieta.trim(),
        citta: (citta ?? "").trim(),
        piano: pianoNorm,
        codice,
        demoExpires: demoExpires.toISOString(),
        demoDays
      }
    });
  } catch (e) {
    if (conn) await conn.rollback().catch(() => {
    });
    logger.error({ err: e }, "self-register error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  } finally {
    if (conn) conn.release();
  }
});
async function _superchatWebhook(opts) {
  const url = process.env.SUPERCHAT_WEBHOOK_URL;
  if (!url) return;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: opts.phone, name: opts.nome, email: opts.email, piano: opts.piano })
  });
  if (!resp.ok) {
    logger.warn({ status: resp.status, email: opts.email }, "superchat webhook failed");
  } else {
    logger.info({ email: opts.email }, "superchat webhook ok");
  }
}
function _generateCode(nome) {
  const clean = nome.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5).padEnd(3, "X");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${clean}${rand}`;
}
var self_register_default = router10;

// src/routes/v2/society.ts
import { Router as Router11 } from "express";
import { pool as pool10 } from "@workspace/db";
var router11 = Router11();
router11.get("/society", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool10.execute(
      "SELECT id, nome, citta, colore_primario, colore_accento, logo_url, codice, piano, demo_scadenza, stato, created_at FROM societies WHERE id = ?",
      [societyId]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e) {
    logger.error({ err: e }, "GET society error");
    return res.status(500).json({ error: "server_error" });
  }
});
router11.put("/society", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { nome, citta, colorePrimario, coloreAccento, logoUrl, codice } = req.body;
  try {
    if (codice !== void 0) {
      const [conflict] = await pool10.execute(
        "SELECT id FROM societies WHERE UPPER(codice) = UPPER(?) AND id != ?",
        [codice, societyId]
      );
      if (conflict.length) return res.status(409).json({ error: "codice_in_uso" });
    }
    await pool10.execute(
      `UPDATE societies SET
        nome            = COALESCE(?, nome),
        citta           = COALESCE(?, citta),
        colore_primario = COALESCE(?, colore_primario),
        colore_accento  = COALESCE(?, colore_accento),
        logo_url        = COALESCE(?, logo_url),
        codice          = COALESCE(?, codice)
       WHERE id = ?`,
      [nome ?? null, citta ?? null, colorePrimario ?? null, coloreAccento ?? null, logoUrl ?? null, codice ?? null, societyId]
    );
    const [rows] = await pool10.execute(
      "SELECT id, nome, citta, colore_primario, colore_accento, logo_url, codice, piano, stato FROM societies WHERE id = ?",
      [societyId]
    );
    return res.json(rows[0]);
  } catch (e) {
    logger.error({ err: e }, "PUT society error");
    return res.status(500).json({ error: "server_error" });
  }
});
var society_default = router11;

// src/routes/v2/leve.ts
import { Router as Router12 } from "express";
import { pool as pool11 } from "@workspace/db";
var router12 = Router12();
router12.get("/leve", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool11.execute(
      "SELECT id, nome, ordine FROM leve WHERE society_id = ? ORDER BY ordine, nome",
      [societyId]
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET leve error");
    return res.status(500).json({ error: "server_error" });
  }
});
router12.post("/leve", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { nome, ordine } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: "nome_required" });
  try {
    const [result] = await pool11.execute(
      "INSERT INTO leve (society_id, nome, ordine) VALUES (?, ?, ?)",
      [societyId, nome.trim(), ordine ?? 0]
    );
    return res.status(201).json({ id: result.insertId, nome: nome.trim(), ordine: ordine ?? 0 });
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "leva_exists" });
    logger.error({ err: e }, "POST leva error");
    return res.status(500).json({ error: "server_error" });
  }
});
router12.put("/leve/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { nome, ordine } = req.body;
  try {
    const [result] = await pool11.execute(
      "UPDATE leve SET nome = COALESCE(?, nome), ordine = COALESCE(?, ordine) WHERE id = ? AND society_id = ?",
      [nome ?? null, ordine ?? null, req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "PUT leva error");
    return res.status(500).json({ error: "server_error" });
  }
});
router12.delete("/leve/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [result] = await pool11.execute(
      "DELETE FROM leve WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "DELETE leva error");
    return res.status(500).json({ error: "server_error" });
  }
});
var leve_default = router12;

// src/routes/v2/players.ts
import { Router as Router13 } from "express";
import { pool as pool12 } from "@workspace/db";
var router13 = Router13();
var ADMIN_ROLES = ["admin", "allenatore", "dirigente"];
router13.get("/players", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  const leva = req.query.leva;
  try {
    const [rows] = await pool12.execute(
      `SELECT p.id, p.nome, p.cognome, p.soprannome, p.numero, p.ruolo_campo,
              p.anno_nascita, p.leva, p.telefono_genitore, p.email_genitore,
              p.note, p.foto_url, p.created_at
       FROM players p
       WHERE p.society_id = ?
         ${leva ? "AND p.leva = ?" : ""}
       ORDER BY p.cognome, p.nome`,
      leva ? [societyId, leva] : [societyId]
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET players error");
    return res.status(500).json({ error: "server_error" });
  }
});
router13.get("/players/:id", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool12.execute(
      "SELECT * FROM players WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e) {
    logger.error({ err: e }, "GET player error");
    return res.status(500).json({ error: "server_error" });
  }
});
router13.post("/players", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser;
  const {
    nome,
    cognome,
    soprannome,
    numero,
    ruoloCampo,
    annoNascita,
    leva,
    telefonoGenitore,
    emailGenitore,
    note
  } = req.body;
  if (!nome?.trim() || !cognome?.trim()) {
    return res.status(400).json({ error: "nome_cognome_required" });
  }
  try {
    const [result] = await pool12.execute(
      `INSERT INTO players
        (society_id, nome, cognome, soprannome, numero, ruolo_campo, anno_nascita,
         leva, telefono_genitore, email_genitore, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        societyId,
        nome.trim(),
        cognome.trim(),
        soprannome ?? null,
        numero ?? null,
        ruoloCampo ?? null,
        annoNascita ?? null,
        leva ?? null,
        telefonoGenitore ?? null,
        emailGenitore ?? null,
        note ?? null
      ]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST player error");
    return res.status(500).json({ error: "server_error" });
  }
});
router13.put("/players/:id", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser;
  const {
    nome,
    cognome,
    soprannome,
    numero,
    ruoloCampo,
    annoNascita,
    leva,
    telefonoGenitore,
    emailGenitore,
    note,
    fotoUrl
  } = req.body;
  try {
    const [result] = await pool12.execute(
      `UPDATE players SET
        nome             = COALESCE(?, nome),
        cognome          = COALESCE(?, cognome),
        soprannome       = COALESCE(?, soprannome),
        numero           = COALESCE(?, numero),
        ruolo_campo      = COALESCE(?, ruolo_campo),
        anno_nascita     = COALESCE(?, anno_nascita),
        leva             = COALESCE(?, leva),
        telefono_genitore = COALESCE(?, telefono_genitore),
        email_genitore   = COALESCE(?, email_genitore),
        note             = COALESCE(?, note),
        foto_url         = COALESCE(?, foto_url)
       WHERE id = ? AND society_id = ?`,
      [
        nome ?? null,
        cognome ?? null,
        soprannome ?? null,
        numero ?? null,
        ruoloCampo ?? null,
        annoNascita ?? null,
        leva ?? null,
        telefonoGenitore ?? null,
        emailGenitore ?? null,
        note ?? null,
        fotoUrl ?? null,
        req.params.id,
        societyId
      ]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "PUT player error");
    return res.status(500).json({ error: "server_error" });
  }
});
router13.delete("/players/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [result] = await pool12.execute(
      "DELETE FROM players WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "DELETE player error");
    return res.status(500).json({ error: "server_error" });
  }
});
var players_default = router13;

// src/routes/v2/users.ts
import { Router as Router14 } from "express";
import { pool as pool13 } from "@workspace/db";
var router14 = Router14();
router14.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool13.execute(
      `SELECT id, nome, cognome, email, ruolo, leva, stato, temp_password, figli, created_at
       FROM users WHERE society_id = ? ORDER BY cognome, nome`,
      [societyId]
    );
    return res.json(rows.map((u) => ({
      ...u,
      figli: u.figli ? JSON.parse(u.figli) : [],
      tempPassword: u.temp_password === 1
    })));
  } catch (e) {
    logger.error({ err: e }, "GET users error");
    return res.status(500).json({ error: "server_error" });
  }
});
router14.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { nome, cognome, email, password, ruolo, leva, figli } = req.body;
  if (!nome || !cognome || !email || !password || !ruolo) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const hash = hashPassword(password);
  try {
    const [existing] = await pool13.execute(
      "SELECT id FROM users WHERE LOWER(email) = ? AND society_id = ?",
      [normalizedEmail, societyId]
    );
    if (existing.length) return res.status(409).json({ error: "email_exists" });
    const [result] = await pool13.execute(
      `INSERT INTO users (society_id, nome, cognome, email, password_hash, ruolo, leva, figli, temp_password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        societyId,
        nome.trim(),
        cognome.trim(),
        normalizedEmail,
        hash,
        ruolo,
        leva ?? null,
        figli ? JSON.stringify(figli) : null
      ]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST user error");
    return res.status(500).json({ error: "server_error" });
  }
});
router14.put("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { nome, cognome, email, password, ruolo, leva, stato, figli } = req.body;
  try {
    const updates = [];
    const params = [];
    if (nome) {
      updates.push("nome = ?");
      params.push(nome.trim());
    }
    if (cognome) {
      updates.push("cognome = ?");
      params.push(cognome.trim());
    }
    if (email) {
      updates.push("email = ?");
      params.push(email.trim().toLowerCase());
    }
    if (ruolo) {
      updates.push("ruolo = ?");
      params.push(ruolo);
    }
    if (leva !== void 0) {
      updates.push("leva = ?");
      params.push(leva ?? null);
    }
    if (stato) {
      updates.push("stato = ?");
      params.push(stato);
    }
    if (figli !== void 0) {
      updates.push("figli = ?");
      params.push(figli ? JSON.stringify(figli) : null);
    }
    if (password) {
      updates.push("password_hash = ?");
      updates.push("temp_password = TRUE");
      params.push(hashPassword(password));
    }
    if (!updates.length) return res.status(400).json({ error: "nothing_to_update" });
    params.push(req.params.id, societyId);
    const [result] = await pool13.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ? AND society_id = ?`,
      params
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "PUT user error");
    return res.status(500).json({ error: "server_error" });
  }
});
router14.delete("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId, userId } = req.jwtUser;
  if (String(userId) === req.params.id) return res.status(400).json({ error: "cannot_delete_self" });
  try {
    const [result] = await pool13.execute(
      "DELETE FROM users WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "DELETE user error");
    return res.status(500).json({ error: "server_error" });
  }
});
router14.get("/users/pending", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool13.execute(
      "SELECT id, nome, cognome, email, created_at FROM users WHERE society_id = ? AND stato = 'pendente' ORDER BY created_at DESC",
      [societyId]
    );
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
router14.post("/users/:id/approve", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { ruolo, leva, figli } = req.body;
  try {
    const [result] = await pool13.execute(
      `UPDATE users SET stato = 'attivo', ruolo = COALESCE(?, ruolo),
        leva = COALESCE(?, leva), figli = COALESCE(?, figli)
       WHERE id = ? AND society_id = ? AND stato = 'pendente'`,
      [ruolo ?? null, leva ?? null, figli ? JSON.stringify(figli) : null, req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
var users_default = router14;

// src/routes/v2/events.ts
import { Router as Router15 } from "express";
import { pool as pool14 } from "@workspace/db";
var router15 = Router15();
var WRITE_ROLES = ["admin", "allenatore", "dirigente"];
router15.get("/events", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  const { month, year, leva } = req.query;
  let whereExtra = "";
  const params = [societyId];
  if (month && year) {
    whereExtra += " AND MONTH(data_inizio) = ? AND YEAR(data_inizio) = ?";
    params.push(parseInt(month), parseInt(year));
  }
  if (leva) {
    whereExtra += " AND (leva = ? OR leva IS NULL)";
    params.push(leva);
  }
  try {
    const [rows] = await pool14.execute(
      `SELECT id, tipo, titolo, leva, luogo, data_inizio, ora_inizio, data_fine, ora_fine,
              note, ricorrente, freq, giorni, fino_al, created_at
       FROM events WHERE society_id = ?${whereExtra} ORDER BY data_inizio, ora_inizio`,
      params
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET events error");
    return res.status(500).json({ error: "server_error" });
  }
});
router15.get("/events/:id", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool14.execute(
      "SELECT * FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
router15.post("/events", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser;
  const {
    tipo,
    titolo,
    leva,
    luogo,
    dataInizio,
    oraInizio,
    dataFine,
    oraFine,
    note,
    ricorrente,
    freq,
    giorni,
    finoAl
  } = req.body;
  if (!tipo || !titolo) return res.status(400).json({ error: "tipo_titolo_required" });
  try {
    const [result] = await pool14.execute(
      `INSERT INTO events (society_id, tipo, titolo, leva, luogo, data_inizio, ora_inizio,
                           data_fine, ora_fine, note, ricorrente, freq, giorni, fino_al)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        societyId,
        tipo,
        titolo,
        leva ?? null,
        luogo ?? null,
        dataInizio ?? null,
        oraInizio ?? null,
        dataFine ?? null,
        oraFine ?? null,
        note ?? null,
        ricorrente ? 1 : 0,
        freq ?? null,
        giorni ?? null,
        finoAl ?? null
      ]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST event error");
    return res.status(500).json({ error: "server_error" });
  }
});
router15.put("/events/:id", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser;
  const {
    tipo,
    titolo,
    leva,
    luogo,
    dataInizio,
    oraInizio,
    dataFine,
    oraFine,
    note,
    ricorrente,
    freq,
    giorni,
    finoAl
  } = req.body;
  try {
    const [result] = await pool14.execute(
      `UPDATE events SET
        tipo        = COALESCE(?, tipo),
        titolo      = COALESCE(?, titolo),
        leva        = COALESCE(?, leva),
        luogo       = COALESCE(?, luogo),
        data_inizio = COALESCE(?, data_inizio),
        ora_inizio  = COALESCE(?, ora_inizio),
        data_fine   = COALESCE(?, data_fine),
        ora_fine    = COALESCE(?, ora_fine),
        note        = COALESCE(?, note),
        ricorrente  = COALESCE(?, ricorrente),
        freq        = COALESCE(?, freq),
        giorni      = COALESCE(?, giorni),
        fino_al     = COALESCE(?, fino_al)
       WHERE id = ? AND society_id = ?`,
      [
        tipo ?? null,
        titolo ?? null,
        leva ?? null,
        luogo ?? null,
        dataInizio ?? null,
        oraInizio ?? null,
        dataFine ?? null,
        oraFine ?? null,
        note ?? null,
        ricorrente != null ? ricorrente ? 1 : 0 : null,
        freq ?? null,
        giorni ?? null,
        finoAl ?? null,
        req.params.id,
        societyId
      ]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "PUT event error");
    return res.status(500).json({ error: "server_error" });
  }
});
router15.delete("/events/:id", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [result] = await pool14.execute(
      "DELETE FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
var events_default = router15;

// src/routes/v2/presenze.ts
import { Router as Router16 } from "express";
import { pool as pool15 } from "@workspace/db";
var router16 = Router16();
router16.get("/presenze", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  const { eventId } = req.query;
  if (!eventId) return res.status(400).json({ error: "eventId_required" });
  try {
    const [rows] = await pool15.execute(
      `SELECT pr.id, pr.player_id, pr.event_id, pr.stato, pr.nota, pr.created_at,
              p.nome, p.cognome, p.numero, p.leva
       FROM presenze pr
       JOIN players p ON p.id = pr.player_id
       JOIN events e ON e.id = pr.event_id AND e.society_id = ?
       WHERE pr.event_id = ?
       ORDER BY p.cognome, p.nome`,
      [societyId, eventId]
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET presenze error");
    return res.status(500).json({ error: "server_error" });
  }
});
router16.post("/presenze", requireAuth, requireRole("admin", "allenatore", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { playerId, eventId, stato, nota } = req.body;
  if (!playerId || !eventId || !stato) return res.status(400).json({ error: "missing_fields" });
  try {
    const [evCheck] = await pool15.execute(
      "SELECT id FROM events WHERE id = ? AND society_id = ?",
      [eventId, societyId]
    );
    if (!evCheck.length) return res.status(403).json({ error: "forbidden" });
    await pool15.execute(
      `INSERT INTO presenze (player_id, event_id, stato, nota)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE stato = VALUES(stato), nota = VALUES(nota)`,
      [playerId, eventId, stato, nota ?? null]
    );
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "POST presenza error");
    return res.status(500).json({ error: "server_error" });
  }
});
router16.post("/presenze/bulk", requireAuth, requireRole("admin", "allenatore", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { eventId, presenze } = req.body;
  if (!eventId || !Array.isArray(presenze)) return res.status(400).json({ error: "missing_fields" });
  try {
    const [evCheck] = await pool15.execute(
      "SELECT id FROM events WHERE id = ? AND society_id = ?",
      [eventId, societyId]
    );
    if (!evCheck.length) return res.status(403).json({ error: "forbidden" });
    if (!presenze.length) return res.json({ ok: true, updated: 0 });
    const values = presenze.map((p) => [p.playerId, eventId, p.stato, p.nota ?? null]);
    const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");
    const flat = values.flat();
    await pool15.execute(
      `INSERT INTO presenze (player_id, event_id, stato, nota) VALUES ${placeholders}
       ON DUPLICATE KEY UPDATE stato = VALUES(stato), nota = VALUES(nota)`,
      flat
    );
    return res.json({ ok: true, updated: presenze.length });
  } catch (e) {
    logger.error({ err: e }, "POST presenze/bulk error");
    return res.status(500).json({ error: "server_error" });
  }
});
var presenze_default = router16;

// src/routes/v2/comunicazioni.ts
import { Router as Router17 } from "express";
import { pool as pool16 } from "@workspace/db";
var router17 = Router17();
router17.get("/comunicazioni", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser;
  const { leva, limit = "50", offset = "0" } = req.query;
  try {
    const [rows] = await pool16.execute(
      `SELECT c.id, c.autore_id, c.tipo, c.titolo, c.testo, c.bacheca, c.leva,
              c.urgente, c.created_at,
              u.nome AS autore_nome, u.cognome AS autore_cognome,
              MAX(cr.letto_at) IS NOT NULL AS letto
       FROM comunicazioni c
       LEFT JOIN users u ON u.id = c.autore_id
       LEFT JOIN comunicazioni_reads cr ON cr.comunicazione_id = c.id AND cr.user_id = ?
       WHERE c.society_id = ?
         ${leva ? "AND (c.leva = ? OR c.leva IS NULL)" : ""}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      leva ? [userId, societyId, leva, parseInt(limit), parseInt(offset)] : [userId, societyId, parseInt(limit), parseInt(offset)]
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET comunicazioni error");
    return res.status(500).json({ error: "server_error" });
  }
});
router17.post("/comunicazioni", requireAuth, requireRole("admin", "allenatore", "dirigente"), async (req, res) => {
  const { societyId, userId } = req.jwtUser;
  const { tipo, titolo, testo, bacheca, leva, urgente } = req.body;
  if (!testo) return res.status(400).json({ error: "testo_required" });
  try {
    const [result] = await pool16.execute(
      "INSERT INTO comunicazioni (society_id, autore_id, tipo, titolo, testo, bacheca, leva, urgente) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        societyId,
        userId,
        tipo ?? "comunicazione",
        titolo ?? null,
        testo,
        bacheca ?? "generale",
        leva ?? null,
        urgente ? 1 : 0
      ]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST comunicazione error");
    return res.status(500).json({ error: "server_error" });
  }
});
router17.post("/comunicazioni/:id/read", requireAuth, async (req, res) => {
  const { userId } = req.jwtUser;
  try {
    await pool16.execute(
      "INSERT IGNORE INTO comunicazioni_reads (comunicazione_id, user_id) VALUES (?, ?)",
      [req.params.id, userId]
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
router17.delete("/comunicazioni/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [result] = await pool16.execute(
      "DELETE FROM comunicazioni WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
var comunicazioni_default = router17;

// src/routes/v2/chat.ts
import { Router as Router18 } from "express";
import { pool as pool17 } from "@workspace/db";
var router18 = Router18();
router18.get("/chat/:chatId/messages", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  const { chatId } = req.params;
  const { limit = "50", before } = req.query;
  try {
    const [rows] = await pool17.execute(
      `SELECT m.id, m.autore_id, m.testo, m.foto_url, m.created_at,
              u.nome AS autore_nome, u.cognome AS autore_cognome, u.ruolo AS autore_ruolo
       FROM chat_messages m
       LEFT JOIN users u ON u.id = m.autore_id
       WHERE m.society_id = ? AND m.chat_id = ?
         ${before ? "AND m.id < ?" : ""}
       ORDER BY m.created_at DESC
       LIMIT ?`,
      before ? [societyId, chatId, parseInt(before), parseInt(limit)] : [societyId, chatId, parseInt(limit)]
    );
    return res.json(rows.reverse());
  } catch (e) {
    logger.error({ err: e }, "GET chat messages error");
    return res.status(500).json({ error: "server_error" });
  }
});
router18.post("/chat/:chatId/messages", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser;
  const { chatId } = req.params;
  const { testo, fotoUrl } = req.body;
  if (!testo?.trim() && !fotoUrl) return res.status(400).json({ error: "testo_or_foto_required" });
  try {
    const [result] = await pool17.execute(
      "INSERT INTO chat_messages (society_id, chat_id, autore_id, testo, foto_url) VALUES (?, ?, ?, ?, ?)",
      [societyId, chatId, userId, testo?.trim() ?? null, fotoUrl ?? null]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST chat message error");
    return res.status(500).json({ error: "server_error" });
  }
});
var chat_default = router18;

// src/routes/v2/quote.ts
import { Router as Router19 } from "express";
import { pool as pool18 } from "@workspace/db";
var router19 = Router19();
router19.get("/quote", requireAuth, requireRole("admin", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { leva, stato } = req.query;
  try {
    const [rows] = await pool18.execute(
      `SELECT q.id, q.player_id, q.importo, q.scadenza, q.stato, q.leva, q.stagione, q.nota,
              p.nome, p.cognome
       FROM quote q
       JOIN players p ON p.id = q.player_id
       WHERE q.society_id = ?
         ${leva ? "AND q.leva = ?" : ""}
         ${stato ? "AND q.stato = ?" : ""}
       ORDER BY q.scadenza, p.cognome`,
      [societyId, ...leva ? [leva] : [], ...stato ? [stato] : []]
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET quote error");
    return res.status(500).json({ error: "server_error" });
  }
});
router19.post("/quote", requireAuth, requireRole("admin", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { playerId, importo, scadenza, stato, leva, stagione, nota } = req.body;
  if (!playerId) return res.status(400).json({ error: "playerId_required" });
  try {
    const [result] = await pool18.execute(
      "INSERT INTO quote (society_id, player_id, importo, scadenza, stato, leva, stagione, nota) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        societyId,
        playerId,
        importo ?? null,
        scadenza ?? null,
        stato ?? "in_attesa",
        leva ?? null,
        stagione ?? null,
        nota ?? null
      ]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST quota error");
    return res.status(500).json({ error: "server_error" });
  }
});
router19.put("/quote/:id", requireAuth, requireRole("admin", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { importo, scadenza, stato, nota } = req.body;
  try {
    const [result] = await pool18.execute(
      `UPDATE quote SET
        importo  = COALESCE(?, importo),
        scadenza = COALESCE(?, scadenza),
        stato    = COALESCE(?, stato),
        nota     = COALESCE(?, nota)
       WHERE id = ? AND society_id = ?`,
      [
        importo ?? null,
        scadenza ?? null,
        stato ?? null,
        nota ?? null,
        req.params.id,
        societyId
      ]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
router19.delete("/quote/:id", requireAuth, requireRole("admin", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    await pool18.execute("DELETE FROM quote WHERE id = ? AND society_id = ?", [req.params.id, societyId]);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
var quote_default = router19;

// src/routes/v2/migrate.ts
import { Router as Router20 } from "express";
import { pool as pool19 } from "@workspace/db";
var router20 = Router20();
router20.post("/migrate", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const blob = req.body;
  if (!blob || typeof blob !== "object") {
    return res.status(400).json({ error: "body_must_be_blob_json" });
  }
  const report = {};
  const conn = await pool19.getConnection();
  try {
    await conn.beginTransaction();
    if (blob.nomeSocieta || blob.coloriPrimari) {
      await conn.execute(
        `UPDATE societies SET
          nome            = COALESCE(?, nome),
          colore_primario = COALESCE(?, colore_primario),
          colore_accento  = COALESCE(?, colore_accento),
          codice          = COALESCE(NULLIF(?, ''), codice)
         WHERE id = ?`,
        [
          blob.nomeSocieta ?? null,
          blob.coloriPrimari ?? null,
          blob.coloriAccento ?? null,
          blob.codiceSocieta ?? null,
          societyId
        ]
      );
    }
    let leveCount = 0;
    if (Array.isArray(blob.leve)) {
      for (const l of blob.leve) {
        if (!l?.trim()) continue;
        await conn.execute(
          "INSERT IGNORE INTO leve (society_id, nome) VALUES (?, ?)",
          [societyId, l.trim()]
        );
        leveCount++;
      }
    }
    report.leve = leveCount;
    const userIdMap = /* @__PURE__ */ new Map();
    let usersCount = 0;
    if (Array.isArray(blob.USERS_DB)) {
      for (const u of blob.USERS_DB) {
        if (!u.email || !u.nome) continue;
        const normalEmail = u.email.toLowerCase().trim();
        const figli = Array.isArray(u.figli) ? u.figli : u.figlio ? [u.figlio] : [];
        const roleMap = {
          admin: "admin",
          allenatore: "allenatore",
          dirigente: "dirigente",
          genitore: "genitore",
          nonno: "nonno",
          giocatore: "giocatore"
        };
        const ruolo = roleMap[u.role] ?? "genitore";
        const pwdHash = u.pass && !u.pass.includes(":") ? hashPassword(u.pass) : u.pass ?? hashPassword("changeme");
        try {
          const [existing] = await conn.execute(
            "SELECT id FROM users WHERE LOWER(email) = ? AND society_id = ?",
            [normalEmail, societyId]
          );
          let dbId;
          if (existing.length) {
            dbId = existing[0].id;
            await conn.execute(
              "UPDATE users SET nome = ?, cognome = ?, ruolo = ?, leva = ?, stato = ?, figli = ?, temp_password = ? WHERE id = ?",
              [
                u.nome,
                u.cogn ?? "",
                ruolo,
                u.leva ?? null,
                u.stato === "sospeso" ? "sospeso" : "attivo",
                figli.length ? JSON.stringify(figli) : null,
                u.tempPassword ? 1 : 0,
                dbId
              ]
            );
          } else {
            const [ins] = await conn.execute(
              "INSERT INTO users (society_id, nome, cognome, email, password_hash, ruolo, leva, stato, figli, temp_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [
                societyId,
                u.nome,
                u.cogn ?? "",
                normalEmail,
                pwdHash,
                ruolo,
                u.leva ?? null,
                u.stato === "sospeso" ? "sospeso" : "attivo",
                figli.length ? JSON.stringify(figli) : null,
                u.tempPassword ? 1 : 0
              ]
            );
            dbId = ins.insertId;
            usersCount++;
          }
          userIdMap.set(u.id, dbId);
        } catch (e) {
          logger.warn({ email: normalEmail, err: e?.message }, "migrate: skip user");
        }
      }
    }
    report.users = usersCount;
    const playerIdMap = /* @__PURE__ */ new Map();
    let playersCount = 0;
    if (Array.isArray(blob.players)) {
      for (const p of blob.players) {
        if (!p.nome) continue;
        const [existing] = await conn.execute(
          "SELECT id FROM players WHERE society_id = ? AND nome = ? AND cognome = ? AND COALESCE(leva,'') = COALESCE(?,'') LIMIT 1",
          [societyId, p.nome, p.cogn ?? "", p.leva ?? null]
        );
        let dbId;
        if (existing.length) {
          dbId = existing[0].id;
        } else {
          const [ins] = await conn.execute(
            "INSERT INTO players (society_id, nome, cognome, soprannome, numero, ruolo_campo, anno_nascita, leva, telefono_genitore, email_genitore, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              societyId,
              p.nome,
              p.cogn ?? "",
              p.sopran ?? null,
              p.numero ?? null,
              p.ruolo ?? null,
              p.anno ?? null,
              p.leva ?? null,
              p.telGenitore ?? null,
              p.emailGenitore ?? null,
              p.note ?? null
            ]
          );
          dbId = ins.insertId;
          playersCount++;
        }
        playerIdMap.set(p.id, dbId);
      }
    }
    report.players = playersCount;
    const eventIdMap = /* @__PURE__ */ new Map();
    let eventsCount = 0;
    if (Array.isArray(blob.events)) {
      for (const e of blob.events) {
        if (!e.type) continue;
        const typeMap = {
          allenamento: "allenamento",
          partita: "partita",
          campionato: "partita",
          torneo: "torneo",
          altro: "altro",
          allenamento_portieri: "allenamento"
        };
        const tipo = typeMap[e.type] ?? e.type;
        const titolo = e.title ?? tipo;
        const [ins] = await conn.execute(
          "INSERT INTO events (society_id, tipo, titolo, leva, luogo, data_inizio, ora_inizio, data_fine, ora_fine, note, ricorrente, freq, giorni, fino_al) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            societyId,
            tipo,
            titolo,
            e.leva ?? null,
            e.luogo ?? null,
            e.date ?? null,
            e.start ?? null,
            e.endDate ?? null,
            e.end ?? null,
            e.note ?? null,
            e.recurring ? 1 : 0,
            e.freq ?? null,
            e.days ?? null,
            e.until ?? null
          ]
        );
        eventIdMap.set(e.id, ins.insertId);
        eventsCount++;
      }
    }
    report.events = eventsCount;
    let commCount = 0;
    if (Array.isArray(blob.comunicazioni)) {
      for (const c of blob.comunicazioni) {
        const body = c.testo ?? c.text ?? "";
        if (!body) continue;
        const authorDbId = c.userId ? userIdMap.get(c.userId) ?? null : null;
        await conn.execute(
          "INSERT INTO comunicazioni (society_id, autore_id, tipo, titolo, testo, bacheca, leva, urgente, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            societyId,
            authorDbId,
            c.tipo ?? "comunicazione",
            c.titolo ?? null,
            body,
            c.bacheca ?? "generale",
            c.leva ?? null,
            c.urgente ? 1 : 0,
            c.date ? new Date(c.date) : /* @__PURE__ */ new Date()
          ]
        );
        commCount++;
      }
    }
    report.comunicazioni = commCount;
    let chatCount = 0;
    if (blob.chatMessaggi && typeof blob.chatMessaggi === "object") {
      for (const [chatId, messages] of Object.entries(blob.chatMessaggi)) {
        if (!Array.isArray(messages)) continue;
        for (const m of messages) {
          const testo = m.testo ?? m.text ?? "";
          const authorDbId = m.autoreId ? userIdMap.get(m.autoreId) ?? null : null;
          await conn.execute(
            "INSERT INTO chat_messages (society_id, chat_id, autore_id, testo, foto_url, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [
              societyId,
              chatId,
              authorDbId,
              testo || null,
              m.foto ?? null,
              m.ts ? new Date(m.ts) : m.date ? new Date(m.date) : /* @__PURE__ */ new Date()
            ]
          );
          chatCount++;
        }
      }
    }
    report.chatMessages = chatCount;
    await conn.commit();
    logger.info({ societyId, report }, "v2 migrate: completed");
    return res.json({ ok: true, report });
  } catch (e) {
    await conn.rollback();
    logger.error({ err: e }, "v2 migrate error");
    return res.status(500).json({ error: "migrate_failed", detail: e?.message });
  } finally {
    conn.release();
  }
});
var migrate_default = router20;

// src/routes/v2/stripe.ts
import { Router as Router21 } from "express";
import { createHmac as createHmac2, timingSafeEqual as timingSafeEqual2 } from "node:crypto";
import { pool as pool20 } from "@workspace/db";
var router21 = Router21();
var STRIPE_API = "https://api.stripe.com/v1";
var PRICE_ENV = {
  mister: { mensile: "STRIPE_PRICE_MISTER_MENSILE", annuale: "STRIPE_PRICE_MISTER_ANNUALE" },
  mister_pro: { mensile: "STRIPE_PRICE_MISTER_PRO_MENSILE", annuale: "STRIPE_PRICE_MISTER_PRO_ANNUALE" },
  societa: { mensile: "STRIPE_PRICE_SOCIETA_MENSILE", annuale: "STRIPE_PRICE_SOCIETA_ANNUALE" }
};
var PRORATA_PCT = {
  7: 100,
  // Agosto
  8: 92,
  // Settembre
  9: 83,
  // Ottobre
  10: 75,
  // Novembre
  11: 67,
  // Dicembre
  0: 58,
  // Gennaio
  1: 50,
  // Febbraio
  2: 42,
  // Marzo
  3: 33,
  // Aprile
  4: 25,
  // Maggio
  5: null,
  // Giugno — solo mensile
  6: null
  // Luglio  — solo mensile
};
function nextAugFirst() {
  const now = /* @__PURE__ */ new Date();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  const isToday = month === 7 && day === 1;
  const anchorYear = month >= 7 && !isToday ? now.getUTCFullYear() + 1 : month < 7 ? now.getUTCFullYear() : now.getUTCFullYear() + 1;
  return Math.floor(Date.UTC(anchorYear, 7, 1) / 1e3);
}
function getPriceId(piano, intervallo) {
  return process.env[PRICE_ENV[piano]?.[intervallo] ?? ""] || null;
}
function priceIdToPiano(priceId) {
  for (const [piano, intervals] of Object.entries(PRICE_ENV)) {
    for (const envVar of Object.values(intervals)) {
      if (process.env[envVar] === priceId) return piano;
    }
  }
  return null;
}
function stripeEncode(obj) {
  return Object.entries(obj).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}
async function stripePost(path2, params) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  const resp = await fetch(`${STRIPE_API}${path2}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: stripeEncode(params)
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message ?? `Stripe ${resp.status}`);
  return data;
}
async function stripeGet(path2) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  const resp = await fetch(`${STRIPE_API}${path2}`, {
    headers: { Authorization: `Bearer ${key}` }
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message ?? `Stripe ${resp.status}`);
  return data;
}
router21.post("/stripe/create-checkout", async (req, res) => {
  const { piano, intervallo, societyId, email } = req.body;
  if (!piano || !intervallo || !societyId) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (String(intervallo) === "annuale") {
    const month = (/* @__PURE__ */ new Date()).getUTCMonth();
    if (PRORATA_PCT[month] === null) {
      return res.status(400).json({
        error: "annual_not_available",
        detail: "Il piano annuale non \xE8 disponibile in giugno e luglio. Usa il piano mensile."
      });
    }
  }
  const priceId = getPriceId(String(piano), String(intervallo));
  if (!priceId) {
    return res.status(400).json({ error: "invalid_plan_or_interval" });
  }
  const appUrl = process.env.APP_URL ?? "https://workspacefieldos-production.up.railway.app";
  const params = {
    mode: "subscription",
    "payment_method_types[0]": "card",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": 1,
    "success_url": `${appUrl}/payment-success?piano=${encodeURIComponent(String(piano))}&intervallo=${encodeURIComponent(String(intervallo))}`,
    "cancel_url": `${appUrl}/subscribe`,
    "metadata[societyId]": String(societyId),
    "metadata[piano]": String(piano),
    "metadata[intervallo]": String(intervallo)
  };
  if (email) params["customer_email"] = String(email);
  if (String(intervallo) === "annuale") {
    params["subscription_data[billing_cycle_anchor]"] = nextAugFirst();
  }
  try {
    const session = await stripePost("/checkout/sessions", params);
    logger.info({ societyId, piano, intervallo }, "stripe checkout session created");
    return res.json({ url: session.url });
  } catch (e) {
    logger.error({ err: e }, "stripe create-checkout error");
    return res.status(500).json({ error: "stripe_error", detail: e?.message });
  }
});
router21.post("/stripe/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn("STRIPE_WEBHOOK_SECRET not set \u2014 webhook skipped");
    return res.sendStatus(200);
  }
  const rawBody = req.rawBody;
  if (!sig || !rawBody) {
    return res.status(400).json({ error: "missing_signature" });
  }
  const parts = Object.fromEntries(sig.split(",").map((p) => p.split("=")));
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) {
    return res.status(400).json({ error: "invalid_signature_format" });
  }
  if (Math.abs(Date.now() / 1e3 - Number(timestamp)) > 300) {
    return res.status(400).json({ error: "stale_event" });
  }
  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expected = createHmac2("sha256", secret).update(signedPayload).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(v1, "hex");
  if (expectedBuf.length !== receivedBuf.length || !timingSafeEqual2(expectedBuf, receivedBuf)) {
    logger.warn({ sig }, "stripe webhook signature mismatch");
    return res.status(400).json({ error: "invalid_signature" });
  }
  const event = req.body;
  logger.info({ type: event?.type }, "stripe webhook received");
  if (event?.type === "checkout.session.completed") {
    const session = event.data?.object;
    const societyId = session?.metadata?.societyId;
    const piano = session?.metadata?.piano;
    const customerId = session?.customer;
    const subId = session?.subscription;
    if (societyId && customerId) {
      try {
        await pool20.execute(
          `UPDATE societies
           SET subscription_status    = 'active',
               piano                  = COALESCE(?, piano),
               stripe_customer_id     = ?,
               stripe_subscription_id = ?
           WHERE id = ?`,
          [piano ?? null, customerId, subId ?? null, Number(societyId)]
        );
        logger.info({ societyId, customerId, piano }, "stripe: society activated");
      } catch (e) {
        logger.error({ err: e }, "stripe: DB update failed on checkout.session.completed");
      }
    }
  }
  if (event?.type === "customer.subscription.updated") {
    const sub = event.data?.object;
    const subId = sub?.id;
    const priceId = sub?.items?.data?.[0]?.price?.id;
    const piano = priceId ? priceIdToPiano(priceId) : null;
    const status = sub?.status;
    if (subId) {
      try {
        const dbStatus = status === "active" ? "active" : status === "past_due" ? "past_due" : "canceled";
        await pool20.execute(
          `UPDATE societies
           SET subscription_status = ?,
               piano               = COALESCE(?, piano)
           WHERE stripe_subscription_id = ?`,
          [dbStatus, piano ?? null, subId]
        );
        logger.info({ subId, piano, status }, "stripe: subscription updated");
      } catch (e) {
        logger.error({ err: e }, "stripe: DB update failed on subscription.updated");
      }
    }
  }
  if (event?.type === "customer.subscription.deleted") {
    const sub = event.data?.object;
    const subId = sub?.id;
    if (subId) {
      try {
        await pool20.execute(
          `UPDATE societies
           SET subscription_status = 'canceled'
           WHERE stripe_subscription_id = ?`,
          [subId]
        );
        logger.info({ subId }, "stripe: subscription canceled");
      } catch (e) {
        logger.error({ err: e }, "stripe: DB update failed on subscription.deleted");
      }
    }
  }
  return res.sendStatus(200);
});
router21.get("/stripe/subscription", async (req, res) => {
  const societyId = req.query.societyId;
  if (!societyId) return res.status(400).json({ error: "missing_societyId" });
  try {
    const [rows] = await pool20.execute(
      `SELECT subscription_status, piano, stripe_subscription_id, stripe_customer_id, demo_scadenza
       FROM societies WHERE id = ?`,
      [Number(societyId)]
    );
    if (!rows.length) return res.status(404).json({ error: "society_not_found" });
    const soc = rows[0];
    let currentPeriodEnd = null;
    let cancelAtPeriodEnd = null;
    let intervallo = null;
    let paymentMethod = null;
    if (soc.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const sub = await stripeGet(
          `/subscriptions/${soc.stripe_subscription_id}?expand[]=default_payment_method`
        );
        currentPeriodEnd = sub.current_period_end ?? null;
        cancelAtPeriodEnd = sub.cancel_at_period_end ?? null;
        const priceId = sub.items?.data?.[0]?.price?.id;
        if (priceId) {
          for (const [, intervals] of Object.entries(PRICE_ENV)) {
            if (process.env[intervals.mensile] === priceId) {
              intervallo = "mensile";
              break;
            }
            if (process.env[intervals.annuale] === priceId) {
              intervallo = "annuale";
              break;
            }
          }
        }
        const pm = sub.default_payment_method;
        if (pm?.card) paymentMethod = { brand: pm.card.brand, last4: pm.card.last4 };
      } catch {
      }
    }
    return res.json({
      status: soc.subscription_status,
      piano: soc.piano,
      demoScadenza: soc.demo_scadenza,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      intervallo,
      paymentMethod
    });
  } catch (e) {
    logger.error({ err: e }, "stripe: subscription fetch error");
    return res.status(500).json({ error: "server_error" });
  }
});
router21.post("/stripe/customer-portal", async (req, res) => {
  const { societyId } = req.body;
  if (!societyId) return res.status(400).json({ error: "missing_societyId" });
  try {
    const [rows] = await pool20.execute(
      `SELECT stripe_customer_id FROM societies WHERE id = ?`,
      [Number(societyId)]
    );
    const customerId = rows[0]?.stripe_customer_id;
    if (!customerId) return res.status(400).json({ error: "no_stripe_customer" });
    const appUrl = process.env.APP_URL ?? "https://workspacefieldos-production.up.railway.app";
    const session = await stripePost("/billing_portal/sessions", {
      customer: customerId,
      return_url: `${appUrl}/account`
    });
    logger.info({ societyId }, "stripe: customer portal session created");
    return res.json({ url: session.url });
  } catch (e) {
    logger.error({ err: e }, "stripe: customer-portal error");
    return res.status(500).json({ error: "stripe_error", detail: e?.message });
  }
});
router21.post("/stripe/cancel", async (req, res) => {
  const { societyId, motivo, dettaglio } = req.body;
  if (!societyId) return res.status(400).json({ error: "missing_societyId" });
  try {
    const [rows] = await pool20.execute(
      `SELECT stripe_subscription_id FROM societies WHERE id = ?`,
      [Number(societyId)]
    );
    const subId = rows[0]?.stripe_subscription_id;
    if (!subId) return res.status(400).json({ error: "no_subscription" });
    await stripePost(`/subscriptions/${subId}`, { cancel_at_period_end: "true" });
    if (motivo) {
      await pool20.execute(
        `INSERT INTO churn_feedback (society_id, motivo, dettaglio) VALUES (?, ?, ?)`,
        [Number(societyId), motivo, dettaglio || null]
      ).catch((e) => logger.warn({ err: e }, "churn_feedback insert failed"));
    }
    logger.info({ societyId, subId, motivo }, "stripe: subscription cancel_at_period_end set");
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "stripe: cancel error");
    return res.status(500).json({ error: "stripe_error", detail: e?.message });
  }
});
router21.get("/stripe/invoices", async (req, res) => {
  const societyId = req.query.societyId;
  if (!societyId) return res.status(400).json({ error: "missing_societyId" });
  try {
    const [rows] = await pool20.execute(
      `SELECT stripe_customer_id FROM societies WHERE id = ?`,
      [Number(societyId)]
    );
    const customerId = rows[0]?.stripe_customer_id;
    if (!customerId || !process.env.STRIPE_SECRET_KEY) return res.json({ invoices: [] });
    const data = await stripeGet(`/invoices?customer=${customerId}&limit=24`);
    const invoices = (data.data || []).map((inv) => ({
      id: inv.id,
      number: inv.number,
      amount: inv.amount_paid / 100,
      currency: inv.currency?.toUpperCase() ?? "EUR",
      status: inv.status,
      date: inv.created,
      pdfUrl: inv.invoice_pdf ?? null,
      hostedUrl: inv.hosted_invoice_url ?? null
    }));
    return res.json({ invoices });
  } catch (e) {
    logger.error({ err: e }, "stripe: invoices fetch error");
    return res.status(500).json({ error: "server_error" });
  }
});
var stripe_default = router21;

// src/routes/v2/index.ts
var router22 = Router22();
var _schemaReady = false;
async function ensureSchema() {
  if (_schemaReady) return;
  const statements = SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean);
  for (const sql of statements) {
    await pool21.execute(sql);
  }
  const migrations = MIGRATIONS_SQL.split(";").map((s) => s.trim()).filter(Boolean);
  for (const sql of migrations) {
    await pool21.execute(sql).catch((e) => {
      if (e?.errno !== 1060) logger.warn({ errno: e?.errno, msg: e?.message?.slice(0, 80) }, "migration warning");
    });
  }
  const [rows] = await pool21.execute("SELECT COUNT(*) AS n FROM societies");
  if (rows[0].n === 0) {
    const seeds = SEED_SQL.split(";").map((s) => s.trim()).filter(Boolean);
    for (const sql of seeds) {
      await pool21.execute(sql);
    }
    logger.info("v2: seed data inserted");
  }
  _schemaReady = true;
  logger.info("v2: schema ready");
}
router22.use(async (_req, _res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (e) {
    logger.error({ err: e }, "v2: schema init failed");
    next();
  }
});
router22.use(auth_default2);
router22.use(self_register_default);
router22.use(society_default);
router22.use(leve_default);
router22.use(players_default);
router22.use(users_default);
router22.use(events_default);
router22.use(presenze_default);
router22.use(comunicazioni_default);
router22.use(chat_default);
router22.use(quote_default);
router22.use(migrate_default);
router22.use(stripe_default);
var v2_default = router22;

// src/routes/index.ts
var router23 = Router23();
router23.use(health_default);
router23.use(login_default);
router23.use(auth_default);
router23.use(state_default);
router23.use(assist_default);
router23.use(push_default);
router23.use(upload_default);
router23.use(public_default);
router23.use("/v2", v2_default);
var routes_default = router23;

// src/app.ts
var app = express();
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0]
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode
        };
      }
    }
  })
);
app.use(cors());
app.use(express.json({
  limit: "10mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes_default);
var staticDir = path.join(process.cwd(), "artifacts", "fieldos", "dist", "public");
if (existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get("*path", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}
var app_default = app;

// src/index.ts
import { pool as pool22 } from "@workspace/db";
var rawPort = process.env["PORT"];
if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided."
  );
}
var port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}
function startListening() {
  app_default.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}
async function ensureSchema2() {
  await pool22.query(`
    CREATE TABLE IF NOT EXISTS \`society_state\` (
      \`key\`      VARCHAR(255) PRIMARY KEY,
      state_json  LONGTEXT NOT NULL,
      is_demo     TINYINT(1) NOT NULL DEFAULT 0,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  try {
    await pool22.query(
      "ALTER TABLE `society_state` ADD COLUMN `is_demo` TINYINT(1) NOT NULL DEFAULT 0"
    );
    logger.info("DB: added is_demo column");
  } catch (e) {
    if (e?.errno !== 1060) logger.warn({ errno: e?.errno }, "DB: is_demo migration skipped");
  }
  logger.info("DB schema ready");
}
startListening();
if (process.env.DATABASE_URL) {
  ensureSchema2().catch((err) => {
    logger.error(
      { code: err?.code, sqlMessage: err?.sqlMessage, message: err?.message },
      "DB schema init failed"
    );
  });
} else {
  logger.warn(
    "DATABASE_URL not set \u2014 cross-device sync disabled"
  );
}
