import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";

const router = Router();

const VALID_KEYS = ["notify_convocazioni", "notify_comunicazioni", "notify_chat", "notify_reminders"] as const;
type PrefKey = typeof VALID_KEYS[number];

async function ensureRow(userId: number): Promise<void> {
  await pool.execute(
    `INSERT IGNORE INTO user_notification_preferences (user_id) VALUES (?)`,
    [userId]
  );
}

// GET /api/v2/users/me/notification-preferences
router.get("/users/me/notification-preferences", requireAuth, async (req, res) => {
  const { userId } = req.jwtUser!;
  try {
    await ensureRow(userId);
    const [rows] = (await pool.execute(
      `SELECT notify_convocazioni, notify_comunicazioni, notify_chat, notify_reminders
       FROM user_notification_preferences WHERE user_id = ?`,
      [userId]
    )) as [any[], any];

    if (!rows.length) {
      return res.json({ notify_convocazioni: true, notify_comunicazioni: true, notify_chat: true, notify_reminders: true });
    }
    const r = rows[0];
    return res.json({
      notify_convocazioni: !!r.notify_convocazioni,
      notify_comunicazioni: !!r.notify_comunicazioni,
      notify_chat: !!r.notify_chat,
      notify_reminders: !!r.notify_reminders,
    });
  } catch (e: any) {
    logger.error({ err: e }, "GET notification-preferences error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/v2/users/me/notification-preferences
router.put("/users/me/notification-preferences", requireAuth, async (req, res) => {
  const { userId } = req.jwtUser!;
  const body = req.body as Record<string, unknown>;

  const updates: Partial<Record<PrefKey, boolean>> = {};
  for (const key of VALID_KEYS) {
    if (key in body && typeof body[key] === "boolean") {
      updates[key] = body[key] as boolean;
    }
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: "no_valid_fields" });
  }

  try {
    await ensureRow(userId);
    const setClauses = (Object.keys(updates) as PrefKey[]).map(k => `\`${k}\` = ?`).join(", ");
    const vals = [...(Object.values(updates) as boolean[]).map(v => v ? 1 : 0), userId];
    await pool.execute(
      `UPDATE user_notification_preferences SET ${setClauses} WHERE user_id = ?`,
      vals
    );
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "PUT notification-preferences error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
