import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`      VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    is_demo     TINYINT(1) NOT NULL DEFAULT 0,
    version     BIGINT UNSIGNED NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

// Migrazione idempotente per tabelle society_state già esistenti in prod (pre-version column).
// Approccio combinato (a)+(b): prima check via INFORMATION_SCHEMA, poi ALTER in try/catch
// ignorando 1060 (ER_DUP_FIELDNAME) per gestire race condition tra worker concorrenti.
// MySQL 8 NON supporta "ADD COLUMN IF NOT EXISTS", quindi si usa questa via.
let _versionColumnReady = false;
async function ensureVersionColumn(): Promise<void> {
  if (_versionColumnReady) return;
  try {
    const [rows] = (await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'society_state' AND COLUMN_NAME = 'version'`
    )) as [any[], any];
    if (!rows.length) {
      try {
        await pool.execute(
          "ALTER TABLE `society_state` ADD COLUMN `version` BIGINT UNSIGNED NOT NULL DEFAULT 0"
        );
        logger.info({}, "society_state.version column added");
      } catch (e: any) {
        if (e?.errno !== 1060 && e?.code !== "ER_DUP_FIELDNAME") throw e;
      }
    }
    _versionColumnReady = true;
  } catch (e: any) {
    logger.warn({ err: e }, "ensureVersionColumn failed (non-blocking, will retry next request)");
  }
}

const MIN_STATE_BYTES = 200;

