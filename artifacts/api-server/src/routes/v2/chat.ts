import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";
import { sendPushToUsers, getUsersForPush, societyKeyFor } from "../../lib/push-sender";

const router = Router();

// GET /api/v2/chat/:chatId/messages?limit=50&before=<id>
// Uso pool.query (interpolazione client-side delle ?) invece di pool.execute (server-prepared):
// LIMIT ? con prepared statements ha avuto regressioni in alcune combinazioni mysql2/MySQL → pool.query è più robusto.
router.get("/chat/:chatId/messages", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { chatId } = req.params;
  const { limit = "50", before } = req.query as Record<string, string>;
  const lim = Math.min(Math.max(parseInt(limit) || 50, 1), 500);
  const beforeId = before ? parseInt(before) : null;

  try {
    const sqlBase = `SELECT m.id, m.chat_id, m.autore_id, m.testo, m.foto_url, m.tipo, m.meta, m.created_at,
                            u.nome AS autore_nome, u.cognome AS autore_cognome, u.ruolo AS autore_ruolo
                       FROM chat_messages m
                       LEFT JOIN users u ON u.id = m.autore_id
                      WHERE m.society_id = ? AND m.chat_id = ?`;
    const sql = beforeId != null
      ? `${sqlBase} AND m.id < ? ORDER BY m.created_at DESC, m.id DESC LIMIT ${lim}`
      : `${sqlBase} ORDER BY m.created_at DESC, m.id DESC LIMIT ${lim}`;
    const params = beforeId != null ? [societyId, chatId, beforeId] : [societyId, chatId];
    const [rows] = (await pool.query(sql, params)) as [any[], any];
    // Calcola "mine" server-side: confronta autore_id con userId del JWT (stesso id-space).
    // Il FE NON deve riconciliare gli id (blob locale vs MySQL): usa direttamente questo flag.
    const out = (rows as any[]).map(r => ({
      ...r,
      mine: r.autore_id != null && Number(r.autore_id) === Number(userId),
    }));
    return res.json(out.reverse());
  } catch (e: any) {
    logger.error({ err: e?.message, code: e?.code, errno: e?.errno, chatId, societyId }, "GET chat messages error");
    return res.status(500).json({ error: "server_error", detail: e?.code || "db_error" });
  }
});

// ─── SONDAGGI CHAT (chat_polls + chat_poll_options + chat_poll_votes) ────────
// Permessi:
//   - CREARE: solo admin/dirigenti (gating server-side, oltre al check FE).
//   - VOTARE: tutti i membri della chat (autenticati nella stessa società).
//   - LEGGERE: tutti i membri (autenticati). I conteggi e i nomi dei votanti sono visibili.
// Modello voto: SCELTA MULTIPLA → toggle riga per (option_id, user_id) via UNIQUE constraint.

// Helper: nome leggibile di un utente (stesso pattern di chat: "nome cognome").
function _userDisplay(row: any): string {
  const n = (row.nome || "").trim();
  const c = (row.cognome || "").trim();
  return (n || c) ? `${n} ${c}`.trim() : "Utente";
}

// Carica un poll con opzioni, conteggi, votanti per opzione, creatore, miei voti.
async function _loadPollDetails(societyId: number, pollId: number, viewerId: number) {
  const [polls] = (await pool.execute(
    `SELECT p.id, p.chat_id, p.created_by, p.question, p.created_at,
            u.nome AS creator_nome, u.cognome AS creator_cognome
       FROM chat_polls p
       LEFT JOIN users u ON u.id = p.created_by
      WHERE p.id = ? AND p.society_id = ? LIMIT 1`,
    [pollId, societyId]
  )) as [any[], any];
  if (!polls.length) return null;
  const p = polls[0];
  const [options] = (await pool.execute(
    "SELECT id, text, position FROM chat_poll_options WHERE poll_id = ? ORDER BY position ASC, id ASC",
    [pollId]
  )) as [any[], any];
  const [votes] = (await pool.execute(
    `SELECT v.option_id, v.user_id, u.nome, u.cognome
       FROM chat_poll_votes v
       LEFT JOIN users u ON u.id = v.user_id
      WHERE v.poll_id = ?`,
    [pollId]
  )) as [any[], any];
  const votersByOption: Record<number, { userId: number; name: string }[]> = {};
  const myOptionIds: number[] = [];
  const uniqueVoters = new Set<number>();
  for (const v of votes as any[]) {
    const oid = Number(v.option_id);
    if (!votersByOption[oid]) votersByOption[oid] = [];
    votersByOption[oid].push({ userId: Number(v.user_id), name: _userDisplay(v) });
    uniqueVoters.add(Number(v.user_id));
    if (Number(v.user_id) === viewerId) myOptionIds.push(oid);
  }
  return {
    id: Number(p.id),
    chatId: p.chat_id,
    question: p.question,
    createdAt: p.created_at,
    createdBy: Number(p.created_by),
    createdByName: _userDisplay({ nome: p.creator_nome, cognome: p.creator_cognome }),
    options: (options as any[]).map(o => ({
      id: Number(o.id),
      text: String(o.text),
      position: Number(o.position),
      count: (votersByOption[Number(o.id)] || []).length,
      voters: votersByOption[Number(o.id)] || [],
    })),
    totalVoters: uniqueVoters.size,
    myOptionIds,
  };
}

