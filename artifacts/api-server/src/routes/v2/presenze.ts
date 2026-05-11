import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";

const router = Router();

// GET /api/v2/presenze?eventId=X
router.get("/presenze", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { eventId } = req.query as { eventId?: string };
  if (!eventId) return res.status(400).json({ error: "eventId_required" });

  try {
    const [rows] = (await pool.execute(
      `SELECT pr.id, pr.player_id, pr.event_id, pr.stato, pr.nota, pr.created_at,
              p.nome, p.cognome, p.numero, p.leva
       FROM presenze pr
       JOIN players p ON p.id = pr.player_id
       JOIN events e ON e.id = pr.event_id AND e.society_id = ?
       WHERE pr.event_id = ?
       ORDER BY p.cognome, p.nome`,
      [societyId, eventId]
    )) as [any[], any];
    return res.json(rows);
  } catch (e: any) {
    logger.error({ err: e }, "GET presenze error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/presenze — upsert singola presenza
router.post("/presenze", requireAuth, requireRole("admin", "allenatore", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { playerId, eventId, stato, nota } = req.body as Record<string, any>;
  if (!playerId || !eventId || !stato) return res.status(400).json({ error: "missing_fields" });

  try {
    // Verify the event belongs to this society
    const [evCheck] = (await pool.execute(
      "SELECT id FROM events WHERE id = ? AND society_id = ?", [eventId, societyId]
    )) as [any[], any];
    if (!evCheck.length) return res.status(403).json({ error: "forbidden" });

    await pool.execute(
      `INSERT INTO presenze (player_id, event_id, stato, nota)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE stato = VALUES(stato), nota = VALUES(nota)`,
      [playerId, eventId, stato, nota ?? null]
    );
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "POST presenza error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/presenze/bulk — salva presenze di un intero evento
router.post("/presenze/bulk", requireAuth, requireRole("admin", "allenatore", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { eventId, presenze } = req.body as { eventId: number; presenze: Array<{ playerId: number; stato: string; nota?: string }> };

  if (!eventId || !Array.isArray(presenze)) return res.status(400).json({ error: "missing_fields" });

  try {
    const [evCheck] = (await pool.execute(
      "SELECT id FROM events WHERE id = ? AND society_id = ?", [eventId, societyId]
    )) as [any[], any];
    if (!evCheck.length) return res.status(403).json({ error: "forbidden" });

    if (!presenze.length) return res.json({ ok: true, updated: 0 });

    const values = presenze.map(p => [p.playerId, eventId, p.stato, p.nota ?? null]);
    const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");
    const flat = values.flat();

    await pool.execute(
      `INSERT INTO presenze (player_id, event_id, stato, nota) VALUES ${placeholders}
       ON DUPLICATE KEY UPDATE stato = VALUES(stato), nota = VALUES(nota)`,
      flat
    );
    return res.json({ ok: true, updated: presenze.length });
  } catch (e: any) {
    logger.error({ err: e }, "POST presenze/bulk error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
