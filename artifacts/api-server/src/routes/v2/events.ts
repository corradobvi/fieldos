import { Router } from "express";
import { randomUUID } from "crypto";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";

const router = Router();
const WRITE_ROLES = ["admin", "allenatore", "dirigente", "mister_admin"];

// ── Date helpers ──────────────────────────────────────────────────────────────

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDate(s: string): Date {
  const [y, m, dd] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, dd));
}

function todayStr(): string {
  return ymd(new Date());
}

/**
 * Espande un evento ricorrente master (ricorrente=1) nelle date di occorrenza
 * che ricadono nel range [da, a].
 * freq: 'daily' | 'weekly' | 'monthly'
 * giorni: CSV di numeri 0-6 (getDay: 0=dom, 1=lun, ..., 6=sab) — solo per weekly
 */
function expandRecurrences(ev: {
  data_inizio: string;
  fino_al: string | null;
  freq: string | null;
  giorni: string | null;
}, da: string, a: string): string[] {
  const evStart = parseDate(ev.data_inizio);
  const evEnd   = ev.fino_al ? parseDate(ev.fino_al) : parseDate(a);
  const rangeS  = parseDate(da) > evStart ? parseDate(da) : new Date(evStart);
  const rangeE  = parseDate(a)  < evEnd   ? parseDate(a)  : new Date(evEnd);
  if (rangeS > rangeE) return [];

  const freq   = ev.freq || "none";
  const result: string[] = [];

  if (freq === "daily") {
    for (let cur = new Date(rangeS); cur <= rangeE; cur = addDays(cur, 1))
      result.push(ymd(cur));
    return result;
  }

  if (freq === "weekly") {
    const days = (ev.giorni || "")
      .split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 6);
    if (!days.length) return [];
    for (let cur = new Date(rangeS); cur <= rangeE; cur = addDays(cur, 1))
      if (days.includes(cur.getUTCDay())) result.push(ymd(cur));
    return result;
  }

  if (freq === "monthly") {
    const targetDay = evStart.getUTCDate();
    for (let cur = new Date(rangeS); cur <= rangeE; cur = addDays(cur, 1))
      if (cur.getUTCDate() === targetDay) result.push(ymd(cur));
    return result;
  }

  return [];
}

// ── Shared helpers ────────────────────────────────────────────────────────────

async function fetchLeveForEvents(
  ids: number[]
): Promise<Record<number, { id: number; nome: string }[]>> {
  if (!ids.length) return {};
  const ph = ids.map(() => "?").join(",");
  const [rows] = (await pool.execute(
    `SELECT el.event_id, l.id, l.nome
     FROM event_leve el JOIN leve l ON l.id = el.leva_id
     WHERE el.event_id IN (${ph})`,
    ids
  )) as [any[], any];
  const map: Record<number, { id: number; nome: string }[]> = {};
  for (const r of rows) {
    if (!map[r.event_id]) map[r.event_id] = [];
    map[r.event_id].push({ id: r.id, nome: r.nome });
  }
  return map;
}

async function fetchAllenamentiForEvents(
  ids: number[]
): Promise<Record<number, any>> {
  if (!ids.length) return {};
  const ph = ids.map(() => "?").join(",");
  const [rows] = (await pool.execute(
    `SELECT a.event_id, a.id AS allenamento_id,
            a.titolo AS allenamento_titolo, a.obiettivo AS allenamento_obiettivo,
            a.durata_totale_minuti AS allenamento_durata_totale_minuti,
            a.visibilita_genitori AS allenamento_visibilita_genitori,
            (SELECT COUNT(*) FROM allenamento_sessioni s WHERE s.allenamento_id = a.id) AS allenamento_num_sessioni
     FROM allenamenti a WHERE a.event_id IN (${ph})`,
    ids
  )) as [any[], any];
  const map: Record<number, any> = {};
  for (const r of rows) map[r.event_id] = r;
  return map;
}

async function insertLeveForEvent(conn: any, eventId: number, leve: any[]): Promise<void> {
  for (const levaId of leve) {
    await conn.execute(
      "INSERT IGNORE INTO event_leve (event_id, leva_id) VALUES (?, ?)",
      [eventId, parseInt(levaId)]
    );
  }
}

// ── GET /api/v2/events ────────────────────────────────────────────────────────
// Params: leva_id, da, a, tipi (CSV), expand_recurrences (default true)
// Retrocompat: month, year, leva

