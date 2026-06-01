// ─────────────────────────────────────────────────────────────────────────────
// TEMPORANEO / una-tantum — BACKFILL MATCH GESTIONALI blob → MySQL
// POST /api/v2/admin/backfill-matches/:societaId
//
// Migra amichevoli + campionato + tornei (con stats annidate) dal blob
// `society_state.state_json` alle nuove tabelle matches / match_stats /
// tornei / tornei_fasi. Idempotente per event_key.
//
// Da RIMUOVERE a migrazione conclusa. Nessun auto-run al deploy: si attiva
// SOLO via chiamata esplicita autenticata.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";
import type { PoolConnection } from "mysql2/promise";

const router = Router();

const DEMO_SOC_ID = 99;
const DEMO_STELLA_ID = 99999;
const DEMO_SOC_IDS = new Set<number>([0, DEMO_SOC_ID, DEMO_STELLA_ID]);

type Counters = {
  tornei_inseriti: number;
  fasi_inserite: number;
  matches_inseriti: { campionato: number; torneo: number; amichevole: number };
  stats_inserite: number;
  stats_saltate_player_mancante: number;
  matches_saltati_gia_presenti: number;
};

type RefreshCounters = {
  tornei_upsert: number;
  fasi_upsert: number;
  matches_upsert: { campionato: number; torneo: number; amichevole: number };
  stats_riallineate: number;
  stats_saltate_player_mancante: number;
};

function newCounters(): Counters {
  return {
    tornei_inseriti: 0,
    fasi_inserite: 0,
    matches_inseriti: { campionato: 0, torneo: 0, amichevole: 0 },
    stats_inserite: 0,
    stats_saltate_player_mancante: 0,
    matches_saltati_gia_presenti: 0,
  };
}

function newRefreshCounters(): RefreshCounters {
  return {
    tornei_upsert: 0,
    fasi_upsert: 0,
    matches_upsert: { campionato: 0, torneo: 0, amichevole: 0 },
    stats_riallineate: 0,
    stats_saltate_player_mancante: 0,
  };
}

function ekCamp(leva: string, mId: any): string {
  return `camp_${leva}_${mId}`;
}
function ekTorneo(tId: any, fId: any, mId: any): string {
  return `torneo_${tId}_${fId}_${mId}`;
}
function ekAmich(mId: any): string {
  return `amich_${mId}`;
}

