// Resolver unico destinatari notifiche — STEP 1 (additivo, non cablato).
//
// Una sola funzione canonica decide CHI riceve ogni notifica, per eliminare
// la divergenza dei 4 resolver attuali (getUsersForPush, _resolveChatRecipients,
// getGuardiansForLeva, query inline in presenze.ts).
//
// Questo modulo NON e' ancora collegato a nessun endpoint di produzione.
// Verra' cablato un evento alla volta nei passi successivi. Per ora vive
// accanto agli altri resolver senza sostituirli.
//
// SCOPE: risponde SOLO a "dato l'evento X, chi sono i destinatari".
// NON gestisce QUANDO inviare, fasi, raggruppamenti, dedup di serie ricorrenti
// o tornei: quella e' logica di trigger, fuori da questo modulo.

import { pool } from "@workspace/db";
import { logger } from "./logger";
import { _levaMatchClause } from "./leva-match";
import { _resolveChatRecipients } from "../routes/v2/chat";

export type RecipientEvent =
  | "comunicazione"
  | "chat_messaggio"
  | "partita_fase1"
  | "partita_fase2"
  | "convocazione"
  | "risultato"
  | "torneo_fase1"
  | "torneo_fase2"
  | "allenamento_eliminato"
  | "claim"
  | "sgancio_tutore"
  | "quota"
  | "documento"
  | "avviso_assenza";

