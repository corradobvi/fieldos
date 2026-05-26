import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { signJWT, requireAuth } from "../../lib/auth";

const router = Router();

const VALID_PIANI = new Set(["mister", "mister_pro", "societa"]);

// POST /api/v2/societies/select-plan
// Step 2 self-register: l'utente sceglie il piano. Aggiorna societies.piano
// e restituisce un nuovo JWT con societyPiano valorizzato.
// Bypassa il check plan_required di requireAuth (vedi PLAN_BYPASS_SUFFIX in lib/auth.ts).
router.post("/societies/select-plan", requireAuth, async (req, res) => {
  const user = req.jwtUser!;
  const { plan } = (req.body || {}) as { plan?: string };

  if (!plan || !VALID_PIANI.has(plan)) {
    return res.status(400).json({ error: "invalid_plan" });
  }

  try {
    const [r] = (await pool.execute(
      "UPDATE societies SET piano = ? WHERE id = ?",
      [plan, user.societyId]
    )) as [any, any];

    if (!r.affectedRows) {
      return res.status(404).json({ error: "society_not_found" });
    }

    const token = signJWT({
      userId: user.userId,
      societyId: user.societyId,
      role: user.role,
      email: user.email,
      societyPiano: plan,
    });

    logger.info({ userId: user.userId, societyId: user.societyId, plan }, "society plan selected");

    return res.json({
      success: true,
      token,
      society: { id: user.societyId, piano: plan },
    });
  } catch (e: any) {
    logger.error({ err: e }, "select-plan error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
