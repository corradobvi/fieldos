import { Router } from "express";
import webpush from "web-push";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

// VAPID keys — env vars override fallback defaults
const VAPID_PUBLIC  = process.env["VAPID_PUBLIC_KEY"]  ?? "BE7dMl0ASZvW5M7Ltc7pRRuq5ecjmEYgbj5pjkj5uS9swNhPzzmQ2BW-NWAf8xKX13MMDMhbZRWkh1ykkYv5fOs";
const VAPID_PRIVATE = process.env["VAPID_PRIVATE_KEY"] ?? "vhS1XTtxj18YcKoB7yk4O_jGRlkMjpvrS-lF0wK2J7A";
const VAPID_SUBJECT = process.env["VAPID_SUBJECT"]     ?? "mailto:admin@myvivaio.app";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

const CREATE_SUBS_TABLE = `
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
  await pool.execute(CREATE_SUBS_TABLE);
  // Idempotent migrations — IF NOT EXISTS avoids error on already-present columns
  const alters = [
    "ALTER TABLE `push_subscriptions` ADD COLUMN IF NOT EXISTS `subscription_json` TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE `push_subscriptions` ADD COLUMN IF NOT EXISTS `society_key` VARCHAR(255) NOT NULL DEFAULT ''",
    "ALTER TABLE `push_subscriptions` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  ];
  for (const sql of alters) {
    await pool.execute(sql).catch((e: any) => logger.warn({ err: e?.message }, "push ensureTable ALTER failed"));
  }
}

// GET /api/push/vapid-public — expose the public key to the frontend
router.get("/push/vapid-public", (_req, res) => {
  if (!VAPID_PUBLIC) return res.status(503).json({ error: "push_not_configured" });
  return res.json({ publicKey: VAPID_PUBLIC });
});

// POST /api/push/subscribe — save/update a push subscription
router.post("/push/subscribe", async (req, res) => {
  const { userId: rawUserId, societyKey, subscription } = req.body as {
    userId?: unknown;
    societyKey?: unknown;
    subscription?: unknown;
  };

  const userId = typeof rawUserId === "number" ? rawUserId
    : typeof rawUserId === "string" ? parseInt(rawUserId, 10)
    : NaN;

  if (!Number.isFinite(userId) || typeof societyKey !== "string" || !societyKey || !subscription) {
    logger.warn({ rawUserId, societyKey: typeof societyKey, hasSubscription: !!subscription }, "push subscribe: missing_fields");
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    await ensureTable();
    const subJson = JSON.stringify(subscription);
    await pool.execute(
      `INSERT INTO \`push_subscriptions\` (\`user_id\`, \`society_key\`, \`subscription_json\`)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE \`subscription_json\` = ?`,
      [userId, societyKey, subJson, subJson]
    );
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "push subscribe error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

// POST /api/push/send — send a push notification to a user
router.post("/push/send", async (req, res) => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(503).json({ error: "push_not_configured" });
  }

  const { userId, societyKey, notification } = req.body as {
    userId?: unknown;
    societyKey?: unknown;
    notification?: unknown;
  };

  if (typeof userId !== "number" || typeof societyKey !== "string" || !societyKey || !notification) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    await ensureTable();
    const [rows] = (await pool.execute(
      "SELECT subscription_json FROM `push_subscriptions` WHERE `user_id` = ? AND `society_key` = ?",
      [userId, societyKey]
    )) as [any[], any];

    if (!rows.length) return res.json({ ok: true, sent: 0 });

    const payload = JSON.stringify(notification);
    let sent = 0;
    let expired = false;

    for (const row of rows) {
      let sub: any;
      try { sub = JSON.parse(row.subscription_json); } catch { continue; }
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (e: any) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          expired = true;
          await pool.execute(
            "DELETE FROM `push_subscriptions` WHERE `user_id` = ? AND `society_key` = ?",
            [userId, societyKey]
          ).catch(() => {});
        } else {
          logger.warn({ err: e, userId }, "push send warning");
        }
      }
    }

    return res.json({ ok: true, sent, expired });
  } catch (e: any) {
    logger.error({ err: e }, "push send error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

// GET /api/push/debug — diagnostica senza auth
router.get("/push/debug", async (_req, res) => {
  const allEnvKeys = Object.keys(process.env).sort();
  const vapidEnvKeys = allEnvKeys.filter(k => k.toUpperCase().includes("VAPID"));
  const railwayKeys  = allEnvKeys.filter(k => k.startsWith("RAILWAY_"));

  const info: Record<string, unknown> = {
    bundle_marker:          "2026-05-18-v22-vapid-fallback",
    // Module-level constants (read at process startup — cached)
    vapid_public_set:       !!VAPID_PUBLIC,
    vapid_private_set:      !!VAPID_PRIVATE,
    vapid_subject_value:    VAPID_SUBJECT,  // has hardcoded default — may not be from env
    vapid_public_prefix:    VAPID_PUBLIC ? VAPID_PUBLIC.slice(0, 8) + "…" : null,
    // Re-read at request time (bypasses module-level cache)
    vapid_public_runtime:   !!(process.env["VAPID_PUBLIC_KEY"]  ?? ""),
    vapid_private_runtime:  !!(process.env["VAPID_PRIVATE_KEY"] ?? ""),
    vapid_subject_runtime:  process.env["VAPID_SUBJECT"] ?? null,
    // Env var names containing "VAPID" visible to process.env right now
    vapid_env_keys_found:   vapidEnvKeys,
    // Railway-injected keys (proves env vars reach the container at all)
    railway_env_keys:       railwayKeys,
    railway_environment:    process.env["RAILWAY_ENVIRONMENT_NAME"] ?? null,
    railway_service:        process.env["RAILWAY_SERVICE_NAME"] ?? null,
    // General runtime info
    node_version:           process.versions.node,
    node_env:               process.env["NODE_ENV"] ?? null,
    total_env_keys:         allEnvKeys.length,
    railway_public_domain:  process.env["RAILWAY_PUBLIC_DOMAIN"] ?? null,
    // ALL env key names alphabetically (no values — safe, ~40 keys max on Railway)
    all_env_keys:           allEnvKeys,
  };

  try {
    await ensureTable();
    const [colRows] = (await pool.execute(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'push_subscriptions' ORDER BY ORDINAL_POSITION"
    )) as [any[], any];
    info.table_columns = colRows.map((r: any) => r.COLUMN_NAME);

    const [countRows] = (await pool.execute(
      "SELECT COUNT(*) AS total FROM `push_subscriptions`"
    )) as [any[], any];
    info.total_subscriptions = countRows[0]?.total ?? 0;

    const [sampleRows] = (await pool.execute(
      "SELECT user_id, society_key FROM `push_subscriptions` ORDER BY id DESC LIMIT 3"
    )) as [any[], any];
    info.recent_subscriptions = sampleRows;
  } catch (e: any) {
    info.db_error = e?.message?.slice(0, 120);
  }
  return res.json(info);
});

export default router;
