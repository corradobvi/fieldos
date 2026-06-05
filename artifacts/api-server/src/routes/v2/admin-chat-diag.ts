// Endpoint diagnostico TEMPORANEO, READ-ONLY.
// Usa SOLO SELECT. Nessuna scrittura.
// Riusa DIRETTAMENTE le funzioni di produzione:
//   - chat.ts:_resolveChatRecipients (recipient resolver server-side)
//   - push-sender.ts:filterByPref (notify_chat opt-out filter)
//   - push-sender.ts:societyKeyFor (società → push_subscriptions.society_key)
// così l'output riflette il comportamento REALE del codice attuale.
//
// Auth: requireAuth (Bearer JWT in Authorization header) + role check admin/mister_admin
// + same-society guard. Niente SA-secret. Il wrapper /ui legge il token da localStorage
// dell'admin loggato.
//
// Da rimuovere dopo la diagnosi (file standalone, basta tagliare la registrazione in
// routes/v2/index.ts e il file).

import { Router, Request, Response } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";
import { _resolveChatRecipients } from "./chat";
import { filterByPref, societyKeyFor } from "../../lib/push-sender";

const router = Router();

// Common gate: admin/mister_admin nella stessa società del JWT.
function _gate(req: Request, res: Response): { societyId: number; userId: number; role: string } | null {
  const j = req.jwtUser!;
  if (j.role !== "admin" && j.role !== "mister_admin") {
    res.status(403).json({ error: "forbidden", detail: "admin/mister_admin only" });
    return null;
  }
  const qSoc = Number(req.query.societyId);
  if (Number.isFinite(qSoc) && qSoc > 0 && qSoc !== j.societyId) {
    res.status(403).json({ error: "forbidden", detail: "cross-society lookup denied" });
    return null;
  }
  return { societyId: j.societyId, userId: j.userId, role: j.role };
}

// Estrae il pattern (staff_/leva_/squadra_/torneo_/adhoc_) di un chatId.
function _patternOf(chatId: string): { pattern: string; leva: string | null } {
  let m;
  if ((m = chatId.match(/^staff_(.+)$/)))           return { pattern: "staff",         leva: m[1] };
  if ((m = chatId.match(/^(?:leva|group)_(.+)$/)))  return { pattern: "leva_famiglie", leva: m[1] };
  if ((m = chatId.match(/^squadra_(.+)$/)))         return { pattern: "squadra",       leva: m[1] };
  if ((m = chatId.match(/^torneo_(.+)$/)))          return { pattern: "torneo",        leva: null };
  if (chatId.startsWith("adhoc_"))                  return { pattern: "adhoc",         leva: null };
  return { pattern: "unknown", leva: null };
}

