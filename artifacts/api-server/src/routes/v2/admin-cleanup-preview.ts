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

export default router;
