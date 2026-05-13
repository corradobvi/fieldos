// 2026-05-13 — force redeploy: self-register endpoint + phone column migration
import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

function startListening() {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

// Ensure the society_state table exists (idempotent — safe to run on every start).
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`society_state\` (
      \`key\`      VARCHAR(255) PRIMARY KEY,
      state_json  LONGTEXT NOT NULL,
      is_demo     TINYINT(1) NOT NULL DEFAULT 0,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  // Migrate existing tables that don't have is_demo yet
  try {
    await pool.query(
      "ALTER TABLE `society_state` ADD COLUMN `is_demo` TINYINT(1) NOT NULL DEFAULT 0"
    );
    logger.info("DB: added is_demo column");
  } catch (e: any) {
    if (e?.errno !== 1060) logger.warn({ errno: e?.errno }, "DB: is_demo migration skipped");
    // errno 1060 = Duplicate column name — column already exists, ignore
  }
  logger.info("DB schema ready");
}

// Start immediately so Railway healthcheck passes
startListening();

if (process.env.DATABASE_URL) {
  ensureSchema().catch((err: any) => {
    logger.error(
      { code: err?.code, sqlMessage: err?.sqlMessage, message: err?.message },
      "DB schema init failed"
    );
  });
} else {
  logger.warn(
    "DATABASE_URL not set — cross-device sync disabled",
  );
}