// Per chat staff: utenti rilevanti = tutti i collaboratori della società
// (admin/mister_admin sempre + allenatore/mister/dirigente/preparatore_portieri,
// indipendentemente dalla leva — la diagnosi DEVE mostrare anche chi viene escluso
// per leva-mismatch). Per adhoc: tutti i row di adhoc_chat_members + la lista
// blob members estratta dal society_state.state_json (per evidenziare blob_id non
// validi che il PUT /chat/adhoc/:chatId/members ha scartato).
async function _shortlistForChat(societyId: number, chatId: string): Promise<any[]> {
  const { pattern } = _patternOf(chatId);
  if (pattern === "staff" || pattern === "leva_famiglie" || pattern === "squadra" || pattern === "torneo") {
    const [rows] = (await pool.execute(
      `SELECT id, nome, cognome, ruolo, leva, stato, email
         FROM users
        WHERE society_id = ?
          AND ruolo IN ('admin','mister_admin','allenatore','mister','dirigente','preparatore_portieri','genitore','nonno','giocatore')
        ORDER BY ruolo, cognome, nome`,
      [societyId]
    )) as [any[], any];
    return rows as any[];
  }
  if (pattern === "adhoc") {
    // Membri persistiti server-side
    const [rows] = (await pool.execute(
      `SELECT u.id, u.nome, u.cognome, u.ruolo, u.leva, u.stato, u.email
         FROM adhoc_chat_members m
         LEFT JOIN users u ON u.id = m.user_id
        WHERE m.society_id = ? AND m.chat_id = ?
        ORDER BY u.ruolo, u.cognome, u.nome`,
      [societyId, chatId]
    )) as [any[], any];
    // Membri presenti come user_id ma SENZA riga users corrispondente (orfani blob-id)
    const [orphan] = (await pool.execute(
      `SELECT m.user_id AS id, m.created_at
         FROM adhoc_chat_members m
         LEFT JOIN users u ON u.id = m.user_id
        WHERE m.society_id = ? AND m.chat_id = ? AND u.id IS NULL`,
      [societyId, chatId]
    )) as [any[], any];
    const out: any[] = (rows as any[]).filter(r => r.id != null).map(r => ({ ...r, _adhocRowValid: true }));
    for (const o of orphan as any[]) {
      out.push({ id: o.id, nome: null, cognome: null, ruolo: null, leva: null, stato: null, email: null, _adhocRowValid: false, _orphanReason: "user_id not in users table" });
    }
    return out;
  }
  return [];
}

// Carica la lista leve dal blob society_state.state_json (s.leve = array stringhe).
// Sorgente AUTOREVOLE lato FE: il mister vede le chat costruite da getChatsForUser
// usando proprio questa lista (index.html:31210 → restoreState popola `leve`).
async function _loadLeveFromBlob(societyId: number): Promise<{ source: string; leve: string[] }> {
  const stateKey = `fieldos_state_soc_${societyId}`;
  try {
    const [rows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [stateKey]
    )) as [any[], any];
    if (rows.length) {
      const s = JSON.parse(rows[0].state_json as string);
      if (Array.isArray(s?.leve) && s.leve.length) {
        return { source: "blob_society_state", leve: s.leve.filter((x: any) => typeof x === "string") };
      }
    }
  } catch (_) { /* fallback */ }
  return { source: "blob_unavailable", leve: [] };
}

// Scoperta automatica delle chat candidate per una società.
//   - staff_<lv>: una per ciascuna leva (preferito: blob society_state.s.leve;
//     fallback: tabella MySQL `leve`). Il formato `staff_<lv>` deve essere
//     IDENTICO a quello che _resolveChatRecipients si aspetta: parsing
//     /^staff_(.+)$/ — quindi `<lv>` e' il nome leva grezzo (può contenere
//     spazi, en-dash, ecc., come dal blob FE).
//   - squadra_<lv>: stesso bacino di leve (formato /^squadra_(.+)$/).
//   - adhoc_<id>: distinct chat_id da adhoc_chat_members.
async function _discoverChats(societyId: number): Promise<{ staff: string[]; squadra: string[]; adhoc: string[]; leve: string[]; leveSource: string }> {
  // Sorgente 1: blob (autorevole per il FE, riflette renameLeva e leve correnti)
  const fromBlob = await _loadLeveFromBlob(societyId);
  let leveNames: string[] = fromBlob.leve;
  let leveSource = fromBlob.source;
  // Sorgente 2 (fallback): tabella MySQL `leve`
  if (!leveNames.length) {
    try {
      const [leveRows] = (await pool.execute(
        "SELECT nome FROM leve WHERE society_id = ? ORDER BY ordine, nome",
        [societyId]
      )) as [any[], any];
      leveNames = (leveRows as any[]).map(r => String(r.nome));
      leveSource = "mysql_leve_table";
    } catch (_) { /* nessuna sorgente */ }
  }
  const staff   = leveNames.map(n => `staff_${n}`);
  const squadra = leveNames.map(n => `squadra_${n}`);
  let adhoc: string[] = [];
  try {
    const [adhocRows] = (await pool.execute(
      "SELECT DISTINCT chat_id FROM adhoc_chat_members WHERE society_id = ? ORDER BY chat_id",
      [societyId]
    )) as [any[], any];
    adhoc = (adhocRows as any[]).map(r => String(r.chat_id));
  } catch (_) { /* tabella opzionale */ }
  return { staff, squadra, adhoc, leve: leveNames, leveSource };
}

