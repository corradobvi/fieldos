import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`     VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

// Dimensione minima in bytes per considerare uno stato "non vuoto".
// Uno stato con anche solo un utente reale e zero giocatori pesa ~500 bytes.
// Uno stato completamente vuoto ({}) pesa 2 bytes.
// 200 bytes come soglia conservativa esclude "{}" e "{USERS_DB:[]}" ma niente di reale.
const MIN_STATE_BYTES = 200;

// GET /state/:key — retrieve state blob
router.get("/state/:key", async (req, res) => {
  try {
    const result = await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ?",
      [req.params.key]
    ) as any[];
    const rows = result[0] as any[];
    if (!rows.length) return res.status(404).json({ error: "not found" });
    return res.json({ key: req.params.key, stateJson: rows[0].state_json });
  } catch (e: any) {
    logger.error({ err: e }, "state GET failed");
    return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
  }
});

// PUT /state/:key — upsert state blob
router.put("/state/:key", async (req, res) => {
  const { stateJson } = req.body as { stateJson?: unknown };
  if (typeof stateJson !== "string") {
    return res.status(400).json({ error: "stateJson must be a string" });
  }

  // ── Protezione dati: rifiuta scritture che sovrascriverebbero dati reali con stato vuoto ──
  // Se il nuovo stato è troppo piccolo, controlla se il DB ha già dati.
  // In caso affermativo, rifiuta la scrittura per proteggere i dati esistenti.
  if (stateJson.length < MIN_STATE_BYTES) {
    try {
      await pool.execute(CREATE_TABLE_SQL);
      const [existing] = (await pool.execute(
        "SELECT LENGTH(state_json) as sz FROM `society_state` WHERE `key` = ?",
        [req.params.key]
      )) as [any[], any];
      if (existing.length && Number(existing[0].sz) >= MIN_STATE_BYTES) {
        logger.warn(
          { key: req.params.key, newSize: stateJson.length, existingSize: existing[0].sz },
          "state PUT rejected: would overwrite real data with near-empty state"
        );
        return res.status(409).json({
          error: "would_overwrite_real_data",
          detail: "Il nuovo stato è troppo piccolo per sovrascrivere dati esistenti. Operazione annullata a protezione dei dati."
        });
      }
    } catch (e: any) {
      // Se il check fallisce, blocca comunque la scrittura di stati vuoti
      logger.error({ err: e }, "state PUT safety-check failed");
      return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
    }
  }

  try {
    await pool.execute(CREATE_TABLE_SQL);
    await pool.execute(
      "INSERT INTO `society_state` (`key`, `state_json`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `state_json` = ?",
      [req.params.key, stateJson, stateJson]
    );
    return res.json({ key: req.params.key, updatedAt: new Date().toISOString() });
  } catch (e: any) {
    logger.error({ err: e }, "state PUT failed");
    return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
  }
});

export default router;
