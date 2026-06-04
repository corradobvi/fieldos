import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

// Helpers di normalizzazione leva: stessi usati dal resolver in chat.ts.
// renameLeva FE aggiorna blob ma NON propaga a users.leva → mismatch:
// blob='U11 – Pulcini', users.leva='U11' (old) → niente match senza normalizzazione.
function _diagLevaPrefixes(leva: string): string[] {
  const out = new Set<string>([leva]);
  for (const sep of [" – ", " - ", " — "]) {
    const idx = leva.indexOf(sep);
    if (idx > 0) out.add(leva.substring(0, idx).trim());
  }
  return Array.from(out).filter(s => s.length > 0);
}
function _diagLevaClause(leva: string): { sql: string; params: any[] } {
  const targets = _diagLevaPrefixes(leva);
  const inPh = targets.map(() => "?").join(",");
  const jsonOr = targets.map(() => "JSON_CONTAINS(leva, JSON_QUOTE(?))").join(" OR ");
  const sql = `(
    leva IN (${inPh})
    OR SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(leva, ' – ', 1), ' - ', 1), ' — ', 1) IN (${inPh})
    OR leva IS NULL OR leva = '' OR leva = 'Tutte' OR leva = 'tutte'
    OR (JSON_VALID(leva) AND (${jsonOr}))
  )`;
  return { sql, params: [...targets, ...targets, ...targets] };
}

function checkAuth(req: any, res: any): boolean {
  const secret = req.headers["x-sa-secret"];
  const saSecret = process.env.SA_SECRET ?? "super123";
  if (secret !== saSecret) { res.status(401).json({ error: "unauthorized" }); return false; }
  return true;
}

