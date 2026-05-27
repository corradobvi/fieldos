import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

function checkAuth(req: any, res: any): boolean {
  const secret = req.headers["x-sa-secret"];
  const saSecret = process.env.SA_SECRET ?? "super123";
  if (secret !== saSecret) { res.status(401).json({ error: "unauthorized" }); return false; }
  return true;
}

// GET /api/v2/superadmin/_diag/cleanup-preview?societyIds=37,38,39
// READ-ONLY: anteprima righe da cancellare per ciascuna società.
router.get("/superadmin/_diag/cleanup-preview", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const ids = String(req.query.societyIds || "")
    .split(",").map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
  if (!ids.length) return res.status(400).json({ error: "societyIds required (csv)" });

  const out: any[] = [];
  for (const sid of ids) {
    const stateKey = `fieldos_state_soc_${sid}`;
    const counts: Record<string, number> = {};
    const errors: Record<string, string> = {};

    const queries: Array<[string, string, any[]]> = [
      ["societies",           "SELECT COUNT(*) AS n FROM societies WHERE id = ?", [sid]],
      ["users",               "SELECT COUNT(*) AS n FROM users WHERE society_id = ?", [sid]],
      ["players",             "SELECT COUNT(*) AS n FROM players WHERE society_id = ?", [sid]],
      ["player_guardians",    "SELECT COUNT(*) AS n FROM player_guardians WHERE player_id IN (SELECT id FROM players WHERE society_id = ?)", [sid]],
      ["user_players",        "SELECT COUNT(*) AS n FROM user_players WHERE player_id IN (SELECT id FROM players WHERE society_id = ?) OR user_id IN (SELECT id FROM users WHERE society_id = ?)", [sid, sid]],
      ["leve",                "SELECT COUNT(*) AS n FROM leve WHERE society_id = ?", [sid]],
      ["events",              "SELECT COUNT(*) AS n FROM events WHERE society_id = ?", [sid]],
      ["event_leve",          "SELECT COUNT(*) AS n FROM event_leve WHERE event_id IN (SELECT id FROM events WHERE society_id = ?)", [sid]],
      ["presenze",            "SELECT COUNT(*) AS n FROM presenze WHERE player_id IN (SELECT id FROM players WHERE society_id = ?)", [sid]],
      ["comunicazioni",       "SELECT COUNT(*) AS n FROM comunicazioni WHERE society_id = ?", [sid]],
      ["comunicazioni_reads", "SELECT COUNT(*) AS n FROM comunicazioni_reads WHERE comunicazione_id IN (SELECT id FROM comunicazioni WHERE society_id = ?)", [sid]],
      ["chat_messages",       "SELECT COUNT(*) AS n FROM chat_messages WHERE society_id = ?", [sid]],
      ["quote",               "SELECT COUNT(*) AS n FROM quote WHERE society_id = ?", [sid]],
      ["notifiche_tbl",       "SELECT COUNT(*) AS n FROM notifiche WHERE society_id = ?", [sid]],
      ["allenamenti",         "SELECT COUNT(*) AS n FROM allenamenti WHERE societa_id = ?", [sid]],
      ["allenamento_sessioni","SELECT COUNT(*) AS n FROM allenamento_sessioni WHERE allenamento_id IN (SELECT id FROM allenamenti WHERE societa_id = ?)", [sid]],
      ["allenamento_note_vocali","SELECT COUNT(*) AS n FROM allenamento_note_vocali WHERE allenamento_id IN (SELECT id FROM allenamenti WHERE societa_id = ?)", [sid]],
      ["sessioni_libreria",   "SELECT COUNT(*) AS n FROM sessioni_libreria WHERE societa_id = ?", [sid]],
      ["ai_budget_utilizzo",  "SELECT COUNT(*) AS n FROM ai_budget_utilizzo WHERE societa_id = ?", [sid]],
      ["ai_richieste_log",    "SELECT COUNT(*) AS n FROM ai_richieste_log WHERE societa_id = ?", [sid]],
      ["ai_societa_allowlist","SELECT COUNT(*) AS n FROM ai_societa_allowlist WHERE societa_id = ?", [sid]],
      ["user_notification_preferences", "SELECT COUNT(*) AS n FROM user_notification_preferences WHERE user_id IN (SELECT id FROM users WHERE society_id = ?)", [sid]],
      ["demo_whatsapp_contact","SELECT COUNT(*) AS n FROM demo_whatsapp_contact WHERE user_id IN (SELECT id FROM users WHERE society_id = ?)", [sid]],
      ["churn_feedback",      "SELECT COUNT(*) AS n FROM churn_feedback WHERE society_id = ?", [sid]],
      ["sa_audit_log",        "SELECT COUNT(*) AS n FROM sa_audit_log WHERE target_society_id = ?", [sid]],
      ["push_subscriptions",  "SELECT COUNT(*) AS n FROM push_subscriptions WHERE society_key = ?", [stateKey]],
      ["society_state",       "SELECT COUNT(*) AS n FROM society_state WHERE `key` = ?", [stateKey]],
    ];

    for (const [name, sql, params] of queries) {
      try {
        const [rows] = await pool.execute(sql, params) as [any[], any];
        counts[name] = Number((rows[0] as any).n) || 0;
      } catch (e: any) {
        errors[name] = e?.message || String(e);
        counts[name] = -1;
      }
    }

    // Nome società per riferimento
    let nome: string | null = null;
    try {
      const [rs] = await pool.execute("SELECT nome FROM societies WHERE id = ?", [sid]) as [any[], any];
      if (rs.length) nome = String(rs[0].nome);
    } catch {}

    out.push({ society_id: sid, nome, counts, errors: Object.keys(errors).length ? errors : undefined });
  }

  return res.json({ preview: out });
});

