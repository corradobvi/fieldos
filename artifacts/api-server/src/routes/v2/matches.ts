import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";

const router = Router();

// GET /api/v2/matches?tipo=campionato|torneo|amichevole&leva=<nome>
// Lista dei match della società. JOIN opzionale con tornei_fasi/tornei per arricchire i match torneo.
router.get("/matches", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const tipo = (req.query.tipo as string | undefined) || undefined;
  const leva = (req.query.leva as string | undefined) || undefined;

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

export default router;
