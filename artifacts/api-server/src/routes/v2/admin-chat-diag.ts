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

// Scoperta automatica delle chat candidate per una società.
//   - staff_<lv>: una per ciascuna leva nella tabella MySQL `leve`
//   - adhoc_<id>: distinct chat_id da adhoc_chat_members
async function _discoverChats(societyId: number): Promise<{ staff: string[]; adhoc: string[] }> {
  const [leveRows] = (await pool.execute(
    "SELECT nome FROM leve WHERE society_id = ? ORDER BY ordine, nome",
    [societyId]
  )) as [any[], any];
  const staff = (leveRows as any[]).map(r => `staff_${r.nome}`);
  let adhoc: string[] = [];
  try {
    const [adhocRows] = (await pool.execute(
      "SELECT DISTINCT chat_id FROM adhoc_chat_members WHERE society_id = ? ORDER BY chat_id",
      [societyId]
    )) as [any[], any];
    adhoc = (adhocRows as any[]).map(r => String(r.chat_id));
  } catch (_) { /* tabella opzionale */ }
  return { staff, adhoc };
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

    // Lista chat da analizzare
    let chatIds: string[];
    if (explicitChatId) {
      chatIds = [explicitChatId];
    } else {
      const d = await _discoverChats(societyId);
      chatIds = [...d.staff, ...d.adhoc];
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
      const misters = users.filter(u => u.ruolo === "allenatore" || u.ruolo === "mister");
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
      discovered_chat_count: chatIds.length,
      per_chat: perChat,
    });
  } catch (e: any) {
    logger.error({ err: e?.message, societyId, senderUserId }, "_diag/chat error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

// GET /api/v2/_diag/chat/ui
// Pagina HTML wrapper che chiama l'endpoint JSON usando il Bearer dal localStorage.mv_v2_token.
// L'admin loggato apre questa URL dal browser → nessun copia-incolla di token, nessun SA-secret.
router.get("/_diag/chat/ui", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Chat recipient diagnostic</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;padding:16px;max-width:1100px;margin:0 auto;background:#f8fafc;color:#1e293b;}
  h1{font-size:1.1rem;margin:0 0 12px}
  .row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  input,button{padding:6px 10px;font-size:.9rem;border-radius:6px;border:1px solid #cbd5e1}
  button{background:#0f172a;color:#fff;cursor:pointer;border:0}
  pre{background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;overflow:auto;max-height:80vh;font-size:.78rem;white-space:pre-wrap;word-break:break-word}
  .err{background:#fef2f2;color:#991b1b;padding:8px 12px;border-radius:6px;font-size:.85rem}
  .ok{background:#ecfdf5;color:#065f46;padding:8px 12px;border-radius:6px;font-size:.85rem}
</style></head><body>
<h1>🔍 Chat recipient diagnostic (read-only)</h1>
<div class="row">
  <input id="chatId" placeholder="chatId opzionale (es. staff_U11, adhoc_3, o vuoto = scopri tutte)" style="flex:1;min-width:280px">
  <input id="senderUserId" placeholder="senderUserId (default = tuo userId JWT)" style="width:220px">
  <button onclick="run()">Esegui</button>
</div>
<div id="msg"></div>
<pre id="out">// Premi "Esegui" per la diagnosi sulla TUA società.\n// Token letto da localStorage.mv_v2_token (lo stesso che usa l'app).</pre>
<script>
async function run() {
  const out = document.getElementById('out');
  const msg = document.getElementById('msg');
  msg.innerHTML = '';
  const tok = localStorage.getItem('mv_v2_token');
  if (!tok) { msg.innerHTML = '<div class="err">⛔ Nessun mv_v2_token in localStorage. Devi essere loggato in MyVivaio in questa origin.</div>'; return; }
  const chatId = document.getElementById('chatId').value.trim();
  const sender = document.getElementById('senderUserId').value.trim();
  const qs = new URLSearchParams();
  if (chatId) qs.set('chatId', chatId);
  if (sender) qs.set('senderUserId', sender);
  out.textContent = '⏳ Caricamento...';
  try {
    const r = await fetch('/api/v2/_diag/chat' + (qs.toString() ? '?' + qs : ''), {
      headers: { 'Authorization': 'Bearer ' + tok }
    });
    const t = await r.text();
    if (!r.ok) {
      msg.innerHTML = '<div class="err">HTTP ' + r.status + '</div>';
      out.textContent = t;
      return;
    }
    let j; try { j = JSON.parse(t); } catch { out.textContent = t; return; }
    msg.innerHTML = '<div class="ok">OK · societyId=' + j.input.societyId + ' · sender=' + j.input.senderUserId + ' · chat='  + j.discovered_chat_count + '</div>';
    out.textContent = JSON.stringify(j, null, 2);
  } catch (e) {
    msg.innerHTML = '<div class="err">Errore di rete: ' + (e.message || e) + '</div>';
  }
}
</script>
</body></html>`);
});

export default router;
