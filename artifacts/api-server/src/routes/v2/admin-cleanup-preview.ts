import { Router } from "express";
import { pool } from "@workspace/db";
import { syncGuardianToBlob } from "./minors";

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

// POST /api/v2/superadmin/_diag/repair-guardians?societyId=X
// Riparatore retroattivo: per ogni user con player_guardians in questa società,
// chiama syncGuardianToBlob → ricostruisce figli/figliIds in blob USERS_DB da MySQL.
// Idempotente. Usato per riparare blob USERS_DB desallineati.
router.post("/superadmin/_diag/repair-guardians", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const societyId = parseInt(String(req.query.societyId || req.body?.societyId || ""), 10);
  if (!societyId || !Number.isFinite(societyId)) {
    return res.status(400).json({ error: "societyId required" });
  }
  try {
    // Trova tutti gli user_id distinct in player_guardians per questa società
    const [rows] = (await pool.execute(
      `SELECT DISTINCT pg.user_id, u.email
       FROM player_guardians pg
       JOIN players p ON p.id = pg.player_id
       JOIN users u ON u.id = pg.user_id
       WHERE p.society_id = ?`,
      [societyId]
    )) as [any[], any];

    const synced: any[] = [];
    const errors: any[] = [];
    for (const r of rows as any[]) {
      try {
        await syncGuardianToBlob(societyId, r.user_id);
        synced.push({ user_id: r.user_id, email: r.email });
      } catch (e: any) {
        errors.push({ user_id: r.user_id, email: r.email, error: e?.message });
      }
    }

    return res.json({
      societyId,
      total_guardians: rows.length,
      synced: synced.length,
      errors_count: errors.length,
      synced_details: synced,
      errors,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

// POST /api/v2/superadmin/_diag/repair-players?societyId=X
// Riparatore: sincronizza MySQL players → blob state.players[].
// - Aggiunge entry mancanti (create-if-missing)
// - Aggiorna entry esistenti (cognome, incomplete, leva, ecc.)
// - NON elimina orfani (player nel blob senza match MySQL): solo li lista come warning
router.post("/superadmin/_diag/repair-players", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const societyId = parseInt(String(req.query.societyId || req.body?.societyId || ""), 10);
  if (!societyId || !Number.isFinite(societyId)) {
    return res.status(400).json({ error: "societyId required" });
  }
  try {
    const [mysqlPlayers] = (await pool.execute(
      `SELECT id, nome, cognome, cognome_iniziale, numero, leva, incomplete, ruolo_campo, birth_date, approval_status
       FROM players WHERE society_id = ?`,
      [societyId]
    )) as [any[], any];

    const stateKey = `fieldos_state_soc_${societyId}`;
    const [blobRows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [stateKey]
    )) as [any[], any];
    if (!blobRows.length) return res.status(404).json({ error: "blob_not_found", stateKey });

    let state: any;
    try { state = JSON.parse(blobRows[0].state_json as string); }
    catch { return res.status(500).json({ error: "blob_parse_error" }); }
    if (!Array.isArray(state.players)) state.players = [];

    const mysqlById = new Map<number, any>((mysqlPlayers as any[]).map(p => [Number(p.id), p]));
    const blobById = new Map<number, any>(state.players.map((p: any) => [Number(p?.id), p]));

    const added: any[] = [];
    const updated: any[] = [];

    for (const m of mysqlPlayers as any[]) {
      const mid = Number(m.id);
      const existing = blobById.get(mid);
      if (!existing) {
        // CREATE
        const newEntry = {
          id: mid,
          nome: m.nome || '',
          cogn: m.cognome || '',
          cogn_iniziale: m.cognome_iniziale || '',
          leva: m.leva || '',
          num: m.numero || 0,
          incomplete: m.incomplete === 1,
          approval_status: m.approval_status || 'approved',
          birth_date: m.birth_date || null,
          ruolo: m.ruolo_campo || '',
          partite: [],
          presAll: [],
          presPartite: [],
          assenzeAvvisate: [],
        };
        state.players.push(newEntry);
        added.push({ id: mid, nome: m.nome, cognome: m.cognome });
      } else {
        // UPDATE (campi MySQL canonical)
        let changed = false;
        if (m.nome != null && existing.nome !== m.nome) { existing.nome = m.nome; changed = true; }
        if (m.cognome != null && existing.cogn !== m.cognome) { existing.cogn = m.cognome; changed = true; }
        if (m.cognome_iniziale != null && existing.cogn_iniziale !== m.cognome_iniziale) { existing.cogn_iniziale = m.cognome_iniziale; changed = true; }
        if (m.leva != null && existing.leva !== m.leva) { existing.leva = m.leva; changed = true; }
        const expectedIncomplete = m.incomplete === 1;
        if (existing.incomplete !== expectedIncomplete) { existing.incomplete = expectedIncomplete; changed = true; }
        if (m.birth_date != null && existing.birth_date !== m.birth_date) { existing.birth_date = m.birth_date; changed = true; }
        if (m.approval_status != null && existing.approval_status !== m.approval_status) { existing.approval_status = m.approval_status; changed = true; }
        if (changed) updated.push({ id: mid, nome: m.nome });
      }
    }

    // Orfani: blob players senza match MySQL
    const orphans: any[] = [];
    for (const bp of state.players) {
      if (!bp || bp.id == null) continue;
      if (!mysqlById.has(Number(bp.id))) {
        orphans.push({ id: Number(bp.id), nome: bp.nome, cogn: bp.cogn, cogn_iniziale: bp.cogn_iniziale, incomplete: bp.incomplete });
      }
    }

    // nextPlayerId: bump per evitare collisioni
    const maxId = state.players.reduce((mx: number, p: any) => Math.max(mx, Number(p?.id) || 0), 0);
    state.nextPlayerId = Math.max(Number(state.nextPlayerId) || 1, maxId + 1);

    await pool.execute(
      "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
      [JSON.stringify(state), stateKey]
    );

    return res.json({
      societyId, stateKey,
      total_mysql: (mysqlPlayers as any[]).length,
      total_blob_after: state.players.length,
      added_count: added.length,
      updated_count: updated.length,
      orphans_count: orphans.length,
      added, updated, orphans,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

// GET /api/v2/superadmin/_diag/duplicate-players-preview?societyId=X
// Report READ-ONLY: per ogni player MySQL elenca guardian_count, presenze_count,
// e classifica AZIONE (TIENI / ELIMINA / VERIFICA) in base alle regole di sicurezza.
router.get("/superadmin/_diag/duplicate-players-preview", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const societyId = parseInt(String(req.query.societyId || ""), 10);
  if (!societyId) return res.status(400).json({ error: "societyId required" });

  try {
    const [rows] = (await pool.execute(
      `SELECT
         p.id, p.nome, p.cognome, p.cognome_iniziale, p.incomplete, p.leva,
         (SELECT COUNT(*) FROM player_guardians pg WHERE pg.player_id = p.id) AS guardian_count,
         (SELECT COUNT(*) FROM presenze pp WHERE pp.player_id = p.id) AS presenze_count
       FROM players p
       WHERE p.society_id = ?
       ORDER BY p.nome, p.cognome_iniziale, p.id`,
      [societyId]
    )) as [any[], any];

    // Raggruppa per (nome, cognome_iniziale)
    const groups = new Map<string, any[]>();
    for (const p of rows as any[]) {
      const key = `${(p.nome || '').trim().toLowerCase()}|${(p.cognome_iniziale || '').trim().toLowerCase()}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }

    // Classifica
    const report: any[] = [];
    for (const [key, items] of groups) {
      const completi = items.filter(p => p.incomplete === 0 || Number(p.guardian_count) > 0);
      const groupHasCanonical = completi.length > 0;
      for (const p of items) {
        let action = "TIENI";
        let reason = "";
        const gc = Number(p.guardian_count);
        const pc = Number(p.presenze_count);
        if (gc > 0) { action = "TIENI"; reason = "ha guardian (player_guardians)"; }
        else if (pc > 0) { action = "TIENI"; reason = "ha presenze storiche"; }
        else if (p.incomplete === 0 && p.cognome) { action = "TIENI"; reason = "completo con cognome"; }
        else if (items.length === 1) { action = "VERIFICA"; reason = "unico con questo nome+iniziale, ma incomplete senza guardian"; }
        else if (!groupHasCanonical) { action = "VERIFICA"; reason = "nessuno del gruppo è canonico (tutti incomplete senza guardian)"; }
        else {
          // incomplete=1, no guardian, no presenze, esiste un canonico nello stesso gruppo
          action = "ELIMINA";
          reason = `duplicato di canonico del gruppo "${key}"`;
        }
        report.push({
          id: p.id, nome: p.nome, cognome: p.cognome || '',
          cognome_iniziale: p.cognome_iniziale || '',
          incomplete: p.incomplete === 1,
          leva: p.leva, guardian_count: gc, presenze_count: pc,
          group_key: key, action, reason,
        });
      }
    }

    // Riordina: per nome, poi action (ELIMINA in fondo per leggibilità)
    report.sort((a, b) => a.group_key.localeCompare(b.group_key) || a.id - b.id);

    const summary = {
      total: report.length,
      tieni: report.filter(r => r.action === "TIENI").length,
      elimina: report.filter(r => r.action === "ELIMINA").length,
      verifica: report.filter(r => r.action === "VERIFICA").length,
    };

    return res.json({ societyId, summary, report });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

// POST /api/v2/superadmin/_diag/delete-duplicate-players
// Body: { societyId, playerIds: [number], confirm: "DELETE-DUPLICATES" }
// Cancella i player indicati (in transazione) + rimuove dal blob state.players[] + repair USERS_DB.
// Pre-check: rifiuta se uno dei playerIds ha guardian_count>0 o presenze_count>0.
router.post("/superadmin/_diag/delete-duplicate-players", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const { societyId, playerIds, confirm } = req.body as { societyId?: number; playerIds?: number[]; confirm?: string };
  if (confirm !== "DELETE-DUPLICATES") return res.status(400).json({ error: "confirm_required", expected: "DELETE-DUPLICATES" });
  if (!societyId || !Array.isArray(playerIds) || !playerIds.length) return res.status(400).json({ error: "societyId + playerIds[] required" });

  const idsCsv = playerIds.map(n => Number(n)).filter(Number.isFinite);
  if (!idsCsv.length) return res.status(400).json({ error: "no_valid_ids" });

  const conn = await (pool as any).getConnection();
  const result: any = { societyId, deleted: [], skipped: [], errors: [] };

  try {
    await conn.beginTransaction();

    // Pre-check sicurezza: ogni player deve avere guardian_count=0 e presenze_count=0 e appartenere alla società
    const [check] = (await conn.execute(
      `SELECT p.id, p.nome, p.cognome, p.society_id, p.incomplete,
              (SELECT COUNT(*) FROM player_guardians pg WHERE pg.player_id = p.id) AS gc,
              (SELECT COUNT(*) FROM presenze pp WHERE pp.player_id = p.id) AS pc
       FROM players p WHERE p.id IN (?) AND p.society_id = ?`,
      [idsCsv, societyId]
    )) as [any[], any];

    const toDelete: number[] = [];
    for (const r of check as any[]) {
      if (Number(r.gc) > 0 || Number(r.pc) > 0) {
        result.skipped.push({ id: r.id, nome: r.nome, reason: `has guardian_count=${r.gc} presenze_count=${r.pc}` });
        continue;
      }
      toDelete.push(r.id);
    }

    for (const pid of toDelete) {
      try {
        await conn.execute("DELETE FROM player_guardians WHERE player_id = ?", [pid]);
        await conn.execute("DELETE FROM user_players WHERE player_id = ?", [pid]).catch(() => {});
        const [r] = await conn.execute("DELETE FROM players WHERE id = ? AND society_id = ?", [pid, societyId]) as [any, any];
        if (r.affectedRows) result.deleted.push(pid);
      } catch (e: any) {
        result.errors.push({ id: pid, error: e?.message });
      }
    }

    await conn.commit();
  } catch (e: any) {
    try { await conn.rollback(); } catch (_) {}
    return res.status(500).json({ error: e?.message });
  } finally {
    try { conn.release(); } catch (_) {}
  }

  // Update blob: rimuovi player eliminati da state.players[]
  try {
    const stateKey = `fieldos_state_soc_${societyId}`;
    const [blobRows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [stateKey]
    )) as [any[], any];
    if (blobRows.length) {
      const state = JSON.parse(blobRows[0].state_json as string);
      if (Array.isArray(state.players)) {
        const before = state.players.length;
        state.players = state.players.filter((p: any) => !result.deleted.includes(Number(p?.id)));
        result.blob_players_before = before;
        result.blob_players_after = state.players.length;
        await pool.execute(
          "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
          [JSON.stringify(state), stateKey]
        );
      }
    }
  } catch (e: any) {
    result.blob_update_error = e?.message;
  }

  return res.json(result);
});

export default router;