router.get("/events", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const {
    leva_id, tipi,
    da = todayStr(),
    a  = ymd(addDays(new Date(), 90)),
    expand_recurrences = "true",
    month, year, leva,            // retrocompat
  } = req.query as Record<string, string>;

  const doExpand = expand_recurrences !== "false";

  try {
    const conds: string[] = ["e.society_id = ?"];
    const params: any[]   = [societyId];

    if (tipi) {
      const arr = tipi.split(",").map(t => t.trim()).filter(Boolean);
      if (arr.length) {
        conds.push(`e.tipo IN (${arr.map(() => "?").join(",")})`);
        params.push(...arr);
      }
    }

    if (month && year) {
      // Retrocompat: filtra per mese/anno
      conds.push("MONTH(e.data_inizio) = ? AND YEAR(e.data_inizio) = ?");
      params.push(parseInt(month), parseInt(year));
    } else {
      // Range: non-ricorrenti con data nel range;
      // ricorrenti master con inizio <= fine range e fine_serie >= inizio range
      conds.push(
        "((e.ricorrente = 0 AND e.data_inizio BETWEEN ? AND ?)" +
        " OR (e.ricorrente = 1 AND e.data_inizio <= ? AND (e.fino_al IS NULL OR e.fino_al >= ?)))"
      );
      params.push(da, a, a, da);
    }

    if (leva_id) {
      conds.push("EXISTS (SELECT 1 FROM event_leve el WHERE el.event_id = e.id AND el.leva_id = ?)");
      params.push(parseInt(leva_id));
    } else if (leva) {
      // Retrocompat: filtra per nome leva legacy
      conds.push("(e.leva = ? OR e.leva IS NULL)");
      params.push(leva);
    }

    const [rows] = (await pool.execute(
      `SELECT e.id, e.tipo, e.titolo, e.luogo,
              e.data_inizio, e.ora_inizio, e.ora_fine,
              e.note, e.ricorrente, e.freq, e.giorni, e.fino_al,
              e.recur_group_id, e.created_at
       FROM events e WHERE ${conds.join(" AND ")}
       ORDER BY e.data_inizio, e.ora_inizio`,
      params
    )) as [any[], any];

    if (!rows.length) return res.json([]);

    const eventIds = rows.map((r: any) => r.id as number);
    const leveMap  = await fetchLeveForEvents(eventIds);
    const allMap   = await fetchAllenamentiForEvents(eventIds);

    const occurrences: any[] = [];

    for (const ev of rows) {
      const leve    = leveMap[ev.id] || [];
      const allInfo = allMap[ev.id]  || null;
      const allenamento_id = allInfo?.allenamento_id ?? null;
      const allenamentoFields = {
        allenamento_id,
        allenamento_titolo:               allInfo?.allenamento_titolo               ?? null,
        allenamento_obiettivo:            allInfo?.allenamento_obiettivo             ?? null,
        allenamento_durata_totale_minuti: allInfo?.allenamento_durata_totale_minuti  ?? null,
        allenamento_num_sessioni:         allInfo?.allenamento_num_sessioni          ?? 0,
        allenamento_visibilita_genitori:  allInfo ? !!allInfo.allenamento_visibilita_genitori : false,
      };

      if (ev.ricorrente && doExpand && !month) {
        // Master record ricorrente: espandi in occorrenze
        const dates = expandRecurrences(
          { data_inizio: ev.data_inizio, fino_al: ev.fino_al, freq: ev.freq, giorni: ev.giorni },
          da, a
        );
        for (const d of dates) {
          occurrences.push({
            event_id: ev.id,
            recur_group_id: ev.recur_group_id,
            tipo: ev.tipo, titolo: ev.titolo, leve,
            data: d,
            ora_inizio: ev.ora_inizio, ora_fine: ev.ora_fine,
            luogo: ev.luogo, note: ev.note,
            is_recurring_occurrence: true,
            ...allenamentoFields,
          });
        }
      } else {
        occurrences.push({
          event_id: ev.id,
          recur_group_id: ev.recur_group_id,
          tipo: ev.tipo, titolo: ev.titolo, leve,
          data: ev.data_inizio,
          ora_inizio: ev.ora_inizio, ora_fine: ev.ora_fine,
          luogo: ev.luogo, note: ev.note,
          is_recurring_occurrence: false,
          ...allenamentoFields,
        });
      }
    }

    occurrences.sort((a, b) =>
      a.data < b.data ? -1 : a.data > b.data ? 1 :
      (a.ora_inizio || "").localeCompare(b.ora_inizio || "")
    );

    return res.json(occurrences);
  } catch (e: any) {
    logger.error({ err: e }, "GET events error");
    return res.status(500).json({ error: "server_error" });
  }
});

