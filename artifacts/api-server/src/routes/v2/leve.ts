import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";

const router = Router();

const PIANO_NORM_L: Record<string, string> = { gratuito: "mister", base: "mister_pro", premium: "societa" };
const LEVE_LIMITS: Record<string, number> = { mister: 1, mister_pro: 3, societa: Infinity, demo: Infinity };

async function getSocietyLeveLimit(societyId: number): Promise<number> {
  const [rows] = await pool.execute("SELECT piano FROM societies WHERE id = ?", [societyId]) as [any[], any];
  const raw = rows[0]?.piano || "demo";
  const norm = PIANO_NORM_L[raw] || raw;
  return LEVE_LIMITS[norm] ?? 1;
}

const VALID_CATEGORIE = new Set(["junior", "senior"]);

// GET /api/v2/leve
router.get("/leve", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [rows] = (await pool.execute(
      "SELECT id, nome, ordine, categoria FROM leve WHERE society_id = ? ORDER BY ordine, nome",
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
  const { nome, ordine, categoria } = req.body as { nome?: string; ordine?: number; categoria?: string };
  if (!nome?.trim()) return res.status(400).json({ error: "nome_required" });
  if (!categoria || !VALID_CATEGORIE.has(categoria)) {
    return res.status(400).json({ error: "categoria_required", detail: "must be 'junior' or 'senior'" });
  }

  try {
    const maxLeve = await getSocietyLeveLimit(societyId);
    if (isFinite(maxLeve)) {
      const [cnt] = await pool.execute("SELECT COUNT(*) as n FROM leve WHERE society_id = ?", [societyId]) as [any[], any];
      if (cnt[0].n >= maxLeve) {
        return res.status(403).json({ error: "plan_limit_reached", limitType: "leve", current: cnt[0].n, max: maxLeve });
      }
    }

    const [result] = (await pool.execute(
      "INSERT INTO leve (society_id, nome, ordine, categoria) VALUES (?, ?, ?, ?)",
      [societyId, nome.trim(), ordine ?? 0, categoria]
    )) as [any, any];
    return res.status(201).json({ id: result.insertId, nome: nome.trim(), ordine: ordine ?? 0, categoria });
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "leva_exists" });
    logger.error({ err: e }, "POST leva error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/v2/leve/:id
router.put("/leve/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { nome, ordine, categoria } = req.body as { nome?: string; ordine?: number; categoria?: string };
  if (categoria !== undefined && !VALID_CATEGORIE.has(categoria)) {
    return res.status(400).json({ error: "categoria_invalid", detail: "must be 'junior' or 'senior'" });
  }

  try {
    const [result] = (await pool.execute(
      "UPDATE leve SET nome = COALESCE(?, nome), ordine = COALESCE(?, ordine), categoria = COALESCE(?, categoria) WHERE id = ? AND society_id = ?",
      [nome ?? null, ordine ?? null, categoria ?? null, req.params.id, societyId]
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
