import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";

const router = Router();

// Admin secret middleware — protected by ADMIN_SECRET env var
function requireAdminSecret(req: any, res: any, next: any) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) { res.status(503).json({ error: "admin_not_configured" }); return; }
  const provided = (req.headers["x-admin-secret"] as string) || req.query.adminSecret;
  if (provided !== secret) { res.status(403).json({ error: "forbidden" }); return; }
  next();
}

// GET /api/v2/demo-wa/status — returns WA contact status for logged-in user
router.get("/demo-wa/status", requireAuth, async (req, res) => {
  const { userId } = (req as any).jwtUser!;
  try {
    const [rows] = await pool.execute(
      "SELECT status FROM demo_whatsapp_contact WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId]
    ) as [any[], any];
    return res.json({ status: rows.length ? rows[0].status : null });
  } catch (e: any) {
    logger.error({ err: e }, "demo-wa status error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/demo-wa/clicked — mark as clicked (idempotent)
router.post("/demo-wa/clicked", requireAuth, async (req, res) => {
  const { userId } = (req as any).jwtUser!;
  try {
    await pool.execute(
      `UPDATE demo_whatsapp_contact SET status='clicked', clicked_at=NOW(), updated_at=NOW()
       WHERE user_id = ? AND status = 'pending'`,
      [userId]
    );
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "demo-wa clicked error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/admin/demo-wa-pending — queue for founder
router.get("/admin/demo-wa-pending", requireAdminSecret, async (req, res) => {
  const filter = req.query.filter as string | undefined;
  let statusClause = "status IN ('pending','clicked')";
  if (filter === "pending") statusClause = "status = 'pending'";
  if (filter === "clicked") statusClause = "status = 'clicked'";
  if (filter === "all") statusClause = "status IN ('pending','clicked','sent_manual')";

  try {
    const [rows] = await pool.execute(
      `SELECT id, user_id, user_email, user_phone, user_first_name, user_last_name,
              demo_plan_key, status, created_at, clicked_at, manual_added_at, notes,
              TIMESTAMPDIFF(MINUTE, created_at, NOW()) AS minutes_ago
       FROM demo_whatsapp_contact
       WHERE ${statusClause}
       ORDER BY created_at DESC LIMIT 200`
    ) as [any[], any];

    const [counts] = await pool.execute(
      `SELECT status, COUNT(*) AS n FROM demo_whatsapp_contact
       WHERE status IN ('pending','clicked','sent_manual') GROUP BY status`
    ) as [any[], any];
    const summary: Record<string, number> = {};
    (counts as any[]).forEach((r: any) => { summary[r.status] = r.n; });

    return res.json({ rows, summary });
  } catch (e: any) {
    logger.error({ err: e }, "demo-wa pending error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/admin/demo-wa/:id/mark-sent
router.post("/admin/demo-wa/:id/mark-sent", requireAdminSecret, async (req, res) => {
  try {
    await pool.execute(
      "UPDATE demo_whatsapp_contact SET status='sent_manual', manual_added_at=NOW(), updated_at=NOW() WHERE id = ?",
      [req.params.id]
    );
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/admin/demo-wa/:id/complete
router.post("/admin/demo-wa/:id/complete", requireAdminSecret, async (req, res) => {
  try {
    await pool.execute(
      "UPDATE demo_whatsapp_contact SET status='completed', updated_at=NOW() WHERE id = ?",
      [req.params.id]
    );
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
