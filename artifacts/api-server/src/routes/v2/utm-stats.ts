import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

const SA_SECRET = process.env.SA_SECRET ?? "super123";

// GET /api/v2/admin/utm-stats — SuperAdmin only
router.get("/admin/utm-stats", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const toDate   = req.query.to   ? new Date(String(req.query.to))   : new Date();
  const fromDate = req.query.from ? new Date(String(req.query.from))  : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const campaignFilter = req.query.utm_campaign ? String(req.query.utm_campaign) : null;

  // Fallback if dates invalid
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return res.status(400).json({ error: "invalid_date" });
  }

  // Extend toDate to end of day
  toDate.setHours(23, 59, 59, 999);

  try {
    const params: any[] = [fromDate, toDate];
    const campaignClause = campaignFilter ? " AND utm_campaign = ?" : "";
    if (campaignFilter) params.push(campaignFilter);

    const [rows] = await pool.execute(
      `SELECT email, created_at, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid
       FROM users
       WHERE created_at >= ? AND created_at <= ?${campaignClause}
       ORDER BY created_at DESC`,
      params
    ) as [any[], any];

    const total_registrations = rows.length;
    const from_meta = rows.filter((r: any) => r.utm_source != null).length;
    const from_organic = total_registrations - from_meta;

    // Group by campaign
    const campaignMap: Record<string, number> = {};
    for (const r of rows) {
      if (r.utm_campaign) {
        campaignMap[r.utm_campaign] = (campaignMap[r.utm_campaign] || 0) + 1;
      }
    }
    const by_campaign = Object.entries(campaignMap)
      .sort((a, b) => b[1] - a[1])
      .map(([utm_campaign, count]) => ({ utm_campaign, count, conversion_rate: null }));

    // Group by content
    const contentMap: Record<string, number> = {};
    for (const r of rows) {
      if (r.utm_content) {
        contentMap[r.utm_content] = (contentMap[r.utm_content] || 0) + 1;
      }
    }
    const by_content = Object.entries(contentMap)
      .sort((a, b) => b[1] - a[1])
      .map(([utm_content, count]) => ({ utm_content, count }));

    // Last registrations with masked email
    const registrations = rows.slice(0, 50).map((r: any) => ({
      email:        _maskEmail(r.email),
      registered_at: r.created_at,
      utm_source:   r.utm_source   || null,
      utm_medium:   r.utm_medium   || null,
      utm_campaign: r.utm_campaign || null,
      utm_content:  r.utm_content  || null,
    }));

    return res.json({
      total_registrations,
      from_meta,
      from_organic,
      by_campaign,
      by_content,
      registrations,
      period: { from: fromDate.toISOString(), to: toDate.toISOString() },
    });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

function _maskEmail(email: string): string {
  if (!email) return "***";
  const [local, domain] = email.split("@");
  if (!domain) return email[0] + "***";
  return local[0] + "***@" + domain;
}

export default router;
