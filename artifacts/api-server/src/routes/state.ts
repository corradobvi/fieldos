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

// Dimensione minima in bytes per considerare uno stato "non vuoto".
const MIN_STATE_BYTES = 200;

// GET /state/:key — retrieve state blob
router.get("/state/:key", async (req, res) => {
  try {
    const result = await pool.execute(
      "SELECT state_json, is_demo FROM `society_state` WHERE `key` = ?",
      [req.params.key]
    ) as any[];
    const rows = result[0] as any[];
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

  // ── Protezione 1: rifiuta stati quasi-vuoti che sovrascriverebbero dati reali ──
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
      logger.error({ err: e }, "state PUT safety-check failed");
      return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
    }
  }

  // ── Protezione 2: dati demo non possono sovrascrivere dati reali ──
  if (isDemoWrite) {
    try {
      await pool.execute(CREATE_TABLE_SQL);
      const [existing] = (await pool.execute(
        "SELECT is_demo FROM `society_state` WHERE `key` = ?",
        [req.params.key]
      )) as [any[], any];
      if (existing.length && existing[0].is_demo === 0) {
        logger.warn(
          { key: req.params.key },
          "state PUT rejected: demo write attempted on real-data row"
        );
        return res.status(409).json({
          error: "demo_cannot_overwrite_real",
          detail: "Dati demo non possono sovrascrivere dati reali. Operazione annullata a protezione dei dati."
        });
      }
    } catch (e: any) {
      logger.error({ err: e }, "state PUT demo-check failed");
      return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
    }
  }

  try {
    await pool.execute(CREATE_TABLE_SQL);
    // is_demo: once a row is marked real (0), it stays real even if a demo write sneaks through.
    // Formula: IF(existing is_demo = 0, keep 0, use new value)
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
