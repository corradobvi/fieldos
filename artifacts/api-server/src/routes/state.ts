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
    const [rows] = (await pool.execute(
      "SELECT state_json, is_demo FROM `society_state` WHERE `key` = ?",
      [req.params.key]
    )) as [any[], any];
    if (!rows.length) return res.status(404).json({ error: "not found" });
    return res.json({
      key: req.params.key,
      stateJson: rows[0].state_json,
      isDemo: rows[0].is_demo === 1
    });
  } catch (e: any) {
    logger.error({ err: e }, "state GET failed");
    return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
  }
});

// PUT /state/:key — upsert state blob
router.put("/state/:key", async (req, res) => {
  const { stateJson, isDemo } = req.body as { stateJson?: unknown; isDemo?: unknown };
  if (typeof stateJson !== "string") {
    return res.status(400).json({ error: "stateJson must be a string" });
  }
  const isDemoWrite = isDemo === true;
  const isDemoVal = isDemoWrite ? 1 : 0;

  try {
    await pool.execute(CREATE_TABLE_SQL);

    // Single read for all protection checks
    const [existing] = (await pool.execute(
      "SELECT state_json, LENGTH(state_json) as sz, is_demo FROM `society_state` WHERE `key` = ?",
      [req.params.key]
    )) as [any[], any];

    if (existing.length) {
      const existingSz = Number(existing[0].sz);
      const existingIsReal = existing[0].is_demo === 0;

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

    // Upsert. is_demo stays 0 forever once marked as real data.
    await pool.execute(
      `INSERT INTO \`society_state\` (\`key\`, \`state_json\`, \`is_demo\`) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         \`state_json\` = ?,
         \`is_demo\`    = IF(\`is_demo\` = 0, 0, ?)`,
      [req.params.key, stateJson, isDemoVal, stateJson, isDemoVal]
    );
    return res.json({ key: req.params.key, updatedAt: new Date().toISOString() });
  } catch (e: any) {
    logger.error({ err: e }, "state PUT failed");
    return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
  }
});

export default router;
