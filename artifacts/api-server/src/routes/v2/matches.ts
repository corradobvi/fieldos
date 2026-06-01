import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import type { PoolConnection } from "mysql2/promise";

const router = Router();

const WRITE_ROLES = ["admin", "allenatore", "dirigente"];
const DEMO_SOC_IDS = new Set<number>([0, 99, 99999]);

// Gating: rifiuta le società demo; restituisce true se la richiesta è bloccata.
function rejectDemo(req: any, res: any): boolean {
  const sid = req.jwtUser?.societyId;
  if (typeof sid !== "number" || DEMO_SOC_IDS.has(sid)) {
    res.status(400).json({ error: "demo_society_not_allowed" });
    return true;
  }
  return false;
}

// GET /api/v2/matches?tipo=campionato|torneo|amichevole&leva=<nome>&includeStats=1
// Lista dei match della società. JOIN opzionale con tornei_fasi/tornei per arricchire i match torneo.
// includeStats=1: per ogni match aggiunge stats[] grezzo (match_stats), skippando i player orfani.
router.get("/matches", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const tipo = (req.query.tipo as string | undefined) || undefined;
  const leva = (req.query.leva as string | undefined) || undefined;
  const includeStats = req.query.includeStats === "1" || req.query.includeStats === "true";

  if (tipo && !["campionato", "torneo", "amichevole"].includes(tipo)) {
    return res.status(400).json({ error: "invalid_tipo" });
  }

  try {
    const conds: string[] = ["m.societa_id = ?"];
    const params: any[] = [societyId];
    if (tipo) { conds.push("m.tipo = ?");  params.push(tipo); }
    if (leva) { conds.push("m.leva = ?"); params.push(leva); }

    const [rows] = (await pool.execute(
      `SELECT m.id, m.societa_id, m.tipo, m.event_key, m.legacy_match_id,
              m.leva, m.fase_id, m.giornata,
              m.data, m.orario,
              m.casa, m.ospite, m.avversario, m.lato, m.luogo,
              m.played, m.gol_casa, m.gol_ospiti,
              m.visibilita_subito, m.annullata,
              m.bracket_round, m.bracket_pos,
              m.created_at,
              tf.nome AS fase_nome, tf.tipo AS fase_tipo, tf.fase_gruppo AS fase_gruppo,
              tf.torneo_id AS torneo_id, t.nome AS torneo_nome, t.leva AS torneo_leva
       FROM matches m
       LEFT JOIN tornei_fasi tf ON tf.id = m.fase_id
       LEFT JOIN tornei t ON t.id = tf.torneo_id
       WHERE ${conds.join(" AND ")}
       ORDER BY m.data DESC, m.orario DESC, m.id DESC`,
      params
    )) as [any[], any];

    if (includeStats && rows.length) {
      const matchIds = (rows as any[]).map((r: any) => Number(r.id));
      const placeholders = matchIds.map(() => "?").join(",");
      const [statRows] = (await pool.execute(
        `SELECT ms.match_id, ms.player_id, ms.gol, ms.assist, ms.titolare,
                ms.minuti, ms.gialli, ms.rossi, ms.gol_sub, ms.cs
         FROM match_stats ms
         INNER JOIN players p ON p.id = ms.player_id AND p.society_id = ?
         WHERE ms.match_id IN (${placeholders})`,
        [societyId, ...matchIds]
      )) as [any[], any];
      const byMatch: Record<string, any[]> = {};
      for (const s of statRows as any[]) {
        const k = String(s.match_id);
        if (!byMatch[k]) byMatch[k] = [];
        byMatch[k].push({
          player_id: Number(s.player_id),
          gol: Number(s.gol) || 0,
          assist: Number(s.assist) || 0,
          titolare: s.titolare ? 1 : 0,
          minuti: Number(s.minuti) || 0,
          gialli: Number(s.gialli) || 0,
          rossi: Number(s.rossi) || 0,
          gol_sub: Number(s.gol_sub) || 0,
          cs: s.cs ? 1 : 0,
        });
      }
      for (const r of rows as any[]) r.stats = byMatch[String(r.id)] || [];
    }

    return res.json(rows);
  } catch (e: any) {
    logger.error({ err: e }, "GET matches error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/tornei
// Tornei della società con fasi annidate. Niente filtri (volume basso).
router.get("/tornei", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [tornei] = (await pool.execute(
      `SELECT id, societa_id, nome, leva, luogo,
              data_inizio, data_fine,
              spareggio, squadre_partecipanti, squadre_mie_flag, convocati,
              convocazioni_per_partita, qual_per_girone, archiviato, created_at
       FROM tornei
       WHERE societa_id = ?
       ORDER BY data_inizio DESC, id`,
      [societyId]
    )) as [any[], any];

    if (!tornei.length) return res.json([]);

    const ids = tornei.map((t: any) => t.id);
    const placeholders = ids.map(() => "?").join(",");
    const [fasi] = (await pool.execute(
      `SELECT id, torneo_id, nome, tipo, fase_gruppo, squadre, ordine, created_at
       FROM tornei_fasi
       WHERE torneo_id IN (${placeholders})
       ORDER BY ordine, id`,
      ids
    )) as [any[], any];

    const byTorneo: Record<string, any[]> = {};
    for (const f of fasi as any[]) {
      if (!byTorneo[f.torneo_id]) byTorneo[f.torneo_id] = [];
      byTorneo[f.torneo_id].push(f);
    }
    for (const t of tornei as any[]) t.fasi = byTorneo[t.id] || [];

    return res.json(tornei);
  } catch (e: any) {
    logger.error({ err: e }, "GET tornei error");
    return res.status(500).json({ error: "server_error" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// WRITE endpoints — additivi, nessun client li chiama ancora.
// Convocazioni/disponibilita restano sul blob: il loro purge cascade lo fa il FE.
// event_key / id naturali tornei/fasi sono costruiti dal FE e inviati nel payload.
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v2/matches — UPSERT match per event_key (UNIQUE).
// Body: { event_key, tipo, leva?, fase_id?, giornata?, data?, orario?, casa?, ospite?,
//         avversario?, lato?, luogo?, played?, gol_casa?, gol_ospiti?,
//         visibilita_subito?, annullata?, bracket_round?, bracket_pos?, legacy_match_id? }
// Risposta 200: { id, created } — created=true se nuova riga, false se update.
router.post("/matches", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  if (rejectDemo(req, res)) return;
  const { societyId } = req.jwtUser!;
  const b = (req.body || {}) as Record<string, any>;
  const event_key = typeof b.event_key === "string" ? b.event_key.trim() : "";
  const tipo = typeof b.tipo === "string" ? b.tipo : "";
  if (!event_key) return res.status(400).json({ error: "event_key_required" });
  if (!["campionato", "torneo", "amichevole"].includes(tipo)) {
    return res.status(400).json({ error: "invalid_tipo" });
  }
  const lato = (b.lato === "casa" || b.lato === "trasferta") ? b.lato : null;
  try {
    const [ins] = (await pool.execute(
      `INSERT INTO matches
         (societa_id, tipo, event_key, legacy_match_id, leva, fase_id, giornata,
          data, orario, casa, ospite, avversario, lato, luogo,
          played, gol_casa, gol_ospiti,
          visibilita_subito, annullata, bracket_round, bracket_pos)
       VALUES (?,?,?,?,?,?,?, ?,?,?,?,?,?,?, ?,?,?, ?,?,?,?)
       ON DUPLICATE KEY UPDATE
         tipo=VALUES(tipo), legacy_match_id=VALUES(legacy_match_id),
         leva=VALUES(leva), fase_id=VALUES(fase_id), giornata=VALUES(giornata),
         data=VALUES(data), orario=VALUES(orario),
         casa=VALUES(casa), ospite=VALUES(ospite),
         avversario=VALUES(avversario), lato=VALUES(lato), luogo=VALUES(luogo),
         played=VALUES(played), gol_casa=VALUES(gol_casa), gol_ospiti=VALUES(gol_ospiti),
         visibilita_subito=VALUES(visibilita_subito), annullata=VALUES(annullata),
         bracket_round=VALUES(bracket_round), bracket_pos=VALUES(bracket_pos)`,
      [
        societyId, tipo, event_key,
        b.legacy_match_id != null ? String(b.legacy_match_id) : null,
        b.leva ?? null,
        b.fase_id != null ? String(b.fase_id) : null,
        b.giornata != null ? Number(b.giornata) : null,
        b.data || null, b.orario ?? null,
        b.casa ?? null, b.ospite ?? null,
        b.avversario ?? null, lato, b.luogo ?? null,
        b.played ? 1 : 0,
        Number(b.gol_casa) || 0, Number(b.gol_ospiti) || 0,
        b.visibilita_subito ? 1 : 0,
        b.annullata ? 1 : 0,
        b.bracket_round != null ? Number(b.bracket_round) : null,
        b.bracket_pos   != null ? Number(b.bracket_pos)   : null,
      ]
    )) as [any, any];

    // ON DUPLICATE KEY UPDATE: insertId è 0 quando aggiornata una riga preesistente.
    // Resolve l'id reale via event_key per ritornare sempre il match.id corretto.
    const [rowR] = (await pool.execute(
      "SELECT id FROM matches WHERE societa_id = ? AND event_key = ? LIMIT 1",
      [societyId, event_key]
    )) as [any[], any];
    if (!rowR.length) return res.status(500).json({ error: "match_lookup_failed" });
    const id = Number(rowR[0].id);
    const created = (ins as any).affectedRows === 1; // 1 = insert, 2 = update on duplicate (MySQL semantics)
    return res.json({ id, created });
  } catch (e: any) {
    logger.error({ err: e?.message }, "POST matches upsert error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/matches/:matchId/stats — UPSERT BULK distinta stats per un match.
// Body: { stats: [{ player_id, gol?, assist?, titolare?, minuti?, gialli?, rossi?,
//                   gol_sub?, cs? }, ...] }
// Semantica "imposta la distinta": ON DUPLICATE KEY UPDATE su (match_id, player_id).
// Skip per player_id non presenti in players (no FK violation). Conta upsert + skip.
router.post("/matches/:matchId/stats", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  if (rejectDemo(req, res)) return;
  const { societyId } = req.jwtUser!;
  const matchId = Number(req.params.matchId);
  if (!Number.isFinite(matchId) || matchId <= 0) {
    return res.status(400).json({ error: "invalid_match_id" });
  }
  const stats = Array.isArray(req.body?.stats) ? req.body.stats : null;
  if (!stats) return res.status(400).json({ error: "stats_array_required" });

  try {
    // Verifica ownership match → società
    const [m] = (await pool.execute(
      "SELECT id FROM matches WHERE id = ? AND societa_id = ? LIMIT 1",
      [matchId, societyId]
    )) as [any[], any];
    if (!m.length) return res.status(404).json({ error: "match_not_found" });

    // Set di player_id validi per skip su FK violation
    const [playerRows] = (await pool.execute(
      "SELECT id FROM players WHERE society_id = ?",
      [societyId]
    )) as [any[], any];
    const validPlayerIds = new Set<number>((playerRows as any[]).map((r: any) => Number(r.id)));

    let upserted = 0;
    let skipped_player_missing = 0;
    const conn: PoolConnection = await (pool as any).getConnection();
    try {
      await conn.beginTransaction();
      for (const s of stats) {
        const pid = Number(s?.player_id ?? s?.playerId);
        if (!Number.isFinite(pid) || !validPlayerIds.has(pid)) { skipped_player_missing++; continue; }
        await conn.execute(
          `INSERT INTO match_stats
             (match_id, player_id, gol, assist, titolare, minuti, gialli, rossi, gol_sub, cs)
           VALUES (?,?,?,?,?,?,?,?,?,?)
           ON DUPLICATE KEY UPDATE
             gol=VALUES(gol), assist=VALUES(assist), titolare=VALUES(titolare),
             minuti=VALUES(minuti), gialli=VALUES(gialli), rossi=VALUES(rossi),
             gol_sub=VALUES(gol_sub), cs=VALUES(cs)`,
          [
            matchId, pid,
            Number(s.gol) || 0, Number(s.assist) || 0, s.titolare ? 1 : 0,
            Number(s.minuti) || 0, Number(s.gialli) || 0, Number(s.rossi) || 0,
            Number(s.gol_sub ?? s.golSub) || 0, s.cs ? 1 : 0,
          ]
        );
        upserted++;
      }
      await conn.commit();
    } catch (e: any) {
      await conn.rollback().catch(() => {});
      logger.error({ err: e?.message, matchId }, "POST matches/:id/stats bulk failed");
      return res.status(500).json({ error: "transaction_failed", detail: e?.message });
    } finally {
      conn.release();
    }
    return res.json({ ok: true, match_id: matchId, upserted, skipped_player_missing });
  } catch (e: any) {
    logger.error({ err: e?.message }, "POST matches/:id/stats error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/tornei — UPSERT torneo + fasi.
// Body: { id, nome, leva?, luogo?, data_inizio?, data_fine?,
//         spareggio?, squadre_partecipanti?, squadre_mie_flag?, convocati?,
//         convocazioni_per_partita?, qual_per_girone?, archiviato?,
//         fasi?: [{ id, nome?, tipo?, fase_gruppo?, squadre?, ordine? }, ...] }
// Upsert additivo sulle fasi: non rimuove fasi non presenti nel payload.
router.post("/tornei", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  if (rejectDemo(req, res)) return;
  const { societyId } = req.jwtUser!;
  const t = (req.body || {}) as Record<string, any>;
  if (!t.id || typeof t.id !== "string") return res.status(400).json({ error: "torneo_id_required" });
  if (!t.nome) return res.status(400).json({ error: "torneo_nome_required" });

  const conn: PoolConnection = await (pool as any).getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `INSERT INTO tornei
         (id, societa_id, nome, leva, luogo, data_inizio, data_fine,
          spareggio, squadre_partecipanti, squadre_mie_flag, convocati,
          convocazioni_per_partita, qual_per_girone, archiviato)
       VALUES (?,?,?,?,?,?,?,CAST(? AS JSON),CAST(? AS JSON),CAST(? AS JSON),CAST(? AS JSON),?,?,?)
       ON DUPLICATE KEY UPDATE
         nome=VALUES(nome), leva=VALUES(leva), luogo=VALUES(luogo),
         data_inizio=VALUES(data_inizio), data_fine=VALUES(data_fine),
         spareggio=VALUES(spareggio),
         squadre_partecipanti=VALUES(squadre_partecipanti),
         squadre_mie_flag=VALUES(squadre_mie_flag),
         convocati=VALUES(convocati),
         convocazioni_per_partita=VALUES(convocazioni_per_partita),
         qual_per_girone=VALUES(qual_per_girone),
         archiviato=VALUES(archiviato)`,
      [
        String(t.id), societyId, String(t.nome),
        t.leva ?? null, t.luogo ?? null,
        t.data_inizio || null, t.data_fine || null,
        JSON.stringify(t.spareggio ?? null),
        JSON.stringify(t.squadre_partecipanti ?? null),
        JSON.stringify(t.squadre_mie_flag ?? null),
        JSON.stringify(t.convocati ?? null),
        t.convocazioni_per_partita ? 1 : 0,
        t.qual_per_girone != null ? Number(t.qual_per_girone) : null,
        t.archiviato ? 1 : 0,
      ]
    );

    const fasi = Array.isArray(t.fasi) ? t.fasi : [];
    let fasi_upserted = 0;
    for (let i = 0; i < fasi.length; i++) {
      const f = fasi[i];
      if (!f?.id) continue;
      await conn.execute(
        `INSERT INTO tornei_fasi
           (id, torneo_id, nome, tipo, fase_gruppo, squadre, ordine)
         VALUES (?,?,?,?,?,CAST(? AS JSON),?)
         ON DUPLICATE KEY UPDATE
           torneo_id=VALUES(torneo_id), nome=VALUES(nome), tipo=VALUES(tipo),
           fase_gruppo=VALUES(fase_gruppo), squadre=VALUES(squadre), ordine=VALUES(ordine)`,
        [
          String(f.id), String(t.id),
          f.nome ?? null, f.tipo ?? null, f.fase_gruppo ?? null,
          JSON.stringify(f.squadre ?? null),
          f.ordine != null ? Number(f.ordine) : i,
        ]
      );
      fasi_upserted++;
    }
    await conn.commit();
    return res.json({ ok: true, id: String(t.id), fasi_upserted });
  } catch (e: any) {
    await conn.rollback().catch(() => {});
    logger.error({ err: e?.message }, "POST tornei upsert error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  } finally {
    conn.release();
  }
});

// DELETE /api/v2/matches/:matchId — delete singolo match per BIGINT id (FK CASCADE su stats).
router.delete("/matches/:matchId", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  if (rejectDemo(req, res)) return;
  const { societyId } = req.jwtUser!;
  const matchId = Number(req.params.matchId);
  if (!Number.isFinite(matchId) || matchId <= 0) {
    return res.status(400).json({ error: "invalid_match_id" });
  }
  try {
    const [r] = (await pool.execute(
      "DELETE FROM matches WHERE id = ? AND societa_id = ?",
      [matchId, societyId]
    )) as [any, any];
    if (!(r as any).affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e?.message }, "DELETE matches/:id error");
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/matches/by-event-key/:eventKey — alternativa via event_key.
router.delete("/matches/by-event-key/:eventKey", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  if (rejectDemo(req, res)) return;
  const { societyId } = req.jwtUser!;
  const event_key = String(req.params.eventKey || "");
  if (!event_key) return res.status(400).json({ error: "event_key_required" });
  try {
    const [r] = (await pool.execute(
      "DELETE FROM matches WHERE event_key = ? AND societa_id = ?",
      [event_key, societyId]
    )) as [any, any];
    if (!(r as any).affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e?.message }, "DELETE matches by-event-key error");
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/tornei/:id — delete torneo per id naturale.
// FK CASCADE: tornei_fasi → matches (via fase_id) → match_stats.
router.delete("/tornei/:id", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  if (rejectDemo(req, res)) return;
  const { societyId } = req.jwtUser!;
  const id = String(req.params.id || "");
  if (!id) return res.status(400).json({ error: "torneo_id_required" });
  try {
    const [r] = (await pool.execute(
      "DELETE FROM tornei WHERE id = ? AND societa_id = ?",
      [id, societyId]
    )) as [any, any];
    if (!(r as any).affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e?.message }, "DELETE tornei/:id error");
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/campionato?leva=<nome> — cancella tutti i match tipo='campionato'
// di quella leva. FK CASCADE rimuove le stats. Convocazioni blob: il FE le purga.
router.delete("/campionato", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  if (rejectDemo(req, res)) return;
  const { societyId } = req.jwtUser!;
  const leva = (req.query.leva as string | undefined) || "";
  if (!leva) return res.status(400).json({ error: "leva_required" });
  try {
    const [r] = (await pool.execute(
      "DELETE FROM matches WHERE societa_id = ? AND tipo = 'campionato' AND leva = ?",
      [societyId, leva]
    )) as [any, any];
    return res.json({ ok: true, deleted: (r as any).affectedRows || 0 });
  } catch (e: any) {
    logger.error({ err: e?.message }, "DELETE campionato error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
