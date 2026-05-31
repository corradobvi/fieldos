import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";

const router = Router();

// Semantica: ESATTA replica di playerMatchStats (FE index.html:19623-19647).
// - presenze = numero di match con played=1 in cui il player ha una riga in match_stats.
// - somme gol/assist/minuti/gialli/rossi/gol_sub direttamente dai campi.
// - cs = conteggio dei match con cs=1.
// - breakdown per tipo: 'amichevole' | 'campionato' | 'torneo'.
// - filtro leva opzionale (?leva=<nome>).
// - filtro societa_id obbligatorio dal JWT.

type Bucket = {
  presenze: number; gol: number; assist: number; minuti: number;
  gialli: number; rossi: number; gol_sub: number; cs: number;
};

function zero(): Bucket {
  return { presenze: 0, gol: 0, assist: 0, minuti: 0, gialli: 0, rossi: 0, gol_sub: 0, cs: 0 };
}

function addRow(b: Bucket, row: any): void {
  b.presenze += Number(row.presenze) || 0;
  b.gol      += Number(row.gol)      || 0;
  b.assist   += Number(row.assist)   || 0;
  b.minuti   += Number(row.minuti)   || 0;
  b.gialli   += Number(row.gialli)   || 0;
  b.rossi    += Number(row.rossi)    || 0;
  b.gol_sub  += Number(row.gol_sub)  || 0;
  b.cs       += Number(row.cs)       || 0;
}

function sumBuckets(...bs: Bucket[]): Bucket {
  const out = zero();
  for (const b of bs) {
    out.presenze += b.presenze; out.gol += b.gol; out.assist += b.assist;
    out.minuti   += b.minuti;   out.gialli += b.gialli; out.rossi += b.rossi;
    out.gol_sub  += b.gol_sub;  out.cs += b.cs;
  }
  return out;
}

// Query base: aggregato per (player_id, tipo) sui match played=1 della società.
const AGG_SELECT = `
  SELECT ms.player_id,
         m.tipo,
         COUNT(DISTINCT m.id)                            AS presenze,
         COALESCE(SUM(ms.gol), 0)                        AS gol,
         COALESCE(SUM(ms.assist), 0)                     AS assist,
         COALESCE(SUM(ms.minuti), 0)                     AS minuti,
         COALESCE(SUM(ms.gialli), 0)                     AS gialli,
         COALESCE(SUM(ms.rossi), 0)                      AS rossi,
         COALESCE(SUM(ms.gol_sub), 0)                    AS gol_sub,
         COALESCE(SUM(CASE WHEN ms.cs = 1 THEN 1 ELSE 0 END), 0) AS cs
  FROM match_stats ms
  JOIN matches m ON m.id = ms.match_id
`;

// GET /api/v2/stats/player/:playerId?leva=<nome>
// Breakdown {amichevole, campionato, torneo} + totale per UN giocatore.
router.get("/stats/player/:playerId", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const playerId = Number(req.params.playerId);
  if (!Number.isFinite(playerId) || playerId <= 0) {
    return res.status(400).json({ error: "invalid_player_id" });
  }
  const leva = (req.query.leva as string | undefined) || undefined;

  try {
    const conds: string[] = ["m.societa_id = ?", "m.played = 1", "ms.player_id = ?"];
    const params: any[] = [societyId, playerId];
    if (leva) { conds.push("m.leva = ?"); params.push(leva); }

    const [rows] = (await pool.execute(
      `${AGG_SELECT}
       WHERE ${conds.join(" AND ")}
       GROUP BY ms.player_id, m.tipo`,
      params
    )) as [any[], any];

    const out: { [k: string]: Bucket } = {
      amichevole: zero(), campionato: zero(), torneo: zero(),
    };
    for (const r of rows as any[]) {
      if (r.tipo === "amichevole" || r.tipo === "campionato" || r.tipo === "torneo") {
        addRow(out[r.tipo], r);
      }
    }
    return res.json({
      player_id: playerId,
      leva: leva ?? null,
      amichevole: out.amichevole,
      campionato: out.campionato,
      torneo:     out.torneo,
      totale:     sumBuckets(out.amichevole, out.campionato, out.torneo),
    });
  } catch (e: any) {
    logger.error({ err: e }, "GET stats/player error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/stats/leva?leva=<nome>
// Aggregato per TUTTI i giocatori di una leva. CHIUDE il bug della lista mister desktop:
// replica la stessa semantica di playerMatchStats, inclusi i gol nei tornei.
// Restituisce SEMPRE il player_id, anche se ha 0 stat in qualche tipo.
router.get("/stats/leva", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const leva = (req.query.leva as string | undefined) || undefined;
  if (!leva) return res.status(400).json({ error: "leva_required" });

  try {
    // Lista players della leva — per garantire che la risposta includa anche giocatori senza match.
    const [players] = (await pool.execute(
      `SELECT id FROM players WHERE society_id = ? AND leva = ? ORDER BY cognome, nome`,
      [societyId, leva]
    )) as [any[], any];

    // Aggregato per (player_id, tipo).
    const conds: string[] = ["m.societa_id = ?", "m.played = 1", "m.leva = ?"];
    const params: any[] = [societyId, leva];
    const [rows] = (await pool.execute(
      `${AGG_SELECT}
       WHERE ${conds.join(" AND ")}
       GROUP BY ms.player_id, m.tipo`,
      params
    )) as [any[], any];

    const map: Record<number, { amichevole: Bucket; campionato: Bucket; torneo: Bucket }> = {};
    for (const p of players as any[]) {
      map[p.id] = { amichevole: zero(), campionato: zero(), torneo: zero() };
    }
    for (const r of rows as any[]) {
      const pid = Number(r.player_id);
      if (!map[pid]) map[pid] = { amichevole: zero(), campionato: zero(), torneo: zero() };
      if (r.tipo === "amichevole" || r.tipo === "campionato" || r.tipo === "torneo") {
        addRow(map[pid][r.tipo as "amichevole" | "campionato" | "torneo"], r);
      }
    }

    const out = Object.keys(map).map(k => {
      const pid = Number(k);
      const b = map[pid];
      return {
        player_id: pid,
        amichevole: b.amichevole,
        campionato: b.campionato,
        torneo:     b.torneo,
        totale:     sumBuckets(b.amichevole, b.campionato, b.torneo),
      };
    });

    return res.json({ leva, players: out });
  } catch (e: any) {
    logger.error({ err: e }, "GET stats/leva error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
