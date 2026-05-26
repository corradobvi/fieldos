import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

function checkAuth(req: any, res: any): boolean {
  const secret = req.headers["x-sa-secret"];
  const saSecret = process.env.SA_SECRET ?? "super123";
  if (secret !== saSecret) { res.status(401).json({ error: "unauthorized" }); return false; }
  return true;
}

// GET /api/v2/superadmin/_diag/societa-debug
// Read-only diagnostico: tutti i campi della società + utenti owner
router.get("/superadmin/_diag/societa-debug", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const [usd] = await pool.execute(
      `SELECT id, nome, citta, piano, billing_mode, subscription_status,
              stripe_customer_id, stripe_subscription_id, demo_scadenza,
              stato, created_at, founding_active
       FROM societies
       WHERE nome LIKE '%Angelo Baiardo%' OR nome LIKE '%USD%'`
    ) as [any[], any];

    const [test] = await pool.execute(
      `SELECT id, nome, citta, piano, billing_mode, subscription_status,
              stripe_customer_id, stripe_subscription_id, demo_scadenza,
              stato, created_at, founding_active
       FROM societies
       WHERE id IN (37, 38, 39, 40, 41, 48, 49)
       ORDER BY id`
    ) as [any[], any];

    // Trova owner per ogni società rilevante
    const socIds = [...usd, ...test].map(s => s.id);
    let owners: any[] = [];
    if (socIds.length) {
      const placeholders = socIds.map(() => '?').join(',');
      const [r] = await pool.execute(
        `SELECT u.id, u.email, u.nome, u.cognome, u.ruolo, u.society_id, u.is_account_owner, u.created_at, u.privacy_accepted_at
         FROM users u WHERE u.society_id IN (${placeholders})
         ORDER BY u.society_id, u.is_account_owner DESC, u.id`,
        socIds
      ) as [any[], any];
      owners = r;
    }

    return res.json({
      usd_angelo_baiardo: usd,
      societies_comparison: test,
      owners,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

export default router;
