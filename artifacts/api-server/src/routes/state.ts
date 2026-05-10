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
  try {
    // Crea la tabella se non esiste (idempotente — sicuro da chiamare ad ogni request)
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
