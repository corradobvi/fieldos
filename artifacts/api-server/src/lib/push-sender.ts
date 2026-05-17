import webpush from "web-push";
import { pool } from "@workspace/db";
import { logger } from "./logger";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

// Returns the society_key format stored in push_subscriptions
export function societyKeyFor(societyId: number): string {
  return `fieldos_state_soc_${societyId}`;
}

// Idempotent VAPID init — safe to call multiple times
function _initVapid(): boolean {
  const pub  = process.env["VAPID_PUBLIC_KEY"]  ?? "";
  const priv = process.env["VAPID_PRIVATE_KEY"] ?? "";
  const subj = process.env["VAPID_SUBJECT"]     ?? "mailto:admin@myvivaio.app";
  if (!pub || !priv) return false;
  try { webpush.setVapidDetails(subj, pub, priv); } catch { /* already set */ }
  return true;
}

// Sends a push to all subscriptions for the given userIds + societyKey.
// Never throws — errors are isolated. Expired subs (410/404) are removed.
export async function sendPushToUsers(
  userIds: number[],
  societyKey: string,
  payload: PushPayload
): Promise<{ sent: number; errors: number }> {
  if (!userIds.length || !_initVapid()) return { sent: 0, errors: 0 };

  let rows: any[] = [];
  try {
    const placeholders = userIds.map(() => "?").join(",");
    const [r] = (await pool.execute(
      `SELECT user_id, subscription_json FROM push_subscriptions
       WHERE user_id IN (${placeholders}) AND society_key = ?`,
      [...userIds, societyKey]
    )) as [any[], any];
    rows = r;
  } catch (e: any) {
    logger.warn({ err: e }, "push-sender: DB lookup failed");
    return { sent: 0, errors: 0 };
  }

  if (!rows.length) return { sent: 0, errors: 0 };

  const message = JSON.stringify(payload);
  let sent = 0;
  let errors = 0;

  for (const row of rows) {
    let sub: any;
    try { sub = JSON.parse(row.subscription_json); } catch { errors++; continue; }
    try {
      await webpush.sendNotification(sub, message);
      sent++;
    } catch (e: any) {
      if (e.statusCode === 410 || e.statusCode === 404) {
        await pool.execute(
          "DELETE FROM push_subscriptions WHERE user_id = ? AND society_key = ?",
          [row.user_id, societyKey]
        ).catch(() => {});
      } else {
        logger.warn({ err: e, userId: row.user_id }, "push-sender: webpush error");
      }
      errors++;
    }
  }

  logger.info({ sent, errors, societyKey }, "push-sender: completed");
  return { sent, errors };
}

// Fetches active user IDs for a society.
// If leva is set: returns users of that leva + admin/dirigente (always receive).
// excludeUserId: omit the sender.
export async function getUsersForPush(
  societyId: number,
  options: { leva?: string | null; excludeUserId?: number } = {}
): Promise<number[]> {
  const { leva, excludeUserId } = options;
  try {
    let query = "SELECT id FROM users WHERE society_id = ? AND stato = 'attivo'";
    const params: any[] = [societyId];

    if (excludeUserId) {
      query += " AND id != ?";
      params.push(excludeUserId);
    }
    if (leva) {
      query += " AND (leva = ? OR ruolo IN ('admin', 'dirigente'))";
      params.push(leva);
    }

    const [rows] = (await pool.execute(query, params)) as [any[], any];
    return rows.map((r: any) => r.id as number);
  } catch (e: any) {
    logger.warn({ err: e }, "push-sender: getUsersForPush error");
    return [];
  }
}
