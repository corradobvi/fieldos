import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";

const router = Router();

const WRITE_ROLES = ["admin", "allenatore", "dirigente"];

// GET /api/v2/events?month=5&year=2026&leva=U14
router.get("/events", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { month, year, leva } = req.query as Record<string, string>;

  let whereExtra = "";
  const params: any[] = [societyId];

  if (month && year) {
    whereExtra += " AND MONTH(data_inizio) = ? AND YEAR(data_inizio) = ?";
    params.push(parseInt(month), parseInt(year));
  }
  if (leva) {
    whereExtra += " AND (leva = ? OR leva IS NULL)";
    params.push(leva);
  }

  try {
    const [rows] = (await pool.execute(
      `SELECT id, tipo, titolo, leva, luogo, data_inizio, ora_inizio, data_fine, ora_fine,
              note, ricorrente, freq, giorni, fino_al, created_at
       FROM events WHERE society_id = ?${whereExtra} ORDER BY data_inizio, ora_inizio`,
      params
    )) as [any[], any];
    return res.json(rows);
  } catch (e: any) {
    logger.error({ err: e }, "GET events error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/events/:id
router.get("/events/:id", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [rows] = (await pool.execute(
      "SELECT * FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any[], any];
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/events
router.post("/events", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { tipo, titolo, leva, luogo, dataInizio, oraInizio, dataFine, oraFine,
          note, ricorrente, freq, giorni, finoAl } = req.body as Record<string, any>;

  if (!tipo || !titolo) return res.status(400).json({ error: "tipo_titolo_required" });

  try {
    const [result] = (await pool.execute(
      `INSERT INTO events (society_id, tipo, titolo, leva, luogo, data_inizio, ora_inizio,
                           data_fine, ora_fine, note, ricorrente, freq, giorni, fino_al)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [societyId, tipo, titolo, leva ?? null, luogo ?? null, dataInizio ?? null,
       oraInizio ?? null, dataFine ?? null, oraFine ?? null, note ?? null,
       ricorrente ? 1 : 0, freq ?? null, giorni ?? null, finoAl ?? null]
    )) as [any, any];
    return res.status(201).json({ id: result.insertId });
  } catch (e: any) {
    logger.error({ err: e }, "POST event error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/v2/events/:id
router.put("/events/:id", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { tipo, titolo, leva, luogo, dataInizio, oraInizio, dataFine, oraFine,
          note, ricorrente, freq, giorni, finoAl } = req.body as Record<string, any>;

  try {
    const [result] = (await pool.execute(
      `UPDATE events SET
        tipo        = COALESCE(?, tipo),
        titolo      = COALESCE(?, titolo),
        leva        = COALESCE(?, leva),
        luogo       = COALESCE(?, luogo),
        data_inizio = COALESCE(?, data_inizio),
        ora_inizio  = COALESCE(?, ora_inizio),
        data_fine   = COALESCE(?, data_fine),
        ora_fine    = COALESCE(?, ora_fine),
        note        = COALESCE(?, note),
        ricorrente  = COALESCE(?, ricorrente),
        freq        = COALESCE(?, freq),
        giorni      = COALESCE(?, giorni),
        fino_al     = COALESCE(?, fino_al)
       WHERE id = ? AND society_id = ?`,
      [tipo ?? null, titolo ?? null, leva ?? null, luogo ?? null,
       dataInizio ?? null, oraInizio ?? null, dataFine ?? null, oraFine ?? null,
       note ?? null, ricorrente != null ? (ricorrente ? 1 : 0) : null,
       freq ?? null, giorni ?? null, finoAl ?? null,
       req.params.id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "PUT event error");
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/events/:id
router.delete("/events/:id", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [result] = (await pool.execute(
      "DELETE FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