// Per ciascun utente in shortlist, calcola:
//   - isRecipient: incluso dal resolver di produzione (per il senderUserId richiesto)
//   - isMember: incluso dal resolver con sentinel -1 (= membro della chat, indipendente dal sender)
//   - hasSubscription: esiste riga push_subscriptions per (user_id, society_key) [READ]
//   - optedOutNotifyChat: filterByPref([uid], 'notify_chat') lo esclude?
//   - reason: motivo include/exclude lato resolver
async function _enrichUser(
  u: any, societyId: number, chatId: string, senderUserId: number,
  recipientSet: Set<number>, memberSet: Set<number>
): Promise<any> {
  const id = Number(u.id);
  const isRecipient = recipientSet.has(id);
  const isMember = memberSet.has(id);
  const stateKey = societyKeyFor(societyId);

  // push subscription presente?
  const [subRows] = (await pool.execute(
    "SELECT id, CHAR_LENGTH(subscription) AS sub_size, updated_at FROM push_subscriptions WHERE user_id = ? AND society_key = ?",
    [id, stateKey]
  )) as [any[], any];
  const hasSubscription = (subRows as any[]).length > 0;

  // opt-out notify_chat?
  let optedOutNotifyChat = false;
  try {
    const survives = await filterByPref([id], "notify_chat");
    optedOutNotifyChat = survives.length === 0;
  } catch (_) { /* tabella opzionale */ }

  // motivo della (non) inclusione
  let reason: string;
  if (isRecipient) {
    reason = "included_recipient";
  } else if (Number(senderUserId) === id) {
    reason = "excluded_sender";
  } else if (isMember) {
    // member ma non recipient (= e' lui il sender) — gia' coperto sopra; questo branch
    // copre il caso difensivo in cui il resolver-as-sender esclude per altro motivo.
    reason = "member_but_not_recipient_for_this_sender";
  } else {
    if (u.stato && u.stato !== "attivo") {
      reason = `excluded_stato_${u.stato}`;
    } else if (u._adhocRowValid === false) {
      reason = "excluded_adhoc_orphan_user_id (blob_id != MySQL users.id)";
    } else if (chatId.startsWith("adhoc_")) {
      reason = "excluded_not_in_adhoc_chat_members";
    } else {
      // staff/leva/squadra/torneo → quasi sempre leva-mismatch
      reason = `excluded_role_or_leva_mismatch (ruolo='${u.ruolo}', leva_stored=${JSON.stringify(u.leva)})`;
    }
  }

  return {
    id,
    nome: u.nome,
    cognome: u.cognome,
    email: u.email,
    ruolo: u.ruolo,
    leva_stored: u.leva,
    stato: u.stato,
    is_recipient: isRecipient,
    is_member: isMember,
    has_push_subscription: hasSubscription,
    opted_out_notify_chat: optedOutNotifyChat,
    adhoc_row_valid: u._adhocRowValid ?? null,
    sub_meta: hasSubscription ? { sub_size: subRows[0].sub_size, updated_at: subRows[0].updated_at } : null,
    reason,
  };
}