// Returns true if the new state would remove real data present in the existing state.
function wouldDowngrade(newJson: string, existingJson: string): boolean {
  try {
    const n = JSON.parse(newJson);
    const e = JSON.parse(existingJson);
    const existingPlayers = Array.isArray(e.players) ? e.players.length : 0;
    const newPlayers      = Array.isArray(n.players) ? n.players.length : 0;
    const existingUsers   = Array.isArray(e.USERS_DB) ? e.USERS_DB.length : 0;
    const newUsers        = Array.isArray(n.USERS_DB) ? n.USERS_DB.length : 0;

    // Caso 1: nuovo stato completamente vuoto (originale)
    const existingHasRealData =
      existingPlayers > 0 ||
      existingUsers > 6 ||
      (typeof e.nextUserId === "number" && e.nextUserId > 7);
    const newIsEmpty =
      newPlayers === 0 &&
      newUsers <= 6 &&
      (typeof n.nextUserId !== "number" || n.nextUserId <= 7);
    if (existingHasRealData && newIsEmpty) return true;

    // Caso 2: downgrade PARZIALE players (device con stato vecchio sovrascrive rosa cresciuta)
    const PLAYER_LOSS_THRESHOLD = 3;
    if (existingPlayers >= 5 && newPlayers < existingPlayers - PLAYER_LOSS_THRESHOLD) {
      console.warn(`[state] downgrade parziale players: existing=${existingPlayers} new=${newPlayers}`);
      return true;
    }

    // Caso 3: downgrade PARZIALE utenti
    if (existingUsers > 6 && newUsers < existingUsers - 2) {
      console.warn(`[state] downgrade parziale users: existing=${existingUsers} new=${newUsers}`);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// GET /state/:key
router.get("/state/:key", async (req, res) => {
  try {
    await pool.execute(CREATE_TABLE_SQL);
    await ensureVersionColumn();
    const [rows] = (await pool.execute(
      "SELECT state_json, is_demo, version FROM `society_state` WHERE `key` = ?",
      [req.params.key]
    )) as [any[], any];
    if (!rows.length) return res.status(404).json({ error: "not found" });
    return res.json({
      key: req.params.key,
      stateJson: rows[0].state_json,
      isDemo: rows[0].is_demo === 1,
      version: Number(rows[0].version)
    });
  } catch (e: any) {
    logger.error({ err: e }, "state GET failed");
    return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
  }
});

// PUT /state/:key — upsert state blob
router.put("/state/:key", async (req, res) => {
  const { stateJson, isDemo, baseVersion } = req.body as { stateJson?: unknown; isDemo?: unknown; baseVersion?: unknown };
  if (typeof stateJson !== "string") {
    return res.status(400).json({ error: "stateJson must be a string" });
  }
  const isDemoWrite = isDemo === true;
  const isDemoVal = isDemoWrite ? 1 : 0;

  try {
    await pool.execute(CREATE_TABLE_SQL);
    await ensureVersionColumn();

    // Single read for all protection checks
    const [existing] = (await pool.execute(
      "SELECT state_json, LENGTH(state_json) as sz, is_demo, version FROM `society_state` WHERE `key` = ?",
      [req.params.key]
    )) as [any[], any];

    if (existing.length) {
      const existingSz = Number(existing[0].sz);
      const existingIsReal = existing[0].is_demo === 0;
      const serverVersion = Number(existing[0].version);

      // Optimistic concurrency: se il client invia baseVersion, deve combaciare con la versione corrente.
      // 412 (NON 409: il 409 è già usato dai guard esistenti e il client lo tratta come success).
      // Se baseVersion è undefined/assente → vecchio FE, retrocompat: skip check, upsert come prima.
      if (typeof baseVersion === "number" && baseVersion !== serverVersion) {
        logger.warn({ key: req.params.key, baseVersion, serverVersion }, "PUT rejected: stale base version");
        return res.status(412).json({
          error: "stale_base_version",
          detail: "Il client si basa su una versione vecchia. Pull e ri-applica.",
          server_version: serverVersion
        });
      }

      // Protezione: stato quasi-vuoto non sovrascrive dati reali
      if (stateJson.length < MIN_STATE_BYTES && existingSz >= MIN_STATE_BYTES) {
        logger.warn({ key: req.params.key, newSize: stateJson.length, existingSize: existingSz },
          "PUT rejected: near-empty would overwrite real data");
        return res.status(409).json({
          error: "would_overwrite_real_data",
          detail: "Il nuovo stato è troppo piccolo per sovrascrivere dati esistenti."
        });
      }

      // Protezione: scrittura demo non sovrascrive dati reali
      if (isDemoWrite && existingIsReal) {
        logger.warn({ key: req.params.key }, "PUT rejected: demo write on real-data row");
        return res.status(409).json({
          error: "demo_cannot_overwrite_real",
          detail: "Dati demo non possono sovrascrivere dati reali."
        });
      }

      // Protezione: downgrade (perde giocatori/utenti)
      if (!isDemoWrite && existingIsReal && wouldDowngrade(stateJson, existing[0].state_json)) {
        logger.warn({ key: req.params.key }, "PUT rejected: would downgrade data");
        return res.status(409).json({
          error: "would_downgrade_data",
          detail: "Il nuovo stato ha meno dati di quelli esistenti. Operazione annullata."
        });
      }
    }

    // Upsert con versionamento. INSERT: version=1. UPDATE: version = version + 1.
    // is_demo stays 0 forever once marked as real data.
    await pool.execute(
      `INSERT INTO \`society_state\` (\`key\`, \`state_json\`, \`is_demo\`, \`version\`) VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         \`state_json\` = ?,
         \`is_demo\`    = IF(\`is_demo\` = 0, 0, ?),
         \`version\`    = \`version\` + 1`,
      [req.params.key, stateJson, isDemoVal, stateJson, isDemoVal]
    );
    // Rileggi la version corrente per ritornarla al client (così aggiorna il suo baseVersion).
    const [after] = (await pool.execute(
      "SELECT version FROM `society_state` WHERE `key` = ? LIMIT 1",
      [req.params.key]
    )) as [any[], any];
    const newVersion = after.length ? Number(after[0].version) : undefined;
    return res.json({ key: req.params.key, updatedAt: new Date().toISOString(), version: newVersion });
  } catch (e: any) {
    logger.error({ err: e }, "state PUT failed");
    return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
  }
});

export default router;