router.post("/admin/backfill-matches/:societaId", requireAuth, async (req, res) => {
  const requested = parseInt(String(req.params.societaId), 10);
  if (!Number.isFinite(requested) || requested <= 0) {
    return res.status(400).json({ error: "invalid_societa_id" });
  }
  if (DEMO_SOC_IDS.has(requested)) {
    return res.status(400).json({ error: "demo_society_not_allowed" });
  }

  const jwt = req.jwtUser!;
  if (jwt.role !== "admin") {
    return res.status(403).json({ error: "admin_only" });
  }
  if (jwt.societyId !== requested) {
    return res.status(403).json({ error: "society_mismatch" });
  }

  const dryRun = String(req.query.dryRun || "") === "1" || String(req.query.dryRun || "") === "true";
  const refresh = String(req.query.refresh || "") === "1" || String(req.query.refresh || "") === "true";

  try {
    // 1) Pull blob
    const stateKey = `fieldos_state_soc_${requested}`;
    const [blobRows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [stateKey]
    )) as [any[], any];
    if (!blobRows.length) {
      return res.status(404).json({ error: "blob_not_found", stateKey });
    }
    let state: any;
    try {
      state = JSON.parse(blobRows[0].state_json as string);
    } catch (e: any) {
      return res.status(500).json({ error: "blob_parse_error", detail: e?.message });
    }

    const amichevoli: any[] = Array.isArray(state?.amichevoli) ? state.amichevoli : [];
    const campionato: Record<string, any> = (state?.campionato && typeof state.campionato === "object")
      ? state.campionato : {};
    const tornei: any[] = Array.isArray(state?.tornei) ? state.tornei : [];

    // 2) Set di event_key gia' presenti (idempotenza)
    const [existRows] = (await pool.execute(
      "SELECT event_key FROM matches WHERE societa_id = ?",
      [requested]
    )) as [any[], any];
    const existingKeys = new Set<string>((existRows as any[]).map((r: any) => String(r.event_key)));

    // 3) Set di player_id validi (skip su FK violation)
    const [playerRows] = (await pool.execute(
      "SELECT id FROM players WHERE society_id = ?",
      [requested]
    )) as [any[], any];
    const validPlayerIds = new Set<number>((playerRows as any[]).map((r: any) => Number(r.id)));

    // ─────────────────────────────────────────────────────────────────────
    // BRANCH REFRESH (additivo, ?refresh=1): re-upsert tornei/fasi/matches
    // e riallineamento full-replace di match_stats per ogni match. Ritorna
    // counters dedicati (matches_upsert + stats_riallineate). Combinabile
    // con ?dryRun=1.
    // ─────────────────────────────────────────────────────────────────────
    if (refresh) {
      const rc = newRefreshCounters();
      const sampleR: Array<{ event_key: string; tipo: string }> = [];

      if (dryRun) {
        // Dry-run refresh: conta tutto come "verrebbe upsertato" (esistenti inclusi).
        for (const t of tornei) {
          rc.tornei_upsert += 1;
          for (const f of (t.fasi || [])) {
            rc.fasi_upsert += 1;
            for (const m of (f.partite || [])) {
              const ek = ekTorneo(t.id, f.id, m.id);
              rc.matches_upsert.torneo += 1;
              if (sampleR.length < 8) sampleR.push({ event_key: ek, tipo: "torneo" });
              for (const s of (m.stats || [])) {
                const pid = Number(s.playerId);
                if (!validPlayerIds.has(pid)) { rc.stats_saltate_player_mancante += 1; continue; }
                rc.stats_riallineate += 1;
              }
            }
          }
        }
        for (const lv of Object.keys(campionato)) {
          const camp = campionato[lv];
          for (const m of (camp.partite || [])) {
            const ek = ekCamp(lv, m.id);
            rc.matches_upsert.campionato += 1;
            if (sampleR.length < 8) sampleR.push({ event_key: ek, tipo: "campionato" });
            for (const s of (m.stats || [])) {
              const pid = Number(s.playerId);
              if (!validPlayerIds.has(pid)) { rc.stats_saltate_player_mancante += 1; continue; }
              rc.stats_riallineate += 1;
            }
          }
        }
        for (const a of amichevoli) {
          const ek = ekAmich(a.id);
          rc.matches_upsert.amichevole += 1;
          if (sampleR.length < 8) sampleR.push({ event_key: ek, tipo: "amichevole" });
          for (const s of (a.stats || [])) {
            const pid = Number(s.playerId);
            if (!validPlayerIds.has(pid)) { rc.stats_saltate_player_mancante += 1; continue; }
            rc.stats_riallineate += 1;
          }
        }
        return res.json({ dryRun: true, refresh: true, societaId: requested, counters: rc, sample: sampleR });
      }

      // Refresh reale: tutto in una sola transazione.
      const connR: PoolConnection = await (pool as any).getConnection();
      try {
        await connR.beginTransaction();

        async function upsertMatchAndStats(
          tipo: "campionato" | "torneo" | "amichevole",
          ek: string,
          insertSql: string,
          insertParams: any[],
          statsArr: any[]
        ) {
          await connR.execute(insertSql, insertParams);
          // Risolvi l'id reale (ON DUPLICATE KEY UPDATE non rende affidabile insertId).
          const [rowR] = (await connR.execute(
            "SELECT id FROM matches WHERE societa_id = ? AND event_key = ? LIMIT 1",
            [requested, ek]
          )) as [any[], any];
          if (!rowR.length) return; // fallback paranoico
          const mid = Number(rowR[0].id);
          rc.matches_upsert[tipo] += 1;

          // Full-replace match_stats per riallinearle al blob.
          await connR.execute("DELETE FROM match_stats WHERE match_id = ?", [mid]);
          for (const s of (statsArr || [])) {
            const pid = Number(s.playerId);
            if (!validPlayerIds.has(pid)) { rc.stats_saltate_player_mancante += 1; continue; }
            await connR.execute(
              `INSERT INTO match_stats
                 (match_id, player_id, gol, assist, titolare, minuti, gialli, rossi, gol_sub, cs)
               VALUES (?,?,?,?,?,?,?,?,?,?)`,
              [
                mid, pid,
                Number(s.gol) || 0, Number(s.assist) || 0, s.titolare ? 1 : 0,
                Number(s.minuti) || 0, Number(s.gialli) || 0, Number(s.rossi) || 0,
                Number(s.golSub) || 0, s.cs ? 1 : 0,
              ]
            );
            rc.stats_riallineate += 1;
          }
        }

        // Tornei + fasi + matches torneo (UPSERT)
        for (const t of tornei) {
          const [insT] = (await connR.execute(
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
              String(t.id), requested, String(t.nome || ""),
              t.leva ?? null, t.luogo ?? null,
              t.dataInizio || null, t.dataFine || null,
              JSON.stringify(t.spareggio ?? null),
              JSON.stringify(t.squadrePartecipanti ?? null),
              JSON.stringify(t.squadreMieFlag ?? null),
              JSON.stringify(t.convocati ?? null),
              t.convocazioniPerPartita ? 1 : 0,
              t.qualPerGirone ?? null,
              t.archiviato ? 1 : 0,
            ]
          )) as [any, any];
          // affectedRows: 1=insert, 2=update (semantica mysql2 ON DUPLICATE KEY).
          if (((insT as any).affectedRows || 0) > 0) rc.tornei_upsert += 1;

          for (let fi = 0; fi < (t.fasi || []).length; fi++) {
            const f = t.fasi[fi];
            const [insF] = (await connR.execute(
              `INSERT INTO tornei_fasi
                 (id, torneo_id, nome, tipo, fase_gruppo, squadre, ordine)
               VALUES (?,?,?,?,?,CAST(? AS JSON),?)
               ON DUPLICATE KEY UPDATE
                 torneo_id=VALUES(torneo_id), nome=VALUES(nome), tipo=VALUES(tipo),
                 fase_gruppo=VALUES(fase_gruppo), squadre=VALUES(squadre), ordine=VALUES(ordine)`,
              [
                String(f.id), String(t.id),
                f.nome ?? null, f.tipo ?? null, f.faseGruppo ?? null,
                JSON.stringify(f.squadre ?? null),
                fi,
              ]
            )) as [any, any];
            if (((insF as any).affectedRows || 0) > 0) rc.fasi_upsert += 1;

            for (const m of (f.partite || [])) {
              const ek = ekTorneo(t.id, f.id, m.id);
              await upsertMatchAndStats(
                "torneo", ek,
                `INSERT INTO matches
                   (societa_id, tipo, event_key, legacy_match_id, leva, fase_id,
                    data, orario, casa, ospite, luogo, played, gol_casa, gol_ospiti,
                    visibilita_subito, bracket_round, bracket_pos)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE
                   tipo=VALUES(tipo), legacy_match_id=VALUES(legacy_match_id),
                   leva=VALUES(leva), fase_id=VALUES(fase_id),
                   data=VALUES(data), orario=VALUES(orario),
                   casa=VALUES(casa), ospite=VALUES(ospite), luogo=VALUES(luogo),
                   played=VALUES(played), gol_casa=VALUES(gol_casa), gol_ospiti=VALUES(gol_ospiti),
                   visibilita_subito=VALUES(visibilita_subito),
                   bracket_round=VALUES(bracket_round), bracket_pos=VALUES(bracket_pos)`,
                [
                  requested, "torneo", ek, String(m.id ?? ""), t.leva ?? null, String(f.id),
                  m.data || null, m.orario ?? null,
                  m.casa ?? null, m.ospite ?? null, m.luogo ?? null,
                  m.played ? 1 : 0,
                  Number(m.golCasa) || 0, Number(m.golOspiti) || 0,
                  m.visibilitaSubito ? 1 : 0,
                  m.bracketRound ?? null, m.bracketPos ?? null,
                ],
                m.stats || []
              );
            }
          }
        }

        // Campionato (per leva) UPSERT
        for (const lv of Object.keys(campionato)) {
          const camp = campionato[lv];
          for (const m of (camp.partite || [])) {
            const ek = ekCamp(lv, m.id);
            await upsertMatchAndStats(
              "campionato", ek,
              `INSERT INTO matches
                 (societa_id, tipo, event_key, legacy_match_id, leva, giornata,
                  data, orario, casa, ospite, luogo, played, gol_casa, gol_ospiti,
                  visibilita_subito)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
               ON DUPLICATE KEY UPDATE
                 tipo=VALUES(tipo), legacy_match_id=VALUES(legacy_match_id),
                 leva=VALUES(leva), giornata=VALUES(giornata),
                 data=VALUES(data), orario=VALUES(orario),
                 casa=VALUES(casa), ospite=VALUES(ospite), luogo=VALUES(luogo),
                 played=VALUES(played), gol_casa=VALUES(gol_casa), gol_ospiti=VALUES(gol_ospiti),
                 visibilita_subito=VALUES(visibilita_subito)`,
              [
                requested, "campionato", ek, String(m.id ?? ""), lv,
                m.giornata ?? null,
                m.data || null, m.orario ?? null,
                m.casa ?? null, m.ospite ?? null, m.luogo ?? null,
                m.played ? 1 : 0,
                Number(m.golCasa) || 0, Number(m.golOspiti) || 0,
                m.visibilitaSubito ? 1 : 0,
              ],
              m.stats || []
            );
          }
        }

        // Amichevoli UPSERT
        for (const a of amichevoli) {
          const ek = ekAmich(a.id);
          await upsertMatchAndStats(
            "amichevole", ek,
            `INSERT INTO matches
               (societa_id, tipo, event_key, legacy_match_id, leva,
                data, orario, avversario, lato, luogo, played, gol_casa, gol_ospiti,
                visibilita_subito, annullata)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
               tipo=VALUES(tipo), legacy_match_id=VALUES(legacy_match_id),
               leva=VALUES(leva),
               data=VALUES(data), orario=VALUES(orario),
               avversario=VALUES(avversario), lato=VALUES(lato), luogo=VALUES(luogo),
               played=VALUES(played), gol_casa=VALUES(gol_casa), gol_ospiti=VALUES(gol_ospiti),
               visibilita_subito=VALUES(visibilita_subito), annullata=VALUES(annullata)`,
            [
              requested, "amichevole", ek, String(a.id ?? ""), a.leva ?? null,
              a.data || null, a.orario ?? null,
              a.avversario ?? null,
              a.tipo === "trasferta" ? "trasferta" : (a.tipo === "casa" ? "casa" : null),
              a.luogo ?? null,
              a.played ? 1 : 0,
              Number(a.golCasa) || 0, Number(a.golOspiti) || 0,
              a.visibilitaSubito ? 1 : 0,
              a.annullata ? 1 : 0,
            ],
            a.stats || []
          );
        }

        await connR.commit();
      } catch (e: any) {
        await connR.rollback().catch(() => {});
        logger.error({ err: e?.message, societaId: requested }, "backfill-matches refresh transaction failed");
        return res.status(500).json({ error: "transaction_failed", detail: e?.message });
      } finally {
        connR.release();
      }

      return res.json({ dryRun: false, refresh: true, societaId: requested, counters: rc });
    }

    // 4) Calcolo / inserimento (modalità legacy / additiva, invariata)
    const counters = newCounters();
    const sample: Array<{ event_key: string; tipo: string }> = [];

    if (dryRun) {
      // ── Solo calcolo, niente scritture ──
      for (const t of tornei) {
        counters.tornei_inseriti += 1;
        for (const f of (t.fasi || [])) {
          counters.fasi_inserite += 1;
          for (const m of (f.partite || [])) {
            const ek = ekTorneo(t.id, f.id, m.id);
            if (existingKeys.has(ek)) { counters.matches_saltati_gia_presenti += 1; continue; }
            counters.matches_inseriti.torneo += 1;
            if (sample.length < 8) sample.push({ event_key: ek, tipo: "torneo" });
            for (const s of (m.stats || [])) {
              const pid = Number(s.playerId);
              if (!validPlayerIds.has(pid)) { counters.stats_saltate_player_mancante += 1; continue; }
              counters.stats_inserite += 1;
            }
          }
        }
      }
      for (const lv of Object.keys(campionato)) {
        const camp = campionato[lv];
        for (const m of (camp.partite || [])) {
          const ek = ekCamp(lv, m.id);
          if (existingKeys.has(ek)) { counters.matches_saltati_gia_presenti += 1; continue; }
          counters.matches_inseriti.campionato += 1;
          if (sample.length < 8) sample.push({ event_key: ek, tipo: "campionato" });
          for (const s of (m.stats || [])) {
            const pid = Number(s.playerId);
            if (!validPlayerIds.has(pid)) { counters.stats_saltate_player_mancante += 1; continue; }
            counters.stats_inserite += 1;
          }
        }
      }
      for (const a of amichevoli) {
        const ek = ekAmich(a.id);
        if (existingKeys.has(ek)) { counters.matches_saltati_gia_presenti += 1; continue; }
        counters.matches_inseriti.amichevole += 1;
        if (sample.length < 8) sample.push({ event_key: ek, tipo: "amichevole" });
        for (const s of (a.stats || [])) {
          const pid = Number(s.playerId);
          if (!validPlayerIds.has(pid)) { counters.stats_saltate_player_mancante += 1; continue; }
          counters.stats_inserite += 1;
        }
      }
      return res.json({ dryRun: true, societaId: requested, counters, sample });
    }

    // ── Modalita' reale: una sola transazione ──
    const conn: PoolConnection = await (pool as any).getConnection();
    try {
      await conn.beginTransaction();

      // 4a) Tornei + fasi + matches torneo
      for (const t of tornei) {
        const [ins] = (await conn.execute(
          `INSERT IGNORE INTO tornei
             (id, societa_id, nome, leva, luogo, data_inizio, data_fine,
              spareggio, squadre_partecipanti, squadre_mie_flag, convocati,
              convocazioni_per_partita, qual_per_girone, archiviato)
           VALUES (?,?,?,?,?,?,?,CAST(? AS JSON),CAST(? AS JSON),CAST(? AS JSON),CAST(? AS JSON),?,?,?)`,
          [
            String(t.id),
            requested,
            String(t.nome || ""),
            t.leva ?? null,
            t.luogo ?? null,
            t.dataInizio || null,
            t.dataFine || null,
            JSON.stringify(t.spareggio ?? null),
            JSON.stringify(t.squadrePartecipanti ?? null),
            JSON.stringify(t.squadreMieFlag ?? null),
            JSON.stringify(t.convocati ?? null),
            t.convocazioniPerPartita ? 1 : 0,
            t.qualPerGirone ?? null,
            t.archiviato ? 1 : 0,
          ]
        )) as [any, any];
        if ((ins as any).affectedRows > 0) counters.tornei_inseriti += 1;

        for (let fi = 0; fi < (t.fasi || []).length; fi++) {
          const f = t.fasi[fi];
          const [insF] = (await conn.execute(
            `INSERT IGNORE INTO tornei_fasi
               (id, torneo_id, nome, tipo, fase_gruppo, squadre, ordine)
             VALUES (?,?,?,?,?,CAST(? AS JSON),?)`,
            [
              String(f.id),
              String(t.id),
              f.nome ?? null,
              f.tipo ?? null,
              f.faseGruppo ?? null,
              JSON.stringify(f.squadre ?? null),
              fi,
            ]
          )) as [any, any];
          if ((insF as any).affectedRows > 0) counters.fasi_inserite += 1;

          for (const m of (f.partite || [])) {
            const ek = ekTorneo(t.id, f.id, m.id);
            if (existingKeys.has(ek)) { counters.matches_saltati_gia_presenti += 1; continue; }
            const [insM] = (await conn.execute(
              `INSERT INTO matches
                 (societa_id, tipo, event_key, legacy_match_id, leva, fase_id,
                  data, orario, casa, ospite, luogo, played, gol_casa, gol_ospiti,
                  visibilita_subito, bracket_round, bracket_pos)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
              [
                requested, "torneo", ek, String(m.id ?? ""), t.leva ?? null, String(f.id),
                m.data || null, m.orario ?? null,
                m.casa ?? null, m.ospite ?? null, m.luogo ?? null,
                m.played ? 1 : 0,
                Number(m.golCasa) || 0, Number(m.golOspiti) || 0,
                m.visibilitaSubito ? 1 : 0,
                m.bracketRound ?? null, m.bracketPos ?? null,
              ]
            )) as [any, any];
            const newMatchId = (insM as any).insertId as number;
            counters.matches_inseriti.torneo += 1;
            existingKeys.add(ek);
            // stats
            for (const s of (m.stats || [])) {
              const pid = Number(s.playerId);
              if (!validPlayerIds.has(pid)) { counters.stats_saltate_player_mancante += 1; continue; }
              await conn.execute(
                `INSERT INTO match_stats
                   (match_id, player_id, gol, assist, titolare, minuti, gialli, rossi, gol_sub, cs)
                 VALUES (?,?,?,?,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE
                   gol=VALUES(gol), assist=VALUES(assist), titolare=VALUES(titolare),
                   minuti=VALUES(minuti), gialli=VALUES(gialli), rossi=VALUES(rossi),
                   gol_sub=VALUES(gol_sub), cs=VALUES(cs)`,
                [
                  newMatchId, pid,
                  Number(s.gol) || 0, Number(s.assist) || 0, s.titolare ? 1 : 0,
                  Number(s.minuti) || 0, Number(s.gialli) || 0, Number(s.rossi) || 0,
                  Number(s.golSub) || 0, s.cs ? 1 : 0,
                ]
              );
              counters.stats_inserite += 1;
            }
          }
        }
      }

      // 4b) Campionato (per leva)
      for (const lv of Object.keys(campionato)) {
        const camp = campionato[lv];
        for (const m of (camp.partite || [])) {
          const ek = ekCamp(lv, m.id);
          if (existingKeys.has(ek)) { counters.matches_saltati_gia_presenti += 1; continue; }
          const [insM] = (await conn.execute(
            `INSERT INTO matches
               (societa_id, tipo, event_key, legacy_match_id, leva, giornata,
                data, orario, casa, ospite, luogo, played, gol_casa, gol_ospiti,
                visibilita_subito)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              requested, "campionato", ek, String(m.id ?? ""), lv,
              m.giornata ?? null,
              m.data || null, m.orario ?? null,
              m.casa ?? null, m.ospite ?? null, m.luogo ?? null,
              m.played ? 1 : 0,
              Number(m.golCasa) || 0, Number(m.golOspiti) || 0,
              m.visibilitaSubito ? 1 : 0,
            ]
          )) as [any, any];
          const newMatchId = (insM as any).insertId as number;
          counters.matches_inseriti.campionato += 1;
          existingKeys.add(ek);
          for (const s of (m.stats || [])) {
            const pid = Number(s.playerId);
            if (!validPlayerIds.has(pid)) { counters.stats_saltate_player_mancante += 1; continue; }
            await conn.execute(
              `INSERT INTO match_stats
                 (match_id, player_id, gol, assist, titolare, minuti, gialli, rossi, gol_sub, cs)
               VALUES (?,?,?,?,?,?,?,?,?,?)
               ON DUPLICATE KEY UPDATE
                 gol=VALUES(gol), assist=VALUES(assist), titolare=VALUES(titolare),
                 minuti=VALUES(minuti), gialli=VALUES(gialli), rossi=VALUES(rossi),
                 gol_sub=VALUES(gol_sub), cs=VALUES(cs)`,
              [
                newMatchId, pid,
                Number(s.gol) || 0, Number(s.assist) || 0, s.titolare ? 1 : 0,
                Number(s.minuti) || 0, Number(s.gialli) || 0, Number(s.rossi) || 0,
                Number(s.golSub) || 0, s.cs ? 1 : 0,
              ]
            );
            counters.stats_inserite += 1;
          }
        }
      }

      // 4c) Amichevoli
      for (const a of amichevoli) {
        const ek = ekAmich(a.id);
        if (existingKeys.has(ek)) { counters.matches_saltati_gia_presenti += 1; continue; }
        const [insM] = (await conn.execute(
          `INSERT INTO matches
             (societa_id, tipo, event_key, legacy_match_id, leva,
              data, orario, avversario, lato, luogo, played, gol_casa, gol_ospiti,
              visibilita_subito, annullata)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            requested, "amichevole", ek, String(a.id ?? ""), a.leva ?? null,
            a.data || null, a.orario ?? null,
            a.avversario ?? null,
            a.tipo === "trasferta" ? "trasferta" : (a.tipo === "casa" ? "casa" : null),
            a.luogo ?? null,
            a.played ? 1 : 0,
            Number(a.golCasa) || 0, Number(a.golOspiti) || 0,
            a.visibilitaSubito ? 1 : 0,
            a.annullata ? 1 : 0,
          ]
        )) as [any, any];
        const newMatchId = (insM as any).insertId as number;
        counters.matches_inseriti.amichevole += 1;
        existingKeys.add(ek);
        for (const s of (a.stats || [])) {
          const pid = Number(s.playerId);
          if (!validPlayerIds.has(pid)) { counters.stats_saltate_player_mancante += 1; continue; }
          await conn.execute(
            `INSERT INTO match_stats
               (match_id, player_id, gol, assist, titolare, minuti, gialli, rossi, gol_sub, cs)
             VALUES (?,?,?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
               gol=VALUES(gol), assist=VALUES(assist), titolare=VALUES(titolare),
               minuti=VALUES(minuti), gialli=VALUES(gialli), rossi=VALUES(rossi),
               gol_sub=VALUES(gol_sub), cs=VALUES(cs)`,
            [
              newMatchId, pid,
              Number(s.gol) || 0, Number(s.assist) || 0, s.titolare ? 1 : 0,
              Number(s.minuti) || 0, Number(s.gialli) || 0, Number(s.rossi) || 0,
              Number(s.golSub) || 0, s.cs ? 1 : 0,
            ]
          );
          counters.stats_inserite += 1;
        }
      }

      await conn.commit();
    } catch (e: any) {
      await conn.rollback().catch(() => {});
      logger.error({ err: e?.message, societaId: requested }, "backfill-matches transaction failed");
      return res.status(500).json({ error: "transaction_failed", detail: e?.message });
    } finally {
      conn.release();
    }

    return res.json({ dryRun: false, societaId: requested, counters });
  } catch (e: any) {
    logger.error({ err: e?.message }, "POST backfill-matches error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

export default router;