// POST /api/v2/superadmin/_diag/cleanup-execute
// Body: { societyIds: number[], confirm: "DELETE-CONFIRMED" }
// Esegue cancellazione transazionale per ciascuna società.
// Ordine: push_subscriptions → allenamento_sessioni → allenamenti → society_state → societies (CASCADE)
router.post("/superadmin/_diag/cleanup-execute", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const { societyIds, confirm } = req.body as { societyIds?: number[]; confirm?: string };
  if (confirm !== "DELETE-CONFIRMED") return res.status(400).json({ error: "confirm_required", expected: "DELETE-CONFIRMED" });
  if (!Array.isArray(societyIds) || !societyIds.length) return res.status(400).json({ error: "societyIds_required" });
  for (const sid of societyIds) {
    if (!Number.isFinite(sid) || sid <= 0) return res.status(400).json({ error: "invalid_societyId", sid });
  }

  const conn = await (pool as any).getConnection();
  const perSocietyResults: any[] = [];
  let txStatus = "pending";
  let errorDetail: string | null = null;

  try {
    await conn.beginTransaction();

    for (const sid of societyIds) {
      const stateKey = `fieldos_state_soc_${sid}`;
      const counts: Record<string, number> = {};

      // 1. push_subscriptions (no FK)
      const [r1] = await conn.execute(
        "DELETE FROM push_subscriptions WHERE society_key = ?",
        [stateKey]
      ) as [any, any];
      counts.push_subscriptions = (r1 as any).affectedRows ?? 0;

      // 2. allenamento_sessioni (FK CASCADE su allenamenti, ma li elimino esplicitamente per ordine)
      const [r2] = await conn.execute(
        "DELETE FROM allenamento_sessioni WHERE allenamento_id IN (SELECT id FROM allenamenti WHERE societa_id = ?)",
        [sid]
      ) as [any, any];
      counts.allenamento_sessioni = (r2 as any).affectedRows ?? 0;

      // 3. allenamenti (creato_da RESTRICT su users → eliminare prima di users)
      const [r3] = await conn.execute(
        "DELETE FROM allenamenti WHERE societa_id = ?",
        [sid]
      ) as [any, any];
      counts.allenamenti = (r3 as any).affectedRows ?? 0;

      // 4. society_state (no FK, key VARCHAR)
      const [r4] = await conn.execute(
        "DELETE FROM society_state WHERE `key` = ?",
        [stateKey]
      ) as [any, any];
      counts.society_state = (r4 as any).affectedRows ?? 0;

      // 5. societies — CASCADE su users, players, leve, events, comunicazioni, chat_messages, quote, notifiche, churn_feedback, ai_budget_utilizzo, ai_societa_allowlist; SET NULL su sessioni_libreria, ai_richieste_log (ma mister CASCADE)
      const [r5] = await conn.execute(
        "DELETE FROM societies WHERE id = ?",
        [sid]
      ) as [any, any];
      counts.societies = (r5 as any).affectedRows ?? 0;

      perSocietyResults.push({ society_id: sid, counts });
    }

    await conn.commit();
    txStatus = "committed";
  } catch (e: any) {
    try { await conn.rollback(); } catch (_) {}
    txStatus = "rolledback";
    errorDetail = e?.message || String(e);
  } finally {
    try { conn.release(); } catch (_) {}
  }

  // Post-state: verifica residui per le società target
  const postState: any[] = [];
  if (txStatus === "committed") {
    for (const sid of societyIds) {
      const stateKey = `fieldos_state_soc_${sid}`;
      try {
        const [s] = await pool.execute("SELECT id FROM societies WHERE id = ?", [sid]) as [any[], any];
        const [u] = await pool.execute("SELECT COUNT(*) AS n FROM users WHERE society_id = ?", [sid]) as [any[], any];
        const [p] = await pool.execute("SELECT COUNT(*) AS n FROM players WHERE society_id = ?", [sid]) as [any[], any];
        const [a] = await pool.execute("SELECT COUNT(*) AS n FROM allenamenti WHERE societa_id = ?", [sid]) as [any[], any];
        const [ps] = await pool.execute("SELECT COUNT(*) AS n FROM push_subscriptions WHERE society_key = ?", [stateKey]) as [any[], any];
        const [ss] = await pool.execute("SELECT COUNT(*) AS n FROM society_state WHERE `key` = ?", [stateKey]) as [any[], any];
        postState.push({
          society_id: sid,
          societies_residual: (s as any[]).length,
          users_residual: Number((u[0] as any).n) || 0,
          players_residual: Number((p[0] as any).n) || 0,
          allenamenti_residual: Number((a[0] as any).n) || 0,
          push_subscriptions_residual: Number((ps[0] as any).n) || 0,
          society_state_residual: Number((ss[0] as any).n) || 0,
        });
      } catch (e: any) {
        postState.push({ society_id: sid, error: e?.message });
      }
    }
  }

  // Lista società rimaste
  let remaining: any[] = [];
  try {
    const [r] = await pool.execute("SELECT id, nome, codice, billing_mode, subscription_status FROM societies ORDER BY id") as [any[], any];
    remaining = r as any[];
  } catch {}

  return res.json({
    tx_status: txStatus,
    error: errorDetail,
    per_society: perSocietyResults,
    post_state: postState,
    remaining_societies: remaining,
  });
});

export default router;