// ── GET /api/v2/events/:id ────────────────────────────────────────────────────

router.get("/events/:id", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [rows] = (await pool.execute(
      "SELECT * FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any[], any];
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    const ev = rows[0];
    const leveMap = await fetchLeveForEvents([ev.id]);
    return res.json({ ...ev, leve: leveMap[ev.id] || [] });
  } catch (e: any) {
    logger.error({ err: e }, "GET events/:id error");
    return res.status(500).json({ error: "server_error" });
  }
});

// ── POST /api/v2/events ───────────────────────────────────────────────────────
// Se ricorrente=true + finoAl + freq: crea N occorrenze individuali con stesso recur_group_id.
// Se ricorrente=true senza finoAl (open-ended): crea un master record; GET espande.
// Se ricorrente=false: crea singolo evento.

router.post("/events", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const {
    tipo, titolo, leve = [], luogo,
    dataInizio, oraInizio, oraFine, note,
    ricorrente = false, freq, giorni, finoAl,
  } = req.body as Record<string, any>;

  if (!tipo || !titolo) return res.status(400).json({ error: "tipo_titolo_required" });
  if (!Array.isArray(leve)) return res.status(400).json({ error: "leve_must_be_array" });

  const conn = await (pool as any).getConnection();
  try {
    await conn.beginTransaction();

    if (ricorrente && finoAl && freq) {
      // N occorrenze individuali (ricorrente=0 su ogni riga, stesso recur_group_id)
      const recurGroupId = randomUUID();
      const dates = expandRecurrences(
        { data_inizio: dataInizio, fino_al: finoAl, freq, giorni: giorni ?? null },
        dataInizio, finoAl
      );
      if (!dates.length) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: "nessuna_occorrenza_nel_range" });
      }

      const ids: number[] = [];
      for (const d of dates) {
        const [r] = (await conn.execute(
          `INSERT INTO events
             (society_id, tipo, titolo, luogo, data_inizio, ora_inizio, ora_fine,
              note, ricorrente, freq, giorni, fino_al, recur_group_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
          [societyId, tipo, titolo, luogo ?? null, d,
           oraInizio ?? null, oraFine ?? null, note ?? null,
           freq, giorni ?? null, finoAl, recurGroupId]
        )) as [any, any];
        ids.push(r.insertId);
      }
      for (const eid of ids) await insertLeveForEvent(conn, eid, leve);

      await conn.commit();
      return res.status(201).json({
        recur_group_id: recurGroupId,
        total_created: ids.length,
        first_event_id: ids[0],
      });

    } else {
      // Singolo evento o master ricorrente open-ended
      const recurGroupId = ricorrente ? randomUUID() : null;
      const [r] = (await conn.execute(
        `INSERT INTO events
           (society_id, tipo, titolo, luogo, data_inizio, ora_inizio, ora_fine,
            note, ricorrente, freq, giorni, fino_al, recur_group_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [societyId, tipo, titolo, luogo ?? null, dataInizio ?? null,
         oraInizio ?? null, oraFine ?? null, note ?? null,
         ricorrente ? 1 : 0, freq ?? null, giorni ?? null, finoAl ?? null, recurGroupId]
      )) as [any, any];
      const eventId = r.insertId;
      await insertLeveForEvent(conn, eventId, leve);

      await conn.commit();
      const [rows] = (await pool.execute(
        "SELECT * FROM events WHERE id = ?", [eventId]
      )) as [any[], any];
      const leveMap = await fetchLeveForEvents([eventId]);
      return res.status(201).json({ ...rows[0], leve: leveMap[eventId] || [] });
    }

  } catch (e: any) {
    await conn.rollback();
    logger.error({ err: e }, "POST event error");
    return res.status(500).json({ error: "server_error" });
  } finally {
    conn.release();
  }
});

// ── PUT /api/v2/events/:id/series/from-here ───────────────────────────────────
// Aggiorna tutti gli eventi della serie con data_inizio >= data dell'evento :id