// GET /api/v2/chat/:chatId/polls — elenca tutti i sondaggi della chat (con voti correnti).
router.get("/chat/:chatId/polls", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { chatId } = req.params;
  try {
    const [ids] = (await pool.execute(
      "SELECT id FROM chat_polls WHERE society_id = ? AND chat_id = ? ORDER BY created_at ASC, id ASC",
      [societyId, chatId]
    )) as [any[], any];
    const polls = [];
    for (const r of ids as any[]) {
      const d = await _loadPollDetails(societyId, Number(r.id), userId);
      if (d) polls.push(d);
    }
    return res.json(polls);
  } catch (e: any) {
    logger.error({ err: e }, "GET chat polls error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/chat/:chatId/polls — crea sondaggio (admin/dirigente).
// Body: { question, options: string[] }   (2 ≤ options ≤ 10)
router.post("/chat/:chatId/polls", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { chatId } = req.params;
  const { question, options } = req.body as { question?: string; options?: unknown };

  // Gating server-side: ruolo admin/dirigente
  const [meRows] = (await pool.execute(
    "SELECT ruolo FROM users WHERE id = ? AND society_id = ? LIMIT 1",
    [userId, societyId]
  )) as [any[], any];
  const ruolo = meRows[0]?.ruolo as string | undefined;
  if (ruolo !== "admin" && ruolo !== "dirigente" && ruolo !== "mister_admin") {
    return res.status(403).json({ error: "forbidden", detail: "Solo admin/dirigenti possono creare sondaggi." });
  }

  const q = typeof question === "string" ? question.trim() : "";
  const opts = Array.isArray(options)
    ? options.map(o => (typeof o === "string" ? o.trim() : "")).filter(o => o.length > 0)
    : [];
  if (!q) return res.status(400).json({ error: "question_required" });
  if (opts.length < 2) return res.status(400).json({ error: "min_2_options" });
  if (opts.length > 10) return res.status(400).json({ error: "max_10_options" });

  try {
    const [pollIns] = (await pool.execute(
      "INSERT INTO chat_polls (society_id, chat_id, created_by, question) VALUES (?, ?, ?, ?)",
      [societyId, chatId, userId, q]
    )) as [any, any];
    const pollId: number = pollIns.insertId;
    for (let i = 0; i < opts.length; i++) {
      await pool.execute(
        "INSERT INTO chat_poll_options (poll_id, text, position) VALUES (?, ?, ?)",
        [pollId, opts[i], i]
      );
    }
    // Audit trail nel flusso messaggi della chat (visibile a chiunque legga /messages).
    // tipo='poll', meta JSON con pollId. Il FE primario merge per ts; il record server è utile
    // per migrazioni future (quando la chat passerà completamente a MySQL).
    try {
      await pool.execute(
        "INSERT INTO chat_messages (society_id, chat_id, autore_id, testo, tipo, meta) VALUES (?, ?, ?, ?, 'poll', ?)",
        [societyId, chatId, userId, q, JSON.stringify({ pollId })]
      );
    } catch (e: any) {
      // tipo/meta colonne potrebbero non esistere ancora (migrazione non eseguita): non bloccare la creazione.
      logger.warn({ err: e?.message?.slice(0, 80) }, "chat_messages tipo/meta insert skipped (migration pending?)");
    }
    const detail = await _loadPollDetails(societyId, pollId, userId);
    return res.status(201).json(detail);
  } catch (e: any) {
    logger.error({ err: e }, "POST chat poll error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/chat/polls/:pollId/vote — toggle voto su un'opzione (multipla scelta).
// Body: { optionId }. Se la riga (option_id, user_id) esiste → DELETE; altrimenti INSERT.
router.post("/chat/polls/:pollId/vote", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const pollId = parseInt(req.params.pollId);
  const { optionId } = req.body as { optionId?: unknown };
  if (!Number.isFinite(pollId) || !Number.isFinite(Number(optionId))) {
    return res.status(400).json({ error: "invalid_args" });
  }
  const oid = Number(optionId);

  try {
    // Verifica appartenenza dell'opzione al poll, e che il poll sia nella stessa society
    const [check] = (await pool.execute(
      `SELECT p.id AS pid, p.chat_id, o.id AS oid
         FROM chat_polls p
         INNER JOIN chat_poll_options o ON o.poll_id = p.id
        WHERE p.id = ? AND o.id = ? AND p.society_id = ? LIMIT 1`,
      [pollId, oid, societyId]
    )) as [any[], any];
    if (!check.length) return res.status(404).json({ error: "poll_or_option_not_found" });

    // Toggle: se esiste la riga (option_id, user_id) la cancelliamo, altrimenti la inseriamo.
    const [existing] = (await pool.execute(
      "SELECT id FROM chat_poll_votes WHERE option_id = ? AND user_id = ? LIMIT 1",
      [oid, userId]
    )) as [any[], any];
    if (existing.length) {
      await pool.execute("DELETE FROM chat_poll_votes WHERE id = ?", [existing[0].id]);
    } else {
      await pool.execute(
        "INSERT INTO chat_poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)",
        [pollId, oid, userId]
      );
    }
    const detail = await _loadPollDetails(societyId, pollId, userId);
    return res.json(detail);
  } catch (e: any) {
    logger.error({ err: e }, "POST chat poll vote error");
    return res.status(500).json({ error: "server_error" });
  }
});

// ─── RECIPIENT RESOLVER ALLINEATO AL FE (getChatsForUser) ─────────────────────
// chatId → array userIds da notificare via web push. Esclude sempre il mittente.
// Allineato alle regole in artifacts/fieldos/index.html getChatsForUser(...).
async function _resolveChatRecipients(
  societyId: number, chatId: string, senderUserId: number
): Promise<number[]> {
  try {
    // 1) Staff PER-LEVA chat: 'staff_<X>' → admin/mister_admin (TUTTE le leve di società)
    //    UNION allenatore/dirigente/preparatore_portieri della leva (matching leva o Tutte/null).
    //    Allineato 1:1 al FE getChatsForUser dopo la migrazione staff-per-leva.
    //    La vecchia 'allenatori' globale NON è più valida: messaggi storici restano orfani in DB.
    const staffMatch = chatId.match(/^staff_(.+)$/);
    if (staffMatch) {
      const leva = staffMatch[1];
      // Multi-leva: il FE persiste l'array come JSON.stringify (es. '["U11","U12"]')
      // nella colonna VARCHAR users.leva. Aggiungo JSON_CONTAINS guardato da JSON_VALID
      // per includere anche questi utenti — additivo, non rompe i match già funzionanti.
      const [rows] = (await pool.execute(
        `SELECT DISTINCT id FROM users
          WHERE society_id = ? AND stato = 'attivo'
            AND id != ?
            AND (
              ruolo IN ('admin','mister_admin')
              OR (
                ruolo IN ('allenatore','dirigente','preparatore_portieri')
                AND (
                  leva = ? OR leva IS NULL OR leva = '' OR leva = 'Tutte' OR leva = 'tutte'
                  OR (JSON_VALID(leva) AND JSON_CONTAINS(leva, JSON_QUOTE(?)))
                )
              )
            )`,
        [societyId, senderUserId, leva, leva]
      )) as [any[], any];
      return rows.map((r: any) => Number(r.id));
    }

    // 2) Leva Famiglie chat: 'leva_<X>' → dirigenti della leva (o senza leva/Tutte)
    //    + genitori/nonni di giocatori della leva (via player_guardians).
    //    NO mister/admin (matches FE: solo dirigente+genitore/nonno).
    const levaMatch = chatId.match(/^(?:leva|group)_(.+)$/);
    if (levaMatch) {
      const leva = levaMatch[1];
      // Multi-leva: vedi nota su staff_<lv>. Stesso pattern additivo qui per dirigente.
      const [dirRows] = (await pool.execute(
        `SELECT id FROM users
          WHERE society_id = ? AND stato = 'attivo' AND ruolo = 'dirigente'
            AND (
              leva = ? OR leva IS NULL OR leva = '' OR leva = 'Tutte' OR leva = 'tutte'
              OR (JSON_VALID(leva) AND JSON_CONTAINS(leva, JSON_QUOTE(?)))
            )
            AND id != ?`,
        [societyId, leva, leva, senderUserId]
      )) as [any[], any];
      let famRows: any[] = [];
      try {
        const [r] = (await pool.execute(
          `SELECT DISTINCT u.id
             FROM player_guardians pg
             JOIN players p ON p.id = pg.player_id AND p.society_id = ? AND p.leva = ?
             JOIN users u   ON u.id = pg.user_id   AND u.society_id = ? AND u.stato = 'attivo'
                          AND u.ruolo IN ('genitore','nonno')
            WHERE pg.user_id != ?`,
          [societyId, leva, societyId, senderUserId]
        )) as [any[], any];
        famRows = r;
      } catch (e: any) {
        logger.warn({ err: e?.message }, "chat-push leva: player_guardians lookup failed");
      }
      const ids = new Set<number>();
      dirRows.forEach((r: any) => ids.add(Number(r.id)));
      famRows.forEach((r: any) => ids.add(Number(r.id)));
      return Array.from(ids);
    }

    // 3) Squadra chat (U14+): 'squadra_<X>' → allenatori/preparatori della leva + giocatori della leva
    //    (giocatori = users.ruolo='giocatore' matchati per nome+cognome al player in leva X).
    const squadraMatch = chatId.match(/^squadra_(.+)$/);
    if (squadraMatch) {
      const leva = squadraMatch[1];
      // Multi-leva: vedi nota su staff_<lv>. Stesso pattern additivo per allenatore/preparatore.
      const [staffRows] = (await pool.execute(
        `SELECT id FROM users
          WHERE society_id = ? AND stato = 'attivo'
            AND ruolo IN ('allenatore','preparatore_portieri')
            AND (
              leva = ? OR leva IS NULL OR leva = '' OR leva = 'Tutte' OR leva = 'tutte'
              OR (JSON_VALID(leva) AND JSON_CONTAINS(leva, JSON_QUOTE(?)))
            )
            AND id != ?`,
        [societyId, leva, leva, senderUserId]
      )) as [any[], any];
      const [giocRows] = (await pool.execute(
        `SELECT DISTINCT u.id
           FROM users u
           JOIN players p ON p.society_id = u.society_id AND p.nome = u.nome AND p.cognome = u.cognome
          WHERE u.society_id = ? AND u.stato = 'attivo' AND u.ruolo = 'giocatore'
            AND p.leva = ? AND u.id != ?`,
        [societyId, leva, senderUserId]
      )) as [any[], any];
      const ids = new Set<number>();
      staffRows.forEach((r: any) => ids.add(Number(r.id)));
      giocRows.forEach((r: any) => ids.add(Number(r.id)));
      return Array.from(ids);
    }

    // 4) Torneo chat: 'torneo_<id>' → dirigenti della leva + genitori/giocatori dei convocati.
    const torneoMatch = chatId.match(/^torneo_(.+)$/);
    if (torneoMatch) {
      const torneoId = torneoMatch[1];
      try {
        const [tRows] = (await pool.execute(
          "SELECT leva, convocati FROM tornei WHERE id = ? AND societa_id = ? LIMIT 1",
          [torneoId, societyId]
        )) as [any[], any];
        if (!tRows.length) {
          logger.warn({ chatId, torneoId, societyId }, "chat-push torneo: torneo non trovato — skip");
          return [];
        }
        const leva = tRows[0].leva as string | null;
        let convocatiIds: number[] = [];
        try {
          const raw = tRows[0].convocati;
          const parsed = typeof raw === "string" ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
          convocatiIds = (Array.isArray(parsed) ? parsed : [])
            .map((x: any) => Number(x))
            .filter((n: number) => Number.isFinite(n));
        } catch { convocatiIds = []; }

        const ids = new Set<number>();

        // Dirigenti della leva (o Tutte). Multi-leva: vedi nota su staff_<lv>.
        if (leva) {
          const [dRows] = (await pool.execute(
            `SELECT id FROM users
              WHERE society_id = ? AND stato = 'attivo' AND ruolo = 'dirigente'
                AND (
                  leva = ? OR leva IS NULL OR leva = '' OR leva = 'Tutte' OR leva = 'tutte'
                  OR (JSON_VALID(leva) AND JSON_CONTAINS(leva, JSON_QUOTE(?)))
                )
                AND id != ?`,
            [societyId, leva, leva, senderUserId]
          )) as [any[], any];
          dRows.forEach((r: any) => ids.add(Number(r.id)));
        }

        if (convocatiIds.length) {
          const placeholders = convocatiIds.map(() => "?").join(",");
          // Genitori/nonni dei convocati via player_guardians
          try {
            const [gRows] = (await pool.execute(
              `SELECT DISTINCT u.id
                 FROM player_guardians pg
                 JOIN users u ON u.id = pg.user_id AND u.society_id = ? AND u.stato = 'attivo'
                            AND u.ruolo IN ('genitore','nonno')
                WHERE pg.player_id IN (${placeholders}) AND pg.user_id != ?`,
              [societyId, ...convocatiIds, senderUserId]
            )) as [any[], any];
            gRows.forEach((r: any) => ids.add(Number(r.id)));
          } catch (e: any) {
            logger.warn({ err: e?.message }, "chat-push torneo: player_guardians lookup failed");
          }
          // Giocatori convocati (user matchato per nome+cognome al player.id ∈ convocati)
          try {
            const [pRows] = (await pool.execute(
              `SELECT DISTINCT u.id
                 FROM users u
                 JOIN players p ON p.society_id = u.society_id AND p.nome = u.nome AND p.cognome = u.cognome
                WHERE u.society_id = ? AND u.stato = 'attivo' AND u.ruolo = 'giocatore'
                  AND p.id IN (${placeholders}) AND u.id != ?`,
              [societyId, ...convocatiIds, senderUserId]
            )) as [any[], any];
            pRows.forEach((r: any) => ids.add(Number(r.id)));
          } catch (e: any) {
            logger.warn({ err: e?.message }, "chat-push torneo: giocatori convocati lookup failed");
          }
        }
        return Array.from(ids);
      } catch (e: any) {
        logger.warn({ err: e?.message, chatId }, "chat-push torneo: resolver failed");
        return [];
      }
    }

    // 5) Adhoc chat: membri persistiti in adhoc_chat_members (PUT /chat/adhoc/:chatId/members).
    //    NIENTE PIÙ fallback "tutta la società": se nessun membro in DB → ZERO push + log warn.
    //    Meglio zero notifiche che spam alla società intera (privacy).
    if (chatId.startsWith("adhoc_")) {
      const [rows] = (await pool.execute(
        `SELECT m.user_id
           FROM adhoc_chat_members m
           JOIN users u ON u.id = m.user_id AND u.society_id = ? AND u.stato = 'attivo'
          WHERE m.society_id = ? AND m.chat_id = ? AND m.user_id != ?`,
        [societyId, societyId, chatId, senderUserId]
      )) as [any[], any];
      if (!rows.length) {
        logger.warn({ chatId, societyId }, "chat-push adhoc: nessun membro in DB → ZERO push (no spam all-society fallback)");
      }
      return rows.map((r: any) => Number(r.user_id));
    }

    // 6) Sconosciuto → skip per non spammare
    logger.warn({ chatId }, "chat-push: chatId pattern sconosciuto — skip");
    return [];
  } catch (e: any) {
    logger.error({ err: e?.message, chatId, societyId }, "chat-push: resolver fatal error");
    return [];
  }
}

// Titolo leggibile della chat per la push (riusa il chatName inviato dal FE se presente,
// altrimenti deriva dal chatId).
function _chatPushTitle(chatId: string, chatNameHint?: string | null): string {
  if (chatNameHint && typeof chatNameHint === "string" && chatNameHint.trim()) {
    return `💬 ${chatNameHint.trim()}`;
  }
  const stm = chatId.match(/^staff_(.+)$/);
  if (stm) return `🏢 Staff ${stm[1]}`;
  if (chatId === "allenatori") return "💬 Staff"; // legacy fallback (chat globale non più listata)
  const lm = chatId.match(/^(?:leva|group)_(.+)$/);
  if (lm) return `💬 Leva ${lm[1]}`;
  const sm = chatId.match(/^squadra_(.+)$/);
  if (sm) return `💬 Squadra ${sm[1]}`;
  const tm = chatId.match(/^torneo_(.+)$/);
  if (tm) return `🏆 Torneo`;
  if (chatId.startsWith("adhoc_")) return "💬 Chat";
  return "💬 Chat";
}

// POST /api/v2/chat/:chatId/messages
router.post("/chat/:chatId/messages", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { chatId } = req.params;
  const { testo, fotoUrl, chatName } = req.body as { testo?: string; fotoUrl?: string; chatName?: string };

  if (!testo?.trim() && !fotoUrl) return res.status(400).json({ error: "testo_or_foto_required" });

  let insertedId: number | null = null;
  let createdAtIso: string | null = null;
  try {
    const [result] = (await pool.execute(
      "INSERT INTO chat_messages (society_id, chat_id, autore_id, testo, foto_url) VALUES (?, ?, ?, ?, ?)",
      [societyId, chatId, userId, testo?.trim() ?? null, fotoUrl ?? null]
    )) as [any, any];
    insertedId = result.insertId;
    try {
      const [rows] = (await pool.query(
        "SELECT created_at FROM chat_messages WHERE id = ? LIMIT 1",
        [insertedId]
      )) as [any[], any];
      const ca = rows[0]?.created_at;
      createdAtIso = ca instanceof Date ? ca.toISOString() : (typeof ca === "string" ? ca : new Date().toISOString());
    } catch {
      createdAtIso = new Date().toISOString();
    }

    // Push: UN SOLO path, server-side. Recipient resolver allineato al FE (vedi sopra).
    // Fire-and-forget per non rallentare la response.
    (async () => {
      try {
        const recipients = await _resolveChatRecipients(societyId, chatId, userId);
        // Sender display name per body più chiaro ("Mario Rossi: testo")
        let senderName = "";
        try {
          const [sRows] = (await pool.query(
            "SELECT nome, cognome FROM users WHERE id = ? LIMIT 1",
            [userId]
          )) as [any[], any];
          if (sRows[0]) {
            senderName = `${(sRows[0].nome || "").trim()} ${(sRows[0].cognome || "").trim()}`.trim();
          }
        } catch { /* best-effort */ }
        const msgPreview = (testo?.trim() || "📷 Foto").slice(0, 80);
        const body = senderName ? `${senderName}: ${msgPreview}` : msgPreview;
        const payload = {
          title: _chatPushTitle(chatId, chatName),
          body,
          url:   "/#chat",
          tag:   `chat_${chatId}`,
        };
        logger.info({ chatId, recipientCount: recipients.length, sender: userId }, "chat-push: recipients resolved");
        if (!recipients.length) return;
        const result = await sendPushToUsers(recipients, societyKeyFor(societyId), payload, "notify_chat");
        logger.info({
          chatId,
          requested: recipients.length,
          sent: result.sent,
          errors: result.errors,
          sender: userId
        }, "chat-push: dispatched");
      } catch (e: any) {
        logger.warn({ err: e?.message, chatId }, "chat-push: dispatch failed");
      }
    })();

    // Risposta sincrona col messaggio per riconciliazione FE.
    // mine:true perché il POST inserisce sempre il messaggio del mittente autenticato.
    return res.status(201).json({
      id: insertedId,
      chat_id: chatId,
      autore_id: userId,
      testo: testo?.trim() ?? null,
      foto_url: fotoUrl ?? null,
      tipo: null,
      meta: null,
      created_at: createdAtIso,
      mine: true,
    });
  } catch (e: any) {
    logger.error({ err: e?.message, code: e?.code, errno: e?.errno, chatId, societyId, userId }, "POST chat message error");
    return res.status(500).json({ error: "server_error", detail: e?.code || "db_error" });
  }
});

// POST /api/v2/chat/:chatId/read
// Marca la chat come letta per l'utente autenticato fino all'ultimo messaggio attuale.
// Idempotente: UPSERT con GREATEST per evitare regressioni in caso di race condition.
router.post("/chat/:chatId/read", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { chatId } = req.params;
  try {
    const [mx] = (await pool.query(
      "SELECT COALESCE(MAX(id), 0) AS max_id FROM chat_messages WHERE society_id = ? AND chat_id = ?",
      [societyId, chatId]
    )) as [any[], any];
    const maxId = Number(mx[0]?.max_id || 0);
    await pool.query(
      `INSERT INTO chat_reads (user_id, society_id, chat_id, last_read_message_id)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE last_read_message_id = GREATEST(last_read_message_id, VALUES(last_read_message_id))`,
      [userId, societyId, chatId, maxId]
    );
    return res.json({ ok: true, last_read_message_id: maxId });
  } catch (e: any) {
    logger.error({ err: e?.message, code: e?.code, chatId, societyId, userId }, "POST chat read error");
    return res.status(500).json({ error: "server_error", detail: e?.code || "db_error" });
  }
});

// POST /api/v2/chat/unread
// Body: { chatIds: string[] } — lista di chat di interesse del FE (da getChatsForUser).
// Risposta: { [chatId]: count } per ciascuna chat richiesta.
// Conteggio: chat_messages.id > chat_reads.last_read_message_id (0 se mai letto) AND autore_id != userId.
router.post("/chat/unread", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const body = req.body as { chatIds?: unknown };
  const raw = Array.isArray(body?.chatIds) ? body!.chatIds! : [];
  // Sanifica + dedupe + limita
  const seen = new Set<string>();
  const chatIds: string[] = [];
  for (const v of raw) {
    if (typeof v === "string" && v.length > 0 && v.length <= 100 && !seen.has(v)) {
      seen.add(v);
      chatIds.push(v);
      if (chatIds.length >= 200) break;
    }
  }
  // Risposta arricchita: counts (non-letti) + archived (chat attualmente archiviate).
  // Backward-compat: il vecchio shape era `{ [chatId]: count }`. Per evitare regressioni client,
  // mantengo entrambe le rappresentazioni: il body include `counts` E i campi piatti per ciascun chatId.
  const counts: Record<string, number> = {};
  for (const id of chatIds) counts[id] = 0;
  const archived: string[] = [];
  if (!chatIds.length) return res.json({ counts, archived, ...counts });
  try {
    const placeholders = chatIds.map(() => "?").join(",");
    const [unreadRows] = (await pool.query(
      `SELECT m.chat_id, COUNT(*) AS unread
         FROM chat_messages m
         LEFT JOIN chat_reads r
                ON r.user_id = ? AND r.society_id = m.society_id AND r.chat_id = m.chat_id
        WHERE m.society_id = ?
          AND m.chat_id IN (${placeholders})
          AND m.autore_id <> ?
          AND m.id > COALESCE(r.last_read_message_id, 0)
        GROUP BY m.chat_id`,
      [userId, societyId, ...chatIds, userId]
    )) as [any[], any];
    for (const r of (unreadRows as any[])) {
      counts[String(r.chat_id)] = Number(r.unread || 0);
    }
    // Archiviate: record presente E nessun messaggio più nuovo di archived_at_message_id.
    // Se arriva un nuovo messaggio dopo l'archiviazione → max_id > archived_at → la chat NON
    // è più archiviata (auto-unarchive: torna in lista principale).
    const [archRows] = (await pool.query(
      `SELECT a.chat_id
         FROM chat_archives a
         LEFT JOIN (
           SELECT chat_id, MAX(id) AS max_id
             FROM chat_messages
            WHERE society_id = ? AND chat_id IN (${placeholders})
            GROUP BY chat_id
         ) m ON m.chat_id = a.chat_id
        WHERE a.user_id = ? AND a.society_id = ?
          AND a.chat_id IN (${placeholders})
          AND COALESCE(m.max_id, 0) <= a.archived_at_message_id`,
      [societyId, ...chatIds, userId, societyId, ...chatIds]
    )) as [any[], any];
    for (const r of (archRows as any[])) {
      archived.push(String(r.chat_id));
    }
    return res.json({ counts, archived, ...counts });
  } catch (e: any) {
    logger.error({ err: e?.message, code: e?.code, societyId, userId, n: chatIds.length }, "POST chat unread error");
    return res.status(500).json({ error: "server_error", detail: e?.code || "db_error" });
  }
});

// POST /api/v2/chat/:chatId/archive — archivia per-utente.
// Record con archived_at_message_id = MAX(id) corrente. Idempotente (REPLACE).
router.post("/chat/:chatId/archive", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { chatId } = req.params;
  try {
    const [mx] = (await pool.query(
      "SELECT COALESCE(MAX(id), 0) AS max_id FROM chat_messages WHERE society_id = ? AND chat_id = ?",
      [societyId, chatId]
    )) as [any[], any];
    const maxId = Number(mx[0]?.max_id || 0);
    await pool.query(
      `INSERT INTO chat_archives (user_id, society_id, chat_id, archived_at_message_id)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE archived_at_message_id = VALUES(archived_at_message_id), archived_at = CURRENT_TIMESTAMP`,
      [userId, societyId, chatId, maxId]
    );
    return res.json({ ok: true, archived_at_message_id: maxId });
  } catch (e: any) {
    logger.error({ err: e?.message, code: e?.code, chatId, societyId, userId }, "POST chat archive error");
    return res.status(500).json({ error: "server_error", detail: e?.code || "db_error" });
  }
});

// POST /api/v2/chat/:chatId/unarchive — rimuove l'archiviazione manuale.
router.post("/chat/:chatId/unarchive", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { chatId } = req.params;
  try {
    await pool.query(
      "DELETE FROM chat_archives WHERE user_id = ? AND society_id = ? AND chat_id = ?",
      [userId, societyId, chatId]
    );
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e?.message, code: e?.code, chatId, societyId, userId }, "POST chat unarchive error");
    return res.status(500).json({ error: "server_error", detail: e?.code || "db_error" });
  }
});

