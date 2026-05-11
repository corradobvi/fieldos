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

// POST /api/auth/verify-code
// Body: { code: string }
// Response: { valid: true, societyId: number, stateKey: string, societyName: string }
//         | { valid: false }
router.post("/auth/verify-code", async (req, res) => {
  const { code } = req.body as { code?: unknown };
  if (typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ valid: false, error: "missing_code" });
  }
  const upperCode = code.trim().toUpperCase();

  try {
    await pool.execute(CREATE_TABLE_SQL);

    // Legge tutte le righe delle società (esclude demo e SA state)
    const [rows] = (await pool.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    )) as [any[], any];

    for (const row of rows) {
      let state: any;
      try { state = JSON.parse(row.state_json as string); } catch { continue; }

      const rowCode = (state.codiceSocieta ?? "").trim().toUpperCase();
      if (!rowCode || rowCode !== upperCode) continue;

      const stateKey: string = row.key;
      let societyId = 0;
      const match = stateKey.match(/fieldos_state_soc_(\d+)$/);
      if (match) societyId = parseInt(match[1], 10);

      const societyName: string = state.nomeSocieta || "MyVivaio";

      logger.info({ code: upperCode, societyId, stateKey }, "verify-code: found");
      return res.json({ valid: true, societyId, stateKey, societyName });
    }

    logger.info({ code: upperCode }, "verify-code: not found");
    return res.json({ valid: false });
  } catch (e: any) {
    logger.error({ err: e }, "verify-code error");
    return res.status(500).json({ valid: false, error: "server_error" });
  }
});

export default router;