router.put("/events/:id/series/from-here", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const conn = await (pool as any).getConnection();
  try {
    const [evRows] = (await conn.execute(
      "SELECT recur_group_id, data_inizio FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any[], any];
    if (!evRows.length || !evRows[0].recur_group_id) {
      conn.release();
      return res.status(404).json({ error: "serie_non_trovata" });
    }
    const { recur_group_id: groupId, data_inizio: fromDate } = evRows[0];

    await conn.beginTransaction();
    const { tipo, titolo, leve, luogo, oraInizio, oraFine, note, freq, giorni, finoAl } =
      req.body as Record<string, any>;

    const upd: string[] = [];
    const params: any[] = [];
    if (tipo      !== undefined) { upd.push("tipo = ?");       params.push(tipo); }
    if (titolo    !== undefined) { upd.push("titolo = ?");     params.push(titolo); }
    if (luogo     !== undefined) { upd.push("luogo = ?");      params.push(luogo ?? null); }
    if (oraInizio !== undefined) { upd.push("ora_inizio = ?"); params.push(oraInizio ?? null); }
    if (oraFine   !== undefined) { upd.push("ora_fine = ?");   params.push(oraFine ?? null); }
    if (note      !== undefined) { upd.push("note = ?");       params.push(note ?? null); }
    if (freq      !== undefined) { upd.push("freq = ?");       params.push(freq ?? null); }
    if (giorni    !== undefined) { upd.push("giorni = ?");     params.push(giorni ?? null); }
    if (finoAl    !== undefined) { upd.push("fino_al = ?");    params.push(finoAl ?? null); }

    if (upd.length) {
      params.push(groupId, fromDate, societyId);
      await conn.execute(
        `UPDATE events SET ${upd.join(", ")}
         WHERE recur_group_id = ? AND data_inizio >= ? AND society_id = ?`,
        params
      );
    }

    if (Array.isArray(leve)) {
      const [futureEvs] = (await conn.execute(
        "SELECT id FROM events WHERE recur_group_id = ? AND data_inizio >= ? AND society_id = ?",
        [groupId, fromDate, societyId]
      )) as [any[], any];
      for (const ev of futureEvs) {
        await conn.execute("DELETE FROM event_leve WHERE event_id = ?", [ev.id]);
        await insertLeveForEvent(conn, ev.id, leve);
      }
    }

    await conn.commit();
    return res.json({ ok: true });
  } catch (e: any) {
    await conn.rollback();
    logger.error({ err: e }, "PUT events/:id/series/from-here error");
    return res.status(500).json({ error: "server_error" });
  } finally {
    conn.release();
  }
});

// ── PUT /api/v2/events/:id/series ─────────────────────────────────────────────
// Aggiorna TUTTI gli eventi con stesso recur_group_id

router.put("/events/:id/series", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const conn = await (pool as any).getConnection();
  try {
    const [evRows] = (await conn.execute(
      "SELECT recur_group_id FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any[], any];
    if (!evRows.length || !evRows[0].recur_group_id) {
      conn.release();
      return res.status(404).json({ error: "serie_non_trovata" });
    }
    const groupId = evRows[0].recur_group_id as string;

    await conn.beginTransaction();
    const { tipo, titolo, leve, luogo, oraInizio, oraFine, note, freq, giorni, finoAl } =
      req.body as Record<string, any>;

    const upd: string[] = [];
    const params: any[] = [];
    if (tipo      !== undefined) { upd.push("tipo = ?");       params.push(tipo); }
    if (titolo    !== undefined) { upd.push("titolo = ?");     params.push(titolo); }
    if (luogo     !== undefined) { upd.push("luogo = ?");      params.push(luogo ?? null); }
    if (oraInizio !== undefined) { upd.push("ora_inizio = ?"); params.push(oraInizio ?? null); }
    if (oraFine   !== undefined) { upd.push("ora_fine = ?");   params.push(oraFine ?? null); }
    if (note      !== undefined) { upd.push("note = ?");       params.push(note ?? null); }
    if (freq      !== undefined) { upd.push("freq = ?");       params.push(freq ?? null); }
    if (giorni    !== undefined) { upd.push("giorni = ?");     params.push(giorni ?? null); }
    if (finoAl    !== undefined) { upd.push("fino_al = ?");    params.push(finoAl ?? null); }

    if (upd.length) {
      params.push(groupId, societyId);
      await conn.execute(
        `UPDATE events SET ${upd.join(", ")}
         WHERE recur_group_id = ? AND society_id = ?`,
        params
      );
    }

    if (Array.isArray(leve)) {
      const [allEvs] = (await conn.execute(
        "SELECT id FROM events WHERE recur_group_id = ? AND society_id = ?",
        [groupId, societyId]
      )) as [any[], any];
      for (const ev of allEvs) {
        await conn.execute("DELETE FROM event_leve WHERE event_id = ?", [ev.id]);
        await insertLeveForEvent(conn, ev.id, leve);
      }
    }

    await conn.commit();
    return res.json({ ok: true });
  } catch (e: any) {
    await conn.rollback();
    logger.error({ err: e }, "PUT events/:id/series error");
    return res.status(500).json({ error: "server_error" });
  } finally {
    conn.release();
  }
});

// ── PUT /api/v2/events/:id ────────────────────────────────────────────────────
// Aggiorna singolo evento

router.put("/events/:id", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const conn = await (pool as any).getConnection();
  try {
    await conn.beginTransaction();
    const { tipo, titolo, leve, luogo, dataInizio, oraInizio, oraFine, note,
            ricorrente, freq, giorni, finoAl } = req.body as Record<string, any>;

    const upd: string[] = [];
    const params: any[] = [];
    if (tipo        !== undefined) { upd.push("tipo = ?");        params.push(tipo); }
    if (titolo      !== undefined) { upd.push("titolo = ?");      params.push(titolo); }
    if (luogo       !== undefined) { upd.push("luogo = ?");       params.push(luogo ?? null); }
    if (dataInizio  !== undefined) { upd.push("data_inizio = ?"); params.push(dataInizio ?? null); }
    if (oraInizio   !== undefined) { upd.push("ora_inizio = ?");  params.push(oraInizio ?? null); }
    if (oraFine     !== undefined) { upd.push("ora_fine = ?");    params.push(oraFine ?? null); }
    if (note        !== undefined) { upd.push("note = ?");        params.push(note ?? null); }
    if (ricorrente  !== undefined) { upd.push("ricorrente = ?");  params.push(ricorrente ? 1 : 0); }
    if (freq        !== undefined) { upd.push("freq = ?");        params.push(freq ?? null); }
    if (giorni      !== undefined) { upd.push("giorni = ?");      params.push(giorni ?? null); }
    if (finoAl      !== undefined) { upd.push("fino_al = ?");     params.push(finoAl ?? null); }

    if (upd.length) {
      params.push(req.params.id, societyId);
      const [r] = (await conn.execute(
        `UPDATE events SET ${upd.join(", ")} WHERE id = ? AND society_id = ?`, params
      )) as [any, any];
      if (!r.affectedRows) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ error: "not_found" });
      }
    }

    if (Array.isArray(leve)) {
      await conn.execute("DELETE FROM event_leve WHERE event_id = ?", [req.params.id]);
      await insertLeveForEvent(conn, parseInt(req.params.id), leve);
    }

    await conn.commit();
    return res.json({ ok: true });
  } catch (e: any) {
    await conn.rollback();
    logger.error({ err: e }, "PUT event error");
    return res.status(500).json({ error: "server_error" });
  } finally {
    conn.release();
  }
});