// PUT /api/v2/chat/adhoc/:chatId/members
// Sostituisce il set membri della chat ad-hoc (idempotente, "replace all").
// Body: { memberIds: number[] }.
// Auth: il chiamante DEVE essere nella nuova lista membri (gating contro modifiche random
// da utenti terzi). Per chat appena create il creatore include sé stesso → check pass.
router.put("/chat/adhoc/:chatId/members", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { chatId } = req.params;
  if (!chatId.startsWith("adhoc_")) {
    return res.status(400).json({ error: "invalid_chat_id", detail: "must start with adhoc_" });
  }
  const body = req.body as { memberIds?: unknown };
  const raw = Array.isArray(body?.memberIds) ? body!.memberIds! : [];
  // Sanifica: solo numeri positivi, dedupe, cap.
  const seen = new Set<number>();
  const memberIds: number[] = [];
  for (const v of raw) {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isInteger(n) && n > 0 && !seen.has(n)) {
      seen.add(n);
      memberIds.push(n);
      if (memberIds.length >= 500) break;
    }
  }
  if (!memberIds.includes(userId)) {
    return res.status(403).json({ error: "forbidden", detail: "caller must be in memberIds" });
  }
  try {
    // Verifica che tutti gli id siano utenti della stessa società (anti-cross-society leak).
    const placeholders = memberIds.map(() => "?").join(",");
    const [validRows] = (await pool.query(
      `SELECT id FROM users WHERE society_id = ? AND id IN (${placeholders})`,
      [societyId, ...memberIds]
    )) as [any[], any];
    const validIds: number[] = (validRows as any[]).map(r => Number(r.id));
    if (!validIds.length) {
      return res.status(400).json({ error: "no_valid_members" });
    }
    // Replace set: DELETE poi INSERT. Idempotente.
    await pool.query(
      "DELETE FROM adhoc_chat_members WHERE society_id = ? AND chat_id = ?",
      [societyId, chatId]
    );
    const values = validIds.map(() => "(?, ?, ?)").join(",");
    const params: any[] = [];
    for (const id of validIds) { params.push(societyId, chatId, id); }
    await pool.query(
      `INSERT INTO adhoc_chat_members (society_id, chat_id, user_id) VALUES ${values}`,
      params
    );
    logger.info({ chatId, societyId, members: validIds.length, caller: userId }, "adhoc members updated");
    return res.json({ ok: true, members: validIds });
  } catch (e: any) {
    logger.error({ err: e?.message, code: e?.code, chatId, societyId, userId }, "PUT adhoc members error");
    return res.status(500).json({ error: "server_error", detail: e?.code || "db_error" });
  }
});

export default router;
