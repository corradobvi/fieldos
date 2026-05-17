import { Router } from "express";
import webpush from "web-push";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

// VAPID keys — set via environment variables on Railway
const VAPID_PUBLIC  = process.env["VAPID_PUBLIC_KEY"]  ?? "";
const VAPID_PRIVATE = process.env["VAPID_PRIVATE_KEY"] ?? "";
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
}

// GET /api/push/vapid-public — expose the public key to the frontend
router.get("/push/vapid-public", (_req, res) => {
  if (!VAPID_PUBLIC) return res.status(503).json({ error: "push_not_configured" });
  return res.json({ publicKey: VAPID_PUBLIC });
});

// POST /api/push/subscribe — save/update a push subscription
router.post("/push/subscribe", async (req, res) => {
  const { userId, societyKey, subscription } = req.body as {
    userId?: unknown;
    societyKey?: unknown;
    subscription?: unknown;
  };

  if (typeof userId !== "number" || typeof societyKey !== "string" || !societyKey || !subscription) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    await ensureTable();
    const subJson = JSON.stringify(subscription);
    await pool.execute(
      `INSERT INTO \`push_subscriptions\` (\`user_id\`, \`society_key\`, \`subscription_json\`)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE \`subscription_json\` = ?, \`updated_at\` = NOW()`,
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
          // Subscription expired — clean it up
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

// POST /api/push/test-by-email — TEMPORANEO: debug push notifications by email
// Nessun auth middleware intenzionalmente — da rimuovere dopo il test
router.post("/push/test-by-email", async (req, res) => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(503).json({ error: "push_not_configured" });
  }

  const { email, societyKey } = req.body as { email?: unknown; societyKey?: unknown };
  if (typeof email !== "string" || !email || typeof societyKey !== "string" || !societyKey) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    await ensureTable();

    // 1. Cerca utente per email nella tabella users
    const [userRows] = (await pool.execute(
      "SELECT id FROM `users` WHERE LOWER(email) = ? LIMIT 1",
      [email.trim().toLowerCase()]
    )) as [any[], any];

    if (!userRows.length) {
      return res.status(404).json({ error: "user_not_found", email });
    }

    const userId: number = userRows[0].id;

    // 2. Cerca le subscription per userId + societyKey
    const [subRows] = (await pool.execute(
      "SELECT subscription_json FROM `push_subscriptions` WHERE `user_id` = ? AND `society_key` = ?",
      [userId, societyKey]
    )) as [any[], any];

    console.log(`[test-push] User ${email} -> userId ${userId}, subs ${subRows.length}`);

    if (!subRows.length) {
      return res.json({ ok: true, found_user: true, user_id: userId, subscriptions: 0, sent: 0 });
    }

    // 3. Manda push di test a tutte le subscription trovate
    const payload = JSON.stringify({
      title: "🧪 Test Push MyVivaio",
      body: "Se vedi questa notifica, le push funzionano!",
      url: "/",
      tag: "test-push",
    });

    let sent = 0;
    const errors: string[] = [];

    for (const row of subRows) {
      let sub: any;
      try { sub = JSON.parse(row.subscription_json); } catch { errors.push("invalid_json"); continue; }
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (e: any) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          // Subscription scaduta — rimuovi
          await pool.execute(
            "DELETE FROM `push_subscriptions` WHERE `user_id` = ? AND `society_key` = ?",
            [userId, societyKey]
          ).catch(() => {});
          errors.push(`expired_${e.statusCode}`);
        } else {
          errors.push(`send_error_${e.statusCode ?? "unknown"}`);
          logger.warn({ err: e, userId, email }, "test-push send warning");
        }
      }
    }

    console.log(`[test-push] User ${email} -> userId ${userId}, subs ${subRows.length}, sent ${sent}`);
    return res.json({ ok: true, found_user: true, user_id: userId, subscriptions: subRows.length, sent, errors });
  } catch (e: any) {
    logger.error({ err: e }, "test-push error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

export default router;
