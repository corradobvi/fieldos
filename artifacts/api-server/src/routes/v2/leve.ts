import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";

const router = Router();

// GET /api/v2/leve
router.get("/leve", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [rows] = (await pool.execute(
      "SELECT id, nome, ordine FROM leve WHERE society_id = ? ORDER BY ordine, nome",
      [societyId]
    )) as [any[], any];
    return res.json(rows);
  } catch (e: any) {
    logger.error({ err: e }, "GET leve error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/leve
router.post("/leve", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { nome, ordine } = req.body as { nome?: string; ordine?: number };
  if (!nome?.trim()) return res.status(400).json({ error: "nome_required" });

  try {
    const [result] = (await pool.execute(
      "INSERT INTO leve (society_id, nome, ordine) VALUES (?, ?, ?)",
      [societyId, nome.trim(), ordine ?? 0]
    )) as [any, any];
    return res.status(201).json({ id: result.insertId, nome: nome.trim(), ordine: ordine ?? 0 });
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "leva_exists" });
    logger.error({ err: e }, "POST leva error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/v2/leve/:id
router.put("/leve/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { nome, ordine } = req.body as { nome?: string; ordine?: number };

  try {
    const [result] = (await pool.execute(
      "UPDATE leve SET nome = COALESCE(?, nome), ordine = COALESCE(?, ordine) WHERE id = ? AND society_id = ?",
      [nome ?? null, ordine ?? null, req.params.id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "PUT leva error");
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/leve/:id
router.delete("/leve/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [result] = (await pool.execute(
      "DELETE FROM leve WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "DELETE leva error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
