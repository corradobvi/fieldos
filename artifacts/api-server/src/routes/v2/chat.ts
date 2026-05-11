import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";

const router = Router();

// GET /api/v2/chat/:chatId/messages?limit=50&before=<id>
router.get("/chat/:chatId/messages", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { chatId } = req.params;
  const { limit = "50", before } = req.query as Record<string, string>;

  try {
    const [rows] = (await pool.execute(
      `SELECT m.id, m.autore_id, m.testo, m.foto_url, m.created_at,
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
    return res.status(201).json({ id: result.insertId });
  } catch (e: any) {
    logger.error({ err: e }, "POST chat message error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
