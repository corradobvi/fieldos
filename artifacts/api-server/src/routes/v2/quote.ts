import { Router, Request, Response, NextFunction } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";

const router = Router();

const PLAN_TIER: Record<string, number> = {
  mister: 0, gratuito: 0, mister_pro: 1, base: 1, societa: 2, premium: 2,
};

function requirePlan(minPlan: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { societyId } = req.jwtUser!;
      if (!societyId) { res.status(403).json({ error: "plan_upgrade_required", pianoMin: minPlan }); return; }
      const [rows] = await pool.execute("SELECT piano FROM societies WHERE id = ?", [societyId]) as [any[], any];
      if (!rows.length) { res.status(403).json({ error: "society_not_found" }); return; }
      const tier = PLAN_TIER[rows[0].piano] ?? -1;
      if (tier < (PLAN_TIER[minPlan] ?? 99)) {
        res.status(403).json({ error: "plan_upgrade_required", pianoMin: minPlan }); return;
      }
      next();
    } catch (e) { next(e); }
  };
}

// GET /api/v2/quote?leva=U14&stato=in_attesa
router.get("/quote", requireAuth, requireRole("admin", "dirigente"), requirePlan("societa"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { leva, stato } = req.query as Record<string, string>;

  try {
    const [rows] = (await pool.execute(
      `SELECT q.id, q.player_id, q.importo, q.scadenza, q.stato, q.leva, q.stagione, q.nota,
              p.nome, p.cognome
       FROM quote q
       JOIN players p ON p.id = q.player_id
       WHERE q.society_id = ?
         ${leva ? "AND q.leva = ?" : ""}
         ${stato ? "AND q.stato = ?" : ""}
       ORDER BY q.scadenza, p.cognome`,
      [societyId, ...(leva ? [leva] : []), ...(stato ? [stato] : [])]
    )) as [any[], any];
    return res.json(rows);
  } catch (e: any) {
    logger.error({ err: e }, "GET quote error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/quote
router.post("/quote", requireAuth, requireRole("admin", "dirigente"), requirePlan("societa"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { playerId, importo, scadenza, stato, leva, stagione, nota } = req.body as Record<string, any>;
  if (!playerId) return res.status(400).json({ error: "playerId_required" });

  try {
    const [result] = (await pool.execute(
      "INSERT INTO quote (society_id, player_id, importo, scadenza, stato, leva, stagione, nota) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [societyId, playerId, importo ?? null, scadenza ?? null,
       stato ?? "in_attesa", leva ?? null, stagione ?? null, nota ?? null]
    )) as [any, any];
    return res.status(201).json({ id: result.insertId });
  } catch (e: any) {
    logger.error({ err: e }, "POST quota error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/v2/quote/:id
router.put("/quote/:id", requireAuth, requireRole("admin", "dirigente"), requirePlan("societa"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { importo, scadenza, stato, nota } = req.body as Record<string, any>;

  try {
    const [result] = (await pool.execute(
      `UPDATE quote SET
        importo  = COALESCE(?, importo),
        scadenza = COALESCE(?, scadenza),
        stato    = COALESCE(?, stato),
        nota     = COALESCE(?, nota)
       WHERE id = ? AND society_id = ?`,
      [importo ?? null, scadenza ?? null, stato ?? null, nota ?? null,
       req.params.id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/quote/:id
router.delete("/quote/:id", requireAuth, requireRole("admin", "dirigente"), requirePlan("societa"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    await pool.execute("DELETE FROM quote WHERE id = ? AND society_id = ?", [req.params.id, societyId]);
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