// GET /api/v2/_diag/chat
// Query: ?chatId=<id opzionale>&senderUserId=<id opzionale, default jwt.userId>&societyId=<opzionale>
router.get("/_diag/chat", requireAuth, async (req, res) => {
  const ctx = _gate(req, res); if (!ctx) return;
  const { societyId, userId } = ctx;
  const senderUserId = Number(req.query.senderUserId) || userId;
  const explicitChatId = String(req.query.chatId || "").trim();

  try {
    const stateKey = societyKeyFor(societyId);

    // -------- (1) Dump del mittente simulato --------
    // SELECT della riga utente per senderUserId nella società. Espone leva GREZZA
    // (stringa esatta dal DB) + interpretazione (null/'Tutte'/plain/JSON array/...),
    // più push readiness (subscription presente, opt-out notify_chat).
    let senderInfo: any = null;
    {
      const [sRows] = (await pool.execute(
        `SELECT id, nome, cognome, email, ruolo, leva, stato
           FROM users WHERE id = ? AND society_id = ? LIMIT 1`,
        [senderUserId, societyId]
      )) as [any[], any];
      const row = (sRows as any[])[0] || null;
      if (!row) {
        senderInfo = { found: false, senderUserId, societyId, note: "Sender non trovato in users per questa società. Probabilmente l'id non appartiene alla società del JWT, o l'utente è stato eliminato." };
      } else {
        const raw = row.leva;
        let leva_interpreted: any;
        if (raw === null || raw === undefined) {
          leva_interpreted = { type: "null", value: null, note: "leva NULL → coperto da _levaMatchClause come 'no leva = match qualunque target'" };
        } else if (typeof raw !== "string") {
          leva_interpreted = { type: typeof raw, value: raw, note: "tipo inatteso per VARCHAR (driver mysql2 dovrebbe restituire stringa)" };
        } else if (raw === "") {
          leva_interpreted = { type: "empty_string", value: "", note: "leva vuota → coperto da _levaMatchClause" };
        } else if (raw === "Tutte" || raw === "tutte") {
          leva_interpreted = { type: "tutte_keyword", value: raw, note: "alias 'tutte le leve' → coperto da _levaMatchClause" };
        } else {
          // Tentativo di JSON.parse: se è array → multi-leva (formato saveUser FE)
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              leva_interpreted = { type: "json_array", value: parsed, note: "multi-leva JSON-stringify dal FE → coperto da _levaMatchClause via JSON_CONTAINS" };
            } else {
              leva_interpreted = { type: "json_other", value: parsed, note: "JSON valido ma NON array (anomalia rispetto al formato saveUser)" };
            }
          } catch {
            leva_interpreted = { type: "plain_string", value: raw, note: "stringa semplice (es. 'U11' o 'U11 – Pulcini') → coperto da _levaMatchClause con exact + prefix-extracted" };
          }
        }
        // push readiness del sender
        const [subRows] = (await pool.execute(
          "SELECT id, CHAR_LENGTH(subscription) AS sub_size, updated_at FROM push_subscriptions WHERE user_id = ? AND society_key = ?",
          [senderUserId, stateKey]
        )) as [any[], any];
        const hasSubscription = (subRows as any[]).length > 0;
        let optedOutNotifyChat = false;
        try {
          const survives = await filterByPref([senderUserId], "notify_chat");
          optedOutNotifyChat = survives.length === 0;
        } catch (_) { /* tabella opzionale */ }
        senderInfo = {
          found: true,
          id: row.id, nome: row.nome, cognome: row.cognome, email: row.email,
          ruolo: row.ruolo,
          leva_raw: raw,
          leva_interpreted,
          stato: row.stato,
          has_push_subscription: hasSubscription,
          sub_meta: hasSubscription ? { sub_size: subRows[0].sub_size, updated_at: subRows[0].updated_at } : null,
          opted_out_notify_chat: optedOutNotifyChat,
        };
      }
    }

    // -------- (2) Scoperta chat: staff_<lv>, squadra_<lv>, adhoc_<id> --------
    let chatIds: string[];
    let discoveryMeta: any = null;
    if (explicitChatId) {
      chatIds = [explicitChatId];
    } else {
      const d = await _discoverChats(societyId);
      chatIds = [...d.staff, ...d.squadra, ...d.adhoc];
      discoveryMeta = {
        leve_count: d.leve.length,
        leve_source: d.leveSource,
        leve_names: d.leve,
        staff_chat_ids: d.staff,
        squadra_chat_ids: d.squadra,
        adhoc_chat_ids: d.adhoc,
      };
    }

    const perChat: any[] = [];
    for (const chatId of chatIds) {
      const { pattern, leva } = _patternOf(chatId);

      // Resolver di produzione: recipients per IL sender richiesto
      const recipients = await _resolveChatRecipients(societyId, chatId, senderUserId);
      const recipientSet = new Set(recipients.map(Number));

      // Resolver con sentinel -1 = membri totali della chat (indipendente dal sender)
      const members = await _resolveChatRecipients(societyId, chatId, -1);
      const memberSet = new Set(members.map(Number));

      // Shortlist utenti rilevanti (mister/dirigente e affini, o membri adhoc + orfani)
      const shortlist = await _shortlistForChat(societyId, chatId);

      // Arricchimento per ciascun utente
      const users = [];
      for (const u of shortlist) {
        users.push(await _enrichUser(u, societyId, chatId, senderUserId, recipientSet, memberSet));
      }

      // Hint per la chat: focus sul mister (ruolo allenatore o mister)
      const misters = users.filter(u => u.ruolo === "allenatore" || u.ruolo === "mister" || u.ruolo === "mister_admin");
      const dirigenti = users.filter(u => u.ruolo === "dirigente");
      let hint: string;
      if (misters.length === 0) {
        hint = "Nessun utente con ruolo allenatore/mister in società.";
      } else {
        const m = misters[0];
        if (!m.is_member) {
          hint = `Il mister (id=${m.id}, ruolo='${m.ruolo}', leva='${m.leva_stored}') NON è membro della chat → resolver lo esclude. Motivo: ${m.reason}.`;
        } else if (!m.is_recipient) {
          hint = `Il mister è membro ma non è recipient quando il sender è id=${senderUserId} (probabile: lui è il sender, o esclusione SQL).`;
        } else if (!m.has_push_subscription) {
          hint = `Il mister è recipient ma NON ha push_subscription per society_key='${stateKey}'. Device non sottoscritto al deploy attuale.`;
        } else if (m.opted_out_notify_chat) {
          hint = `Il mister è recipient con subscription valida, ma ha opt-out notify_chat=0 in user_notification_preferences.`;
        } else {
          hint = `Lato resolver OK: mister recipient + subscription OK + nessun opt-out. Se il push non arriva, indagare webpush delivery (410/404 statusCode in push-sender logs).`;
        }
      }

      perChat.push({
        chatId,
        pattern,
        leva_target: leva,
        recipients_count: recipients.length,
        recipients_ids: recipients,
        members_count: members.length,
        members_ids: members,
        users,
        misters_ids: misters.map(m => m.id),
        dirigenti_ids: dirigenti.map(d => d.id),
        hint,
      });
    }

    return res.json({
      input: { societyId, senderUserId, chatId: explicitChatId || null },
      society_key: stateKey,
      sender_info: senderInfo,
      discovery: discoveryMeta,
      discovered_chat_count: chatIds.length,
      per_chat: perChat,
    });
  } catch (e: any) {
    logger.error({ err: e?.message, societyId, senderUserId }, "_diag/chat error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

// GET /api/v2/_diag/chat/ui
// Pagina HTML auto-eseguente: appena l'admin loggato la apre, esegue la diagnosi
// e mostra UN VERDETTO in italiano per chat. Bearer letto da localStorage.mv_v2_token.
// La logica diagnostica vive lato server in GET /_diag/chat — qui solo presentazione.
router.get("/_diag/chat/ui", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="it"><head><meta charset="utf-8"><title>Diagnosi notifiche chat</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box}
  body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;margin:0;padding:18px;max-width:920px;margin:0 auto;background:#f8fafc;color:#0f172a;line-height:1.45}
  h1{font-size:1.25rem;margin:0 0 4px}
  .sub{color:#64748b;font-size:.85rem;margin-bottom:18px}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin-bottom:12px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
  .card h2{font-size:1rem;margin:0 0 10px;color:#1e293b;font-weight:700}
  .verdict{padding:10px 12px;border-radius:8px;margin:6px 0;font-size:.95rem;line-height:1.45}
  .verdict.ok{background:#ecfdf5;color:#065f46;border-left:4px solid #10b981}
  .verdict.ko{background:#fef2f2;color:#991b1b;border-left:4px solid #ef4444}
  .verdict.warn{background:#fffbeb;color:#92400e;border-left:4px solid #f59e0b}
  .verdict strong{font-weight:700}
  .tech{font-size:.74rem;color:#64748b;margin-top:6px;font-family:ui-monospace,Menlo,monospace;background:#f1f5f9;padding:6px 8px;border-radius:6px;white-space:pre-wrap;word-break:break-word}
  .status{padding:10px 14px;border-radius:8px;font-size:.9rem;margin-bottom:14px}
  .status.loading{background:#eff6ff;color:#1e40af}
  .status.err{background:#fef2f2;color:#991b1b}
  .empty{color:#64748b;font-size:.85rem;font-style:italic;padding:8px}
  details{margin-top:14px;font-size:.78rem;color:#475569}
  details pre{background:#0f172a;color:#e2e8f0;padding:10px;border-radius:6px;overflow:auto;max-height:50vh;font-size:.7rem;white-space:pre-wrap;word-break:break-word}
  .meta{color:#64748b;font-size:.78rem;margin-bottom:14px}
  .btn{background:#0f172a;color:#fff;border:0;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:.85rem;margin-top:8px}
</style></head><body>
<h1>🔍 Diagnosi notifiche chat</h1>
<div class="sub">Analizza tutte le chat Staff e ad hoc della tua società per scoprire chi non riceve le notifiche.</div>

<div id="status" class="status loading">⏳ Carico la diagnosi…</div>
<div id="meta" class="meta" style="display:none"></div>
<div id="results"></div>

<details><summary>Mostra dati grezzi (JSON)</summary><pre id="raw">—</pre></details>

<script>
// Traduce il "reason" tecnico restituito dall'endpoint in italiano umano.
function reasonHuman(u, chatPattern) {
  if (u.is_recipient || u.is_member) {
    if (!u.has_push_subscription) return "il suo telefono non è iscritto alle notifiche push";
    if (u.opted_out_notify_chat)    return "ha disattivato le notifiche chat nelle impostazioni";
    return null; // tutto OK
  }
  // non e' member
  if (chatPattern === 'adhoc') {
    if (u.adhoc_row_valid === false) return "non risulta tra i membri salvati della chat (id non valido)";
    return "non risulta tra i membri salvati della chat";
  }
  // staff/leva/squadra/torneo
  if (u.stato && u.stato !== 'attivo') return "il suo account non e' attivo (stato='" + u.stato + "')";
  return "il sistema non lo include come destinatario (ruolo/leva non corrispondono al filtro)";
}

function chatTitle(chat) {
  if (chat.pattern === 'staff')          return 'Chat Staff (' + (chat.leva_target || '?') + ')';
  if (chat.pattern === 'leva_famiglie')  return 'Chat Leva Famiglie (' + (chat.leva_target || '?') + ')';
  if (chat.pattern === 'squadra')        return 'Chat Squadra (' + (chat.leva_target || '?') + ')';
  if (chat.pattern === 'torneo')         return 'Chat Torneo';
  if (chat.pattern === 'adhoc')          return 'Chat ad hoc "' + chat.chatId.replace(/^adhoc_/,'') + '"';
  return chat.chatId;
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function fullName(u) {
  const n = (u.nome || '').trim();
  const c = (u.cognome || '').trim();
  return (n || c) ? (n + ' ' + c).trim() : ('utente #' + u.id);
}

function renderSender(j) {
  const si = j.sender_info;
  if (!si) return '';
  if (!si.found) {
    return '<div class="card"><h2>👤 Mittente simulato</h2>'
      + '<div class="verdict ko"><strong>Sender id=' + escapeHtml(si.senderUserId) + ' NON trovato in users per questa societa\\'.</strong> ' + escapeHtml(si.note || '') + '</div></div>';
  }
  const li = si.leva_interpreted || {};
  return '<div class="card"><h2>👤 Mittente simulato: ' + escapeHtml(fullName(si)) + '</h2>'
    + '<div class="tech">'
    + 'id=' + si.id + ' &middot; email=' + escapeHtml(si.email || '-')
    + ' &middot; ruolo=' + escapeHtml(si.ruolo || '-')
    + ' &middot; stato=' + escapeHtml(si.stato || '-')
    + ' &middot; push=' + (si.has_push_subscription ? 'iscritto' : 'mancante')
    + ' &middot; opt_out_chat=' + si.opted_out_notify_chat
    + '</div>'
    + '<div class="verdict ' + (si.has_push_subscription && !si.opted_out_notify_chat ? 'ok' : 'warn') + '">'
    + '<strong>Leva (grezza):</strong> <code>' + escapeHtml(JSON.stringify(si.leva_raw)) + '</code><br>'
    + '<strong>Interpretazione:</strong> <code>' + escapeHtml(li.type || '?') + '</code> &rarr; ' + escapeHtml(li.note || '')
    + (Array.isArray(li.value) ? ('<br><strong>Elementi array:</strong> ' + escapeHtml(JSON.stringify(li.value))) : '')
    + '</div></div>';
}

function renderDiscovery(j) {
  const d = j.discovery;
  if (!d) return '';
  const lines = [];
  lines.push('Leve trovate: <strong>' + d.leve_count + '</strong> (fonte: ' + escapeHtml(d.leve_source) + ')');
  if (d.leve_names && d.leve_names.length) lines.push('Nomi: ' + d.leve_names.map(n => '<code>' + escapeHtml(n) + '</code>').join(', '));
  lines.push('Chat Staff costruite: ' + d.staff_chat_ids.length + (d.staff_chat_ids.length ? ' (' + d.staff_chat_ids.map(c => '<code>' + escapeHtml(c) + '</code>').join(', ') + ')' : ''));
  lines.push('Chat Squadra costruite: ' + d.squadra_chat_ids.length + (d.squadra_chat_ids.length ? ' (' + d.squadra_chat_ids.map(c => '<code>' + escapeHtml(c) + '</code>').join(', ') + ')' : ''));
  lines.push('Chat ad hoc trovate: ' + d.adhoc_chat_ids.length);
  return '<div class="card"><h2>🔭 Scoperta chat</h2><div class="tech" style="white-space:normal;line-height:1.6">' + lines.join('<br>') + '</div></div>';
}

function render(j) {
  document.getElementById('raw').textContent = JSON.stringify(j, null, 2);
  const meta = document.getElementById('meta');
  meta.style.display = 'block';
  meta.textContent = 'Societa\\' id: ' + j.input.societyId
    + ' · sender simulato: user id ' + j.input.senderUserId
    + ' · chat analizzate: ' + j.discovered_chat_count;

  const root = document.getElementById('results');
  root.innerHTML = renderSender(j) + renderDiscovery(j);

  if (!j.per_chat || !j.per_chat.length) {
    root.innerHTML += '<div class="empty">Nessuna chat trovata per questa società.</div>';
    return;
  }

  let totMister = 0, totKo = 0;
  j.per_chat.forEach(chat => {
    const card = document.createElement('div');
    card.className = 'card';
    const h = document.createElement('h2');
    h.textContent = chatTitle(chat);
    card.appendChild(h);

    // isMister-like: include mister_admin (super-mister con poteri admin, ma per la chat
    // viene trattato come un mister normale).
    const misters = (chat.users || []).filter(u =>
      u.ruolo === 'allenatore' || u.ruolo === 'mister' || u.ruolo === 'mister_admin'
    );
    if (!misters.length) {
      const e = document.createElement('div');
      e.className = 'empty';
      e.textContent = 'Nessun mister/allenatore tra i candidati a questa chat.';
      card.appendChild(e);
      root.appendChild(card);
      return;
    }

    misters.forEach(m => {
      totMister++;
      const why = reasonHuman(m, chat.pattern);
      const v = document.createElement('div');
      if (why) {
        totKo++;
        v.className = 'verdict ko';
        v.innerHTML = '<strong>Il mister ' + escapeHtml(fullName(m)) + ' NON riceve le notifiche.</strong> Motivo: ' + escapeHtml(why) + '.';
      } else {
        v.className = 'verdict ok';
        v.innerHTML = '<strong>Il mister ' + escapeHtml(fullName(m)) + ' riceve regolarmente le notifiche.</strong> ✅';
      }
      const t = document.createElement('div');
      t.className = 'tech';
      t.textContent = 'id=' + m.id
        + ' · ruolo=' + (m.ruolo || '-')
        + ' · leva=' + JSON.stringify(m.leva_stored)
        + ' · stato=' + (m.stato || '-')
        + ' · membro=' + m.is_member
        + ' · destinatario=' + m.is_recipient
        + ' · push=' + (m.has_push_subscription ? 'iscritto' : 'mancante')
        + ' · opt_out_chat=' + m.opted_out_notify_chat
        + (chat.pattern === 'adhoc' ? ' · adhoc_row_valid=' + m.adhoc_row_valid : '');
      v.appendChild(t);
      card.appendChild(v);
    });

    root.appendChild(card);
  });

  const status = document.getElementById('status');
  if (totKo === 0) {
    status.className = 'status'; status.style.background='#ecfdf5'; status.style.color='#065f46';
    status.textContent = '✅ Diagnosi completata. ' + totMister + ' mister analizzati, tutti ricevono le notifiche.';
  } else {
    status.className = 'status'; status.style.background='#fef2f2'; status.style.color='#991b1b';
    status.textContent = '⚠️ Diagnosi completata. ' + totKo + ' su ' + totMister + ' analisi mostrano un mister che NON riceve.';
  }
}

async function run() {
  const status = document.getElementById('status');
  const tok = localStorage.getItem('mv_v2_token');
  if (!tok) {
    status.className = 'status err';
    status.innerHTML = '⛔ Non sei loggato in MyVivaio su questo dominio (nessun token in localStorage). '
      + 'Apri prima MyVivaio e fai il login, poi torna su questa pagina. '
      + 'Se sei sicuro di essere loggato, segnalalo: useremo l\\'alternativa.';
    return;
  }
  try {
    const r = await fetch('/api/v2/_diag/chat', { headers: { 'Authorization': 'Bearer ' + tok } });
    const t = await r.text();
    if (!r.ok) {
      status.className = 'status err';
      status.innerHTML = '⛔ Endpoint risposta HTTP ' + r.status + '. '
        + (r.status === 401 ? 'Token scaduto o invalido: rifai login a MyVivaio.' :
           r.status === 403 ? 'Devi essere admin o mister_admin per usare questa pagina.' :
           'Errore inatteso. Dettagli: ' + escapeHtml(t.slice(0, 300)));
      return;
    }
    let j; try { j = JSON.parse(t); }
    catch {
      status.className = 'status err';
      status.textContent = '⛔ Risposta non JSON (forse Railway sta servendo un bundle vecchio). Aspetta 1-2 minuti e ricarica.';
      return;
    }
    render(j);
  } catch (e) {
    status.className = 'status err';
    status.textContent = '⛔ Errore di rete: ' + (e && e.message ? e.message : e);
  }
}

// Auto-run all'apertura. Nessun bottone, nessun campo da compilare.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
</script>
</body></html>`);
});

export default router;
