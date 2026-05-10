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
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  logger.info("DB schema ready");
}

if (process.env.DATABASE_URL) {
  // DB available — run schema migration then start
  ensureSchema()
    .then(startListening)
    .catch((err: any) => {
      logger.error(
        { code: err?.code, sqlMessage: err?.sqlMessage, message: err?.message },
        "DB schema init failed — starting without DB"
      );
      startListening();
    });
} else {
  // No DATABASE_URL — start immediately; API state endpoints will return 500
  logger.warn(
    "DATABASE_URL not set — cross-device sync disabled, set the MySQL URL in environment variables",
  );
  startListening();
}