export interface RecipientContext {
  societyId: number;
  leva?: string | null;
  playerId?: number | null;
  chatId?: string | null;
  convocatiPlayerIds?: number[] | null;
  directUserIds?: number[] | null;
  senderUserId?: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper interni per SCOPE. La logica vive in UN posto solo.

// Stessa regola eta' usata dal branch leva_ di _resolveChatRecipients
// (chat.ts:372-376). Pattern U<n>: U6-U13 → under14; tutto il resto
// (Juniores, Allievi, Pulcini, Primi Calci, ecc.) → trattato come U14+.
function _isUnder14(leva: string | null | undefined): boolean {
  if (!leva) return false;
  const uMatch = String(leva).match(/^U(\d+)/i);
  return uMatch ? parseInt(uMatch[1], 10) < 14 : false;
}

// admin + mister_admin attivi della società. Wildcard per leva (la loro
// visibilità è cross-leva per design).
async function _societa(societyId: number): Promise<number[]> {
  try {
    const [rows] = (await pool.execute(
      `SELECT id FROM users
        WHERE society_id = ? AND stato = 'attivo'
          AND ruolo IN ('admin','mister_admin')`,
      [societyId]
    )) as [any[], any];
    return (rows as any[]).map(r => Number(r.id));
  } catch (e: any) {
    logger.warn({ err: e?.message, societyId }, "recipient-resolver: societa scope failed");
    return [];
  }
}

// Staff leva-scoped: mister, allenatore, preparatore_portieri, dirigente.
// _levaMatchClause copre exact, prefix-stored, null/Tutte/empty, JSON array.
async function _staffLeva(societyId: number, leva: string): Promise<number[]> {
  if (!leva) return [];
  try {
    const lc = _levaMatchClause(leva);
    const [rows] = (await pool.execute(
      `SELECT id FROM users
        WHERE society_id = ? AND stato = 'attivo'
          AND ruolo IN ('allenatore','mister','preparatore_portieri','dirigente')
          AND ${lc.sql}`,
      [societyId, ...lc.params]
    )) as [any[], any];
    return (rows as any[]).map(r => Number(r.id));
  } catch (e: any) {
    logger.warn({ err: e?.message, societyId, leva }, "recipient-resolver: staffLeva scope failed");
    return [];
  }
}

// Famiglie leva: genitori + nonni della leva via player_guardians (fonte canonica).
// Se leva U14+ aggiunge anche utenti ruolo 'giocatore' della leva (auto-membri
// per chat squadra U14+, coerente con la regola eta delle chat).
//
// FIX bug "30 genitori leva=NULL in risultato U11" (post-diagnosi bdc5c59):
// - PATH 2 (users.leva legacy per ruoli genitore/nonno) RIMOSSO. users.leva
//   per genitori/nonni e' un campo non-canonico (spesso NULL), e
//   _levaMatchClause include "leva IS NULL" come catch-all: il fallback
//   raccoglieva tutti i genitori della societa', non solo i guardian reali
//   della leva. La fonte unica e' ora player_guardians (flusso /claim GDPR
//   moderno) — chi non e' agganciato lì semplicemente non riceve la push,
//   come da semantica del modello.
// - PATH 1 (player_guardians) ora usa _levaMatchClause su p.leva al posto di
//   exact match: "U11" aggancia player "U11 - Pulcini", JSON multi-leva,
//   prefix-stored, ecc. (stesso pattern usato in _staffLeva).
async function _famiglieLeva(societyId: number, leva: string): Promise<number[]> {
  if (!leva) return [];
  const ids = new Set<number>();
  try {
    // PATH UNICO: player_guardians con _levaMatchClause applicato a p.leva.
    //
    // _levaMatchClause genera SQL con "leva" come identificatore non qualificato.
    // Nella nostra query c'e' ambiguita' (sia players.leva sia users.leva sono
    // in scope), quindi sostituisco testualmente "leva" → "p.leva" per puntare
    // alla leva del giocatore. La sostituzione e' sicura: l'helper produce
    // identificatori semplici, niente alias annidati.
    try {
      const lc = _levaMatchClause(leva);
      const sqlOnPLeva = lc.sql.replace(/\bleva\b/g, "p.leva");
      const [rows] = (await pool.execute(
        `SELECT DISTINCT pg.user_id AS id
           FROM player_guardians pg
           JOIN players p ON p.id = pg.player_id
           JOIN users u ON u.id = pg.user_id
          WHERE p.society_id = ? AND u.stato = 'attivo'
            AND u.ruolo IN ('genitore','nonno')
            AND ${sqlOnPLeva}`,
        [societyId, ...lc.params]
      )) as [any[], any];
      for (const r of (rows as any[])) ids.add(Number(r.id));
    } catch (_) { /* player_guardians puo' non esistere (schema legacy) */ }

    // U14+ → aggiungi giocatori della leva (chat squadra U14+ li include).
    if (!_isUnder14(leva)) {
      try {
        const [r3] = (await pool.execute(
          `SELECT DISTINCT u.id
             FROM users u
             JOIN players p ON p.society_id = u.society_id
                            AND p.nome = u.nome AND p.cognome = u.cognome
            WHERE u.society_id = ? AND u.stato = 'attivo'
              AND u.ruolo = 'giocatore' AND p.leva = ?`,
          [societyId, leva]
        )) as [any[], any];
        for (const r of (r3 as any[])) ids.add(Number(r.id));
      } catch (_) { /* schema giocatore opzionale */ }
    }
  } catch (e: any) {
    logger.warn({ err: e?.message, societyId, leva }, "recipient-resolver: famiglieLeva scope failed");
  }
  return Array.from(ids);
}

// Tutori del giocatore: genitori + nonni linkati via player_guardians.
// Se il player e' in leva U14+ aggiunge anche l'eventuale user ruolo 'giocatore'
// matchato per nome+cognome (auto-iscritto dopo onboarding U14+).
async function _tutoriGiocatore(playerId: number): Promise<number[]> {
  if (!playerId) return [];
  const ids = new Set<number>();
  try {
    const [pRows] = (await pool.execute(
      "SELECT nome, cognome, leva, society_id FROM players WHERE id = ? LIMIT 1",
      [playerId]
    )) as [any[], any];
    const player = (pRows as any[])[0];
    if (!player) return [];

    const [gRows] = (await pool.execute(
      `SELECT DISTINCT pg.user_id AS id
         FROM player_guardians pg
         JOIN users u ON u.id = pg.user_id AND u.stato = 'attivo'
                      AND u.ruolo IN ('genitore','nonno')
        WHERE pg.player_id = ?`,
      [playerId]
    )) as [any[], any];
    for (const r of (gRows as any[])) ids.add(Number(r.id));

    if (player.leva && !_isUnder14(player.leva)) {
      try {
        const [pgRows] = (await pool.execute(
          `SELECT id FROM users
            WHERE society_id = ? AND stato = 'attivo' AND ruolo = 'giocatore'
              AND nome = ? AND cognome = ?`,
          [player.society_id, player.nome, player.cognome]
        )) as [any[], any];
        for (const r of (pgRows as any[])) ids.add(Number(r.id));
      } catch (_) { /* opzionale */ }
    }
  } catch (e: any) {
    logger.warn({ err: e?.message, playerId }, "recipient-resolver: tutoriGiocatore scope failed");
  }
  return Array.from(ids);
}

// Membri chat: delega a _resolveChatRecipients esistente (chat.ts:294).
// NON reimplementiamo regole eta/membership: vivono gia' lì come fonte unica.
async function _membriChat(societyId: number, chatId: string, senderUserId: number): Promise<number[]> {
  if (!chatId) return [];
  try {
    const ids = await _resolveChatRecipients(societyId, chatId, senderUserId);
    return (ids || []).map(n => Number(n));
  } catch (e: any) {
    logger.warn({ err: e?.message, societyId, chatId }, "recipient-resolver: membriChat scope failed");
    return [];
  }
}

// Passthrough: ids forniti come destinatari diretti.
function _direttiUsers(directUserIds: number[] | null | undefined): number[] {
  if (!Array.isArray(directUserIds)) return [];
  return directUserIds.map(n => Number(n)).filter(n => Number.isFinite(n) && n > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mappa dichiarativa unica EVENT_AUDIENCE (fonte di verita').
// Per ogni evento → lista di scope da unire. Il resolver itera e fa la UNION.
//
// Nota: convocazione e' un caso particolare — usa convocatiPlayerIds → tutori
// di ciascun player. Sgancio tutore e' direttiUsers + staffLeva del player.

type ScopeName =
  | "societa"
  | "staffLeva"
  | "famiglieLeva"
  | "tutoriConvocati" // tutori di tutti i convocatiPlayerIds
  | "tutoriGiocatore" // tutori del playerId
  | "membriChat"
  | "direttiUsers";

const EVENT_AUDIENCE: Record<RecipientEvent, ScopeName[]> = {
  comunicazione:         ["famiglieLeva", "staffLeva"],
  chat_messaggio:        ["membriChat"],
  partita_fase1:         ["famiglieLeva"],
  partita_fase2:         ["famiglieLeva"],
  convocazione:          ["tutoriConvocati"],
  risultato:             ["famiglieLeva"],
  torneo_fase1:          ["famiglieLeva"],
  torneo_fase2:          ["famiglieLeva"],
  allenamento_eliminato: ["famiglieLeva", "staffLeva"],
  claim:                 ["staffLeva", "societa"],
  sgancio_tutore:        ["direttiUsers", "staffLeva"],
  quota:                 ["tutoriGiocatore", "societa"],
  documento:             ["tutoriGiocatore", "societa"],
  avviso_assenza:        ["staffLeva"],
};

// ─────────────────────────────────────────────────────────────────────────────
// API PUBBLICA

export async function resolveRecipients(
  eventType: string,
  ctx: RecipientContext
): Promise<number[]> {
  const scopes = EVENT_AUDIENCE[eventType as RecipientEvent];
  if (!scopes) {
    logger.warn({ eventType, ctx }, "recipient-resolver: unknown eventType, returning []");
    return [];
  }

  const { societyId, leva, playerId, chatId, convocatiPlayerIds, directUserIds, senderUserId } = ctx;
  const sender = Number(senderUserId) || 0;
  const out = new Set<number>();

  for (const scope of scopes) {
    let ids: number[] = [];
    try {
      switch (scope) {
        case "societa":
          ids = await _societa(societyId);
          break;
        case "staffLeva":
          if (leva) ids = await _staffLeva(societyId, leva);
          break;
        case "famiglieLeva":
          if (leva) ids = await _famiglieLeva(societyId, leva);
          break;
        case "tutoriGiocatore":
          if (playerId) ids = await _tutoriGiocatore(playerId);
          break;
        case "tutoriConvocati":
          if (Array.isArray(convocatiPlayerIds) && convocatiPlayerIds.length) {
            for (const pid of convocatiPlayerIds) {
              const sub = await _tutoriGiocatore(Number(pid));
              for (const id of sub) out.add(id);
            }
          }
          continue; // ids gia' aggiunti dentro il loop
        case "membriChat":
          if (chatId) ids = await _membriChat(societyId, chatId, sender);
          break;
        case "direttiUsers":
          ids = _direttiUsers(directUserIds);
          break;
      }
    } catch (e: any) {
      logger.warn({ err: e?.message, eventType, scope }, "recipient-resolver: scope error");
    }
    for (const id of ids) out.add(id);
  }

  // Sender SEMPRE escluso (anche se finito in qualche scope).
  if (sender > 0) out.delete(sender);

  return Array.from(out);
}
