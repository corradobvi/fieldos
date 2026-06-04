import webpush from "web-push";
import { pool } from "@workspace/db";
import { logger } from "./logger";
import { _levaMatchClause } from "./leva-match";

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
  const pub  = process.env["VAPID_PUBLIC_KEY"]  ?? "BLtLtdvuscq-1UdvumGdZHtv67YzoNxg1Lydz5Sv_zcet6B3lBi8b25lGxWLyzN4M_TSkVuOOG6kVy1kkg3Lcm8";
  const priv = process.env["VAPID_PRIVATE_KEY"] ?? "WpDkZogamff-74e9rw4OrrCfPEh-_WGwjaYBClk0rIA";
  const subj = process.env["VAPID_SUBJECT"]     ?? "mailto:admin@myvivaio.app";
  if (!pub || !priv) return false;
  try { webpush.setVapidDetails(subj, pub, priv); } catch { /* already set */ }
  return true;
}

type NotifPrefKey = "notify_convocazioni" | "notify_comunicazioni" | "notify_chat" | "notify_reminders";

// Filters out users who have opted out of a specific notification type.
export async function filterByPref(userIds: number[], prefKey: NotifPrefKey): Promise<number[]> {
  if (!userIds.length) return [];
  try {
    const placeholders = userIds.map(() => "?").join(",");
    const [rows] = (await pool.execute(
      `SELECT user_id FROM user_notification_preferences
       WHERE user_id IN (${placeholders}) AND \`${prefKey}\` = 0`,
      userIds
    )) as [any[], any];
    const optedOut = new Set(rows.map((r: any) => r.user_id as number));
    return userIds.filter(id => !optedOut.has(id));
  } catch {
    return userIds; // table may not exist yet — send to all
  }
}

// Sends a push to all subscriptions for the given userIds + societyKey.
// Never throws — errors are isolated. Expired subs (410/404) are removed.
// prefKey: when set, users with that preference disabled are skipped.
export async function sendPushToUsers(
  userIds: number[],
  societyKey: string,
  payload: PushPayload,
  prefKey?: NotifPrefKey
): Promise<{ sent: number; errors: number }> {
  if (!userIds.length || !_initVapid()) return { sent: 0, errors: 0 };

  const filteredIds = prefKey ? await filterByPref(userIds, prefKey) : userIds;
  if (!filteredIds.length) return { sent: 0, errors: 0 };

  let rows: any[] = [];
  try {
    const placeholders = filteredIds.map(() => "?").join(",");
    const [r] = (await pool.execute(
      `SELECT user_id, subscription FROM push_subscriptions
       WHERE user_id IN (${placeholders}) AND society_key = ?`,
      [...filteredIds, societyKey]
    )) as [any[], any];
    rows = r;
  } catch (e: any) {
    logger.warn({ err: e }, "push-sender: DB lookup failed");
    return { sent: 0, errors: 0 };
  }

  // Diagnostica: chi non ha subscription registrata (es. permesso non concesso, browser non subscribato).
  if (filteredIds.length) {
    const subscribed = new Set(rows.map((r: any) => Number(r.user_id)));
    const noSub = filteredIds.filter(id => !subscribed.has(id));
    if (noSub.length) logger.info({ noSub, societyKey }, "push-sender: no subscription for users");
  }
  if (!rows.length) {
    logger.info({ requested: filteredIds.length, societyKey }, "push-sender: zero subscriptions for any requested user");
    return { sent: 0, errors: 0 };
  }

  const message = JSON.stringify(payload);
  let sent = 0;
  let errors = 0;

  for (const row of rows) {
    let sub: any;
    try { sub = JSON.parse(row.subscription); } catch { errors++; continue; }
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
// If leva is set: returns staff of that leva + admin/dirigente + ALL guardians of players in that leva.
// excludeUserId: omit the sender.
// staffOnly: se true, ESCLUDE i guardian (usato per notifiche privacy-sensitive tipo "nuovo_genitore").
export async function getUsersForPush(
  societyId: number,
  options: { leva?: string | null; excludeUserId?: number; staffOnly?: boolean } = {}
): Promise<number[]> {
  const { leva, excludeUserId, staffOnly } = options;
  try {
    // Query 1: staff users.
    // Logica leva: identica al chat resolver (_levaMatchClause condiviso in lib/leva-match.ts).
    // Copre exact, prefix-stored (en-dash/hyphen/em-dash), null/empty/Tutte/tutte, JSON array.
    // Catch-all ruoli admin/mister_admin/dirigente (sempre inclusi indipendentemente da leva).
    // 'mister' incluso come ruolo "staff" ma soggetto a leva-match come allenatore.
    let staffQuery = `SELECT id, ruolo, leva FROM users WHERE society_id = ? AND stato = 'attivo'`;
    const staffParams: any[] = [societyId];
    if (excludeUserId) { staffQuery += " AND id != ?"; staffParams.push(excludeUserId); }
    if (leva) {
      const lc = _levaMatchClause(leva);
      staffQuery += ` AND (
        ruolo IN ('admin','mister_admin','dirigente')
        OR (ruolo IN ('allenatore','mister','preparatore_portieri') AND ${lc.sql})
      )`;
      staffParams.push(...lc.params);
    }

    const [staffRows] = (await pool.execute(staffQuery, staffParams)) as [any[], any];
    const staffIds: number[] = (staffRows as any[]).map((r: any) => Number(r.id));
    const staffDetail = (staffRows as any[]).map((r: any) => ({
      user_id: Number(r.id), ruolo: r.ruolo, leva_stored: r.leva,
    }));

    // Query 2: guardians of players in this leva (new GDPR flow) — solo se NON staffOnly
    let guardianIds: number[] = [];
    if (!staffOnly && leva) {
      try {
        let gQuery = `SELECT DISTINCT pg.user_id AS id
          FROM player_guardians pg
          JOIN players p ON p.id = pg.player_id
          JOIN users u ON u.id = pg.user_id
          WHERE p.society_id = ? AND p.leva = ? AND u.stato = 'attivo'`;
        const gParams: any[] = [societyId, leva];
        if (excludeUserId) { gQuery += " AND pg.user_id != ?"; gParams.push(excludeUserId); }
        const [gRows] = (await pool.execute(gQuery, gParams)) as [any[], any];
        guardianIds = (gRows as any[]).map((r: any) => Number(r.id));
      } catch {
        // player_guardians table may not exist yet — safe to ignore
      }
    }

    const allIds = [...new Set([...staffIds, ...guardianIds])];

    // Logging: ogni chiamata logga societyId, leva target, staff destinatari (con ruolo+leva),
    // guardian count, totale. Permette di tracciare su Railway quando un mister/allenatore
    // viene (o non viene) incluso e perche'.
    logger.info({
      societyId,
      leva_target: leva ?? null,
      excludeUserId: excludeUserId ?? null,
      staffOnly: !!staffOnly,
      staff: staffDetail,
      guardianCount: guardianIds.length,
      total: allIds.length,
    }, "push-sender: getUsersForPush resolved");

    return allIds;
  } catch (e: any) {
    logger.warn({ err: e }, "push-sender: getUsersForPush error");
    return [];
  }
}