router.get("/superadmin/_diag/push", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const societyId = parseInt(String(req.query.societyId || '38'));
  try {
    const [total] = await pool.execute(`SELECT COUNT(*) AS n FROM push_subscriptions`) as [any[], any];
    const [bySoc] = await pool.execute(
      `SELECT COUNT(*) AS n FROM push_subscriptions WHERE society_key = ?`,
      [`fieldos_state_soc_${societyId}`]
    ) as [any[], any];
    const [sample] = await pool.execute(
      `SELECT id, user_id, society_key, CHAR_LENGTH(subscription) AS sub_size, updated_at
       FROM push_subscriptions ORDER BY id DESC LIMIT 10`
    ) as [any[], any];
    const [socSubs] = await pool.execute(
      `SELECT id, user_id, CHAR_LENGTH(subscription) AS sub_size, updated_at
       FROM push_subscriptions WHERE society_key = ? ORDER BY id`,
      [`fieldos_state_soc_${societyId}`]
    ) as [any[], any];
    const [bySocAll] = await pool.execute(
      `SELECT society_key, COUNT(*) AS n FROM push_subscriptions GROUP BY society_key ORDER BY n DESC`
    ) as [any[], any];
    return res.json({
      total: total[0].n,
      by_society_38: bySoc[0].n,
      by_society_all: bySocAll,
      society_38_subs: socSubs,
      sample_recent: sample,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

// GET /api/v2/superadmin/_diag/push-remap?societyId=38&dryRun=1
// Analizza (e con dryRun=0 esegue) il remap delle subscription push:
// user_id BLOB → user_id MySQL, identificando l'utente per email (blob USERS_DB ↔ MySQL users).
router.get("/superadmin/_diag/push-remap", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const societyId = parseInt(String(req.query.societyId || ''));
  const dryRun = String(req.query.dryRun ?? '1') !== '0';
  if (!societyId || !Number.isFinite(societyId)) {
    return res.status(400).json({ error: "societyId required" });
  }
  const stateKey = `fieldos_state_soc_${societyId}`;

  try {
    // 1. Carica il blob USERS_DB della società
    const [blobRows] = await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [stateKey]
    ) as [any[], any];
    if (!blobRows.length) {
      return res.status(404).json({ error: "blob_not_found", stateKey });
    }
    let state: any;
    try { state = JSON.parse(blobRows[0].state_json as string); }
    catch { return res.status(500).json({ error: "blob_parse_error" }); }
    const blobUsers: any[] = Array.isArray(state.USERS_DB) ? state.USERS_DB : [];
    const blobUserById = new Map<number, any>(blobUsers.map((u: any) => [u.id, u]));

    // 2. Carica utenti MySQL della società
    const [mysqlRows] = await pool.execute(
      `SELECT id, email FROM users WHERE society_id = ? AND stato = 'attivo'`,
      [societyId]
    ) as [any[], any];
    const mysqlIdByEmail = new Map<string, number>(
      (mysqlRows as any[]).map((r: any) => [String(r.email || '').toLowerCase(), r.id as number])
    );
    const mysqlIds = new Set((mysqlRows as any[]).map((r: any) => r.id as number));

    // 3. Carica subscription per la società
    const [subs] = await pool.execute(
      `SELECT id, user_id, society_key, CHAR_LENGTH(subscription) AS sub_size, updated_at
       FROM push_subscriptions WHERE society_key = ? ORDER BY id`,
      [stateKey]
    ) as [any[], any];

    // 4. Analisi riga per riga
    const analysis: any[] = [];
    const toRemap: Array<{ subId: number; oldUserId: number; newUserId: number; email: string }> = [];
    for (const s of subs as any[]) {
      const blobUserId = s.user_id as number;
      // Se l'id corrisponde già a un id MySQL della società, è già OK
      if (mysqlIds.has(blobUserId)) {
        analysis.push({
          sub_id: s.id, user_id_blob: blobUserId, email: null, user_id_mysql: blobUserId,
          match_status: "user_id_già_mysql",
        });
        continue;
      }
      // Cerca nel blob l'utente con quell'id per estrarre l'email
      const bu = blobUserById.get(blobUserId);
      const email = bu && typeof bu.email === 'string' ? bu.email.toLowerCase().trim() : null;
      if (!email) {
        analysis.push({
          sub_id: s.id, user_id_blob: blobUserId, email: null, user_id_mysql: null,
          match_status: "blob_user_non_trovato",
        });
        continue;
      }
      const mysqlId = mysqlIdByEmail.get(email);
      if (!mysqlId) {
        analysis.push({
          sub_id: s.id, user_id_blob: blobUserId, email, user_id_mysql: null,
          match_status: "email_non_trovata_in_mysql",
        });
        continue;
      }
      analysis.push({
        sub_id: s.id, user_id_blob: blobUserId, email, user_id_mysql: mysqlId,
        match_status: "ok_remappabile",
      });
      toRemap.push({ subId: s.id, oldUserId: blobUserId, newUserId: mysqlId, email });
    }

    // 5. Se dryRun=0, esegui UPDATE in transazione
    let applied: any[] = [];
    let txStatus: string = "skipped (dryRun)";
    if (!dryRun && toRemap.length > 0) {
      const conn = await (pool as any).getConnection();
      try {
        await conn.beginTransaction();
        for (const r of toRemap) {
          // Check: il target (user_id MySQL + society_key) non deve già esistere (UNIQUE KEY)
          const [existing] = await conn.execute(
            "SELECT id FROM `push_subscriptions` WHERE `user_id` = ? AND `society_key` = ? LIMIT 1",
            [r.newUserId, stateKey]
          );
          if ((existing as any[]).length) {
            // Conflitto: esiste già una subscription con quel target. Cancelliamo la riga blob per non rompere unique key.
            await conn.execute(
              "DELETE FROM `push_subscriptions` WHERE id = ?",
              [r.subId]
            );
            applied.push({ ...r, action: "deleted_duplicate" });
          } else {
            await conn.execute(
              "UPDATE `push_subscriptions` SET user_id = ? WHERE id = ?",
              [r.newUserId, r.subId]
            );
            applied.push({ ...r, action: "updated" });
          }
        }
        await conn.commit();
        txStatus = "committed";
      } catch (e: any) {
        try { await conn.rollback(); } catch (_) {}
        txStatus = "rolledback: " + (e?.message || String(e));
      } finally {
        try { conn.release(); } catch (_) {}
      }
    } else if (!dryRun && toRemap.length === 0) {
      txStatus = "no-op (toRemap is empty)";
    }

    return res.json({
      societyId, stateKey, dryRun,
      counts: {
        total_subscriptions: subs.length,
        ok_remappabile:        analysis.filter(a => a.match_status === "ok_remappabile").length,
        user_id_già_mysql:    analysis.filter(a => a.match_status === "user_id_già_mysql").length,
        email_non_trovata:    analysis.filter(a => a.match_status === "email_non_trovata_in_mysql").length,
        blob_user_non_trovato: analysis.filter(a => a.match_status === "blob_user_non_trovato").length,
      },
      analysis,
      applied,
      tx_status: txStatus,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

// GET /api/v2/superadmin/_diag/chat-recipients?societyId=X&chatId=staff_U11&senderUserId=Y
// Spiega per quale motivo (ruolo / leva / subscription / pref) un utente non riceve la push
// per una chat. Restituisce:
//   - recipients: utenti effettivamente targettati dal resolver (esclusi sender + sospesi)
//   - user_breakdown: TUTTI gli utenti della società col ruolo eligibile per quel pattern,
//     con la leva grezza dal DB e il motivo include/exclude
//   - push_subscriptions: present_for vs missing_for per ciascun recipient
//   - notify_chat_optouts: opt-out per ciascun recipient
//   - hint: riassunto della causa probabile
router.get("/superadmin/_diag/chat-recipients", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const societyId    = parseInt(String(req.query.societyId || ''));
  const chatId       = String(req.query.chatId || '').trim();
  const senderUserId = parseInt(String(req.query.senderUserId || '0')) || 0;
  if (!societyId || !chatId) {
    return res.status(400).json({ error: "societyId_and_chatId_required" });
  }
  const stateKey = `fieldos_state_soc_${societyId}`;
  try {
    const staffMatch   = chatId.match(/^staff_(.+)$/);
    const levaFamMatch = chatId.match(/^(?:leva|group)_(.+)$/);
    const squadraMatch = chatId.match(/^squadra_(.+)$/);
    const adhocMatch   = chatId.match(/^adhoc_/);
    const pattern = staffMatch ? "staff"
                  : levaFamMatch ? "leva_famiglie"
                  : squadraMatch ? "squadra"
                  : adhocMatch ? "adhoc" : "unknown";
    const lv = staffMatch?.[1] || levaFamMatch?.[1] || squadraMatch?.[1] || null;

    const eligibleRoles =
      pattern === "staff"         ? ["admin","mister_admin","allenatore","mister","dirigente","preparatore_portieri"] :
      pattern === "leva_famiglie" ? ["dirigente","genitore","nonno"] :
      pattern === "squadra"       ? ["allenatore","mister","preparatore_portieri","giocatore"] :
      [];

    const [allRows] = await pool.execute(
      `SELECT id, nome, cognome, ruolo, leva, stato FROM users WHERE society_id = ? ORDER BY ruolo, cognome, nome`,
      [societyId]
    ) as [any[], any];
    const eligibleUsers = (allRows as any[]).filter(u => eligibleRoles.includes(u.ruolo));

    let recipients: number[] = [];
    if (pattern === "staff" && lv) {
      const lc = _diagLevaClause(lv);
      const [r] = await pool.execute(
        `SELECT DISTINCT id FROM users
          WHERE society_id = ? AND stato = 'attivo' AND id != ?
            AND ( ruolo IN ('admin','mister_admin')
                  OR ( ruolo IN ('allenatore','mister','dirigente','preparatore_portieri')
                       AND ${lc.sql} ) )`,
        [societyId, senderUserId, ...lc.params]
      ) as [any[], any];
      recipients = (r as any[]).map(x => Number(x.id));
    } else if (pattern === "leva_famiglie" && lv) {
      const lc = _diagLevaClause(lv);
      const [r] = await pool.execute(
        `SELECT id FROM users
          WHERE society_id = ? AND stato = 'attivo' AND ruolo = 'dirigente'
            AND ${lc.sql} AND id != ?`,
        [societyId, ...lc.params, senderUserId]
      ) as [any[], any];
      recipients = (r as any[]).map(x => Number(x.id));
    } else if (pattern === "squadra" && lv) {
      const lc = _diagLevaClause(lv);
      const [r] = await pool.execute(
        `SELECT id FROM users
          WHERE society_id = ? AND stato = 'attivo'
            AND ruolo IN ('allenatore','mister','preparatore_portieri')
            AND ${lc.sql} AND id != ?`,
        [societyId, ...lc.params, senderUserId]
      ) as [any[], any];
      recipients = (r as any[]).map(x => Number(x.id));
    } else if (pattern === "adhoc") {
      const [r] = await pool.execute(
        `SELECT user_id AS id FROM adhoc_chat_members
          WHERE society_id = ? AND chat_id = ? AND user_id != ?`,
        [societyId, chatId, senderUserId]
      ) as [any[], any];
      recipients = (r as any[]).map(x => Number(x.id));
    }

    const recipientSet = new Set(recipients);
    const userBreakdown = eligibleUsers.map(u => {
      const included = recipientSet.has(Number(u.id));
      let reason: string = included ? "included" : "excluded";
      if (!included) {
        if (u.stato !== 'attivo') reason = `excluded: stato='${u.stato}'`;
        else if (Number(u.id) === senderUserId) reason = "excluded: is_sender";
        else if (lv && !['admin','mister_admin'].includes(u.ruolo)) {
          const raw = u.leva;
          let parsedArr: any = null;
          try { parsedArr = (raw && typeof raw === 'string' && raw.startsWith('[')) ? JSON.parse(raw) : null; } catch {}
          const isMultiLeva = Array.isArray(parsedArr);
          reason = `excluded: leva_mismatch (stored=${JSON.stringify(raw)}, target=${JSON.stringify(lv)}, json_array=${isMultiLeva})`;
        }
      }
      return { id: u.id, nome: u.nome, cognome: u.cognome, ruolo: u.ruolo, leva_stored: u.leva, stato: u.stato, reason };
    });

    let subInfo: any[] = [];
    let prefInfo: any[] = [];
    if (recipients.length) {
      const ph = recipients.map(() => '?').join(',');
      const [subs] = await pool.execute(
        `SELECT user_id, CHAR_LENGTH(subscription) AS sub_size, updated_at
           FROM push_subscriptions WHERE user_id IN (${ph}) AND society_key = ?`,
        [...recipients, stateKey]
      ) as [any[], any];
      subInfo = subs as any[];
      try {
        const [prefs] = await pool.execute(
          `SELECT user_id, notify_chat FROM user_notification_preferences WHERE user_id IN (${ph})`,
          recipients
        ) as [any[], any];
        prefInfo = prefs as any[];
      } catch (_) { /* tabella opzionale */ }
    }
    const subbedSet = new Set(subInfo.map(s => Number(s.user_id)));
    const noSubscription = recipients.filter(id => !subbedSet.has(id));
    const optedOut = prefInfo.filter(p => Number(p.notify_chat) === 0).map(p => Number(p.user_id));

    return res.json({
      input: { societyId, chatId, senderUserId, pattern, leva_extracted: lv },
      recipients,
      recipients_count: recipients.length,
      eligible_role_count: eligibleUsers.length,
      user_breakdown: userBreakdown,
      push_subscriptions: { present_for: Array.from(subbedSet), missing_for: noSubscription, sample: subInfo },
      notify_chat_optouts: optedOut,
      hint: recipients.length === 0
        ? "Nessun destinatario: probabile mismatch leva o stato!='attivo' per i ruoli eligibili. Vedi user_breakdown."
        : (noSubscription.length
            ? `Push subscription mancante per: ${noSubscription.join(', ')} → device non sottoscritto.`
            : (optedOut.length ? `Opt-out notify_chat per: ${optedOut.join(', ')}` : "Tutto ok lato resolver+sub+pref."))
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

export default router;
