import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { buildStellaDemoState } from "../../lib/stella-demo-seed";

const router = Router();
const DEMO_KEY = "fieldos_demo_stella_v1";

// POST /api/v2/admin/reset-stella-demo
// Scrive il dataset demo Stella Azzurra nel DB (bypassa le protezioni di state.ts).
// Autenticato via header X-Admin-Secret (variabile env ADMIN_RESET_SECRET).
router.post("/admin/reset-stella-demo", async (req, res) => {
  const secret      = req.headers["x-admin-secret"];
  const adminSecret = process.env.ADMIN_RESET_SECRET;

  if (!adminSecret || secret !== adminSecret) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const state     = buildStellaDemoState();
    const stateJson = JSON.stringify(state);

    await pool.execute(
      `INSERT INTO \`society_state\` (\`key\`, \`state_json\`, \`is_demo\`)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE \`state_json\` = ?, \`is_demo\` = 1`,
      [DEMO_KEY, stateJson, stateJson]
    );

    const s = state as Record<string, any>;
    logger.info(
      { key: DEMO_KEY, players: s.players?.length, users: s.USERS_DB?.length },
      "stella demo reset"
    );

    return res.json({
      ok: true,
      populatedAt:  new Date().toISOString(),
      key:          DEMO_KEY,
      leve:         (s.leve ?? []).length,
      giocatori:    (s.players ?? []).length,
      utenti:       (s.USERS_DB ?? []).length,
      quote:        (s.quotes ?? []).length,
      documenti:    (s.documenti ?? []).length,
      tornei:       (s.tornei ?? []).length,
      comunicazioni:(s.comunicazioni ?? []).length,
    });
  } catch (e: any) {
    logger.error({ err: e }, "stella demo reset failed");
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

export default router;