// ── DELETE /api/v2/events/:id/series/from-here ────────────────────────────────

router.delete("/events/:id/series/from-here", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [evRows] = (await pool.execute(
      "SELECT recur_group_id, data_inizio FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any[], any];
    if (!evRows.length || !evRows[0].recur_group_id)
      return res.status(404).json({ error: "serie_non_trovata" });
    const { recur_group_id: groupId, data_inizio: fromDate } = evRows[0];

    const [r] = (await pool.execute(
      "DELETE FROM events WHERE recur_group_id = ? AND data_inizio >= ? AND society_id = ?",
      [groupId, fromDate, societyId]
    )) as [any, any];
    return res.json({ ok: true, deleted: r.affectedRows });
  } catch (e: any) {
    logger.error({ err: e }, "DELETE events/:id/series/from-here error");
    return res.status(500).json({ error: "server_error" });
  }
});

// ── DELETE /api/v2/events/:id/series ─────────────────────────────────────────

router.delete("/events/:id/series", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [evRows] = (await pool.execute(
      "SELECT recur_group_id FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any[], any];
    if (!evRows.length || !evRows[0].recur_group_id)
      return res.status(404).json({ error: "serie_non_trovata" });
    const groupId = evRows[0].recur_group_id as string;

    const [r] = (await pool.execute(
      "DELETE FROM events WHERE recur_group_id = ? AND society_id = ?",
      [groupId, societyId]
    )) as [any, any];
    return res.json({ ok: true, deleted: r.affectedRows });
  } catch (e: any) {
    logger.error({ err: e }, "DELETE events/:id/series error");
    return res.status(500).json({ error: "server_error" });
  }
});

// ── DELETE /api/v2/events/:id ─────────────────────────────────────────────────

router.delete("/events/:id", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [r] = (await pool.execute(
      "DELETE FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any, any];
    if (!r.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "DELETE event error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
