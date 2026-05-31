import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";
import { sendPushToUsers, getUsersForPush, societyKeyFor } from "../../lib/push-sender";

const router = Router();

// GET /api/v2/chat/:chatId/messages?limit=50&before=<id>
router.get("/chat/:chatId/messages", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { chatId } = req.params;
  const { limit = "50", before } = req.query as Record<string, string>;

  try {
    const [rows] = (await pool.execute(
      `SELECT m.id, m.autore_id, m.testo, m.foto_url, m.tipo, m.meta, m.created_at,
              u.nome AS autore_nome, u.cognome AS autore_cognome, u.ruolo AS autore_ruolo
       FROM chat_messages m
       LEFT JOIN users u ON u.id = m.autore_id
       WHERE m.society_id = ? AND m.chat_id = ?
         ${before ? "AND m.id < ?" : ""}
       ORDER BY m.created_at DESC
       LIMIT ?`,
      before
        ? [societyId, chatId, parseInt(before), parseInt(limit)]
        : [societyId, chatId, parseInt(limit)]
    )) as [any[], any];

    // Return in chronological order
    return res.json(rows.reverse());
  } catch (e: any) {
    logger.error({ err: e }, "GET chat messages error");
    return res.status(500).json({ error: "server_error" });
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

// POST /api/v2/chat/:chatId/messages
router.post("/chat/:chatId/messages", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { chatId } = req.params;
  const { testo, fotoUrl } = req.body as { testo?: string; fotoUrl?: string };

  if (!testo?.trim() && !fotoUrl) return res.status(400).json({ error: "testo_or_foto_required" });

  try {
    const [result] = (await pool.execute(
      "INSERT INTO chat_messages (society_id, chat_id, autore_id, testo, foto_url) VALUES (?, ?, ?, ?, ?)",
      [societyId, chatId, userId, testo?.trim() ?? null, fotoUrl ?? null]
    )) as [any, any];

    // Push notification ai partecipanti — fire-and-forget
    // Parsa chatId: "leva_U14" → leva, "allenatori" → staff, altrimenti tutta la società
    const _getChatRecipients = async (): Promise<number[]> => {
      const levaMatch = chatId.match(/^(?:leva|group)_(.+)$/);
      if (levaMatch) {
        return getUsersForPush(societyId, { leva: levaMatch[1], excludeUserId: userId });
      }
      if (chatId === "allenatori") {
        const [rows] = (await pool.execute(
          "SELECT id FROM users WHERE society_id = ? AND stato = 'attivo' AND ruolo IN ('admin','allenatore','dirigente') AND id != ?",
          [societyId, userId]
        )) as [any[], any];
        return rows.map((r: any) => r.id as number);
      }
      return getUsersForPush(societyId, { excludeUserId: userId });
    };

    const _msgPreview = (testo?.trim() || "📷 Foto").slice(0, 80);
    _getChatRecipients()
      .then(ids => sendPushToUsers(ids, societyKeyFor(societyId), {
        title: `💬 ${chatId}`,
        body:  _msgPreview,
        url:   "/chat",
        tag:   `chat_${chatId}`,
      }, "notify_chat"))
      .catch(e => logger.warn({ err: e }, "chat push error"));

    return res.status(201).json({ id: result.insertId });
  } catch (e: any) {
    logger.error({ err: e }, "POST chat message error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
