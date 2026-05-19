import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { sendPushToUsers, getUsersForPush, societyKeyFor } from "../../lib/push-sender";

const router = Router();

// GET /api/v2/comunicazioni?leva=U14&limit=50
router.get("/comunicazioni", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { leva, limit = "50", offset = "0" } = req.query as Record<string, string>;

  try {
    const [rows] = (await pool.execute(
      `SELECT c.id, c.autore_id, c.tipo, c.titolo, c.testo, c.bacheca, c.leva,
              c.urgente, c.created_at,
              u.nome AS autore_nome, u.cognome AS autore_cognome,
              MAX(cr.letto_at) IS NOT NULL AS letto
       FROM comunicazioni c
       LEFT JOIN users u ON u.id = c.autore_id
       LEFT JOIN comunicazioni_reads cr ON cr.comunicazione_id = c.id AND cr.user_id = ?
       WHERE c.society_id = ?
         ${leva ? "AND (c.leva = ? OR c.leva IS NULL)" : ""}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      leva
        ? [userId, societyId, leva, parseInt(limit), parseInt(offset)]
        : [userId, societyId, parseInt(limit), parseInt(offset)]
    )) as [any[], any];
    return res.json(rows);
  } catch (e: any) {
    logger.error({ err: e }, "GET comunicazioni error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/comunicazioni
router.post("/comunicazioni", requireAuth, requireRole("admin", "allenatore", "dirigente"), async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { tipo, titolo, testo, bacheca, leva, urgente } = req.body as Record<string, any>;
  if (!testo) return res.status(400).json({ error: "testo_required" });

  try {
    const [result] = (await pool.execute(
      "INSERT INTO comunicazioni (society_id, autore_id, tipo, titolo, testo, bacheca, leva, urgente) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [societyId, userId, tipo ?? "comunicazione", titolo ?? null, testo,
       bacheca ?? "generale", leva ?? null, urgente ? 1 : 0]
    )) as [any, any];

    // Push notification — fire-and-forget, non blocca la risposta
    const _pushTitle = urgente
      ? `🚨 URGENTE: ${titolo || 'Comunicazione'}`
      : `📢 ${titolo || 'Nuova comunicazione'}`;
    const _pushBody = (titolo ? testo : testo).slice(0, 100);
    getUsersForPush(societyId, { leva: leva ?? null, excludeUserId: userId })
      .then(ids => sendPushToUsers(ids, societyKeyFor(societyId), {
        title: _pushTitle,
        body:  _pushBody,
        url:   "/comunicazioni",
        tag:   "comunicazione",
      }, "notify_comunicazioni"))
      .catch(e => logger.warn({ err: e }, "comunicazione push error"));

    return res.status(201).json({ id: result.insertId });
  } catch (e: any) {
    logger.error({ err: e }, "POST comunicazione error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/comunicazioni/:id/read
router.post("/comunicazioni/:id/read", requireAuth, async (req, res) => {
  const { userId } = req.jwtUser!;
  try {
    await pool.execute(
      "INSERT IGNORE INTO comunicazioni_reads (comunicazione_id, user_id) VALUES (?, ?)",
      [req.params.id, userId]
    );
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/comunicazioni/:id
router.delete("/comunicazioni/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [result] = (await pool.execute(
      "DELETE FROM comunicazioni WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
