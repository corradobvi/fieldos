import { Router } from "express";
import type { Request } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { requirePermission } from "../../lib/permissions";
import { requireLeva } from "../../lib/leva-guard";
import { sendPushToUsers, societyKeyFor } from "../../lib/push-sender";
import { resolveRecipients } from "../../lib/recipient-resolver";
import { addNotificaToBlob } from "./minors";

const router = Router();

// Resolver leva: player.leva via body.playerId
async function _levaFromPlayerInBody(req: Request): Promise<string | null> {
  const pid = Number((req.body as any)?.playerId);
  if (!Number.isFinite(pid) || pid <= 0) return null;
  const [rows] = (await pool.execute(
    "SELECT leva FROM players WHERE id = ? AND society_id = ? LIMIT 1",
    [pid, req.jwtUser!.societyId]
  )) as [any[], any];
  return rows.length && rows[0].leva ? String(rows[0].leva) : null;
}

// Resolver leva via body.eventId.
// FIX N1: gli eventi creati via POST /api/v2/events popolano `event_leve`
// (tabella M2M) MA NON `events.leva` (colonna single-value legacy). Il vecchio
// resolver leggeva solo `events.leva` → 400 `leva_required` su ogni evento
// multi-leva moderno, bloccando POST /presenze/bulk per allenatore/mister/etc.
// Strategia: prima lookup in `event_leve` (prendiamo la prima leva associata),
// poi fallback su `events.leva` per retrocompatibilità con eventi legacy.
async function _levaFromEventInBody(req: Request): Promise<string | null> {
  const eid = Number((req.body as any)?.eventId);
  if (!Number.isFinite(eid) || eid <= 0) return null;
  const societyId = req.jwtUser!.societyId;
  // 1) event_leve M2M (path moderno)
  const [m2m] = (await pool.execute(
    `SELECT l.nome
       FROM event_leve el
       JOIN leve   l ON l.id = el.leva_id
       JOIN events e ON e.id = el.event_id AND e.society_id = ?
      WHERE el.event_id = ?
      ORDER BY l.ordine, l.nome
      LIMIT 1`,
    [societyId, eid]
  )) as [any[], any];
  if (m2m.length && m2m[0].nome) return String(m2m[0].nome);
  // 2) Fallback legacy: events.leva (eventi pre-migrazione)
  const [rows] = (await pool.execute(
    "SELECT leva FROM events WHERE id = ? AND society_id = ? LIMIT 1",
    [eid, societyId]
  )) as [any[], any];
  return rows.length && rows[0].leva ? String(rows[0].leva) : null;
}

// GET /api/v2/presenze?eventId=X
router.get("/presenze", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { eventId } = req.query as { eventId?: string };
  if (!eventId) return res.status(400).json({ error: "eventId_required" });

  try {
    const [rows] = (await pool.execute(
      `SELECT pr.id, pr.player_id, pr.event_id, pr.stato, pr.nota, pr.created_at,
              p.nome, p.cognome, p.numero, p.leva
       FROM presenze pr
       JOIN players p ON p.id = pr.player_id
       JOIN events e ON e.id = pr.event_id AND e.society_id = ?
       WHERE pr.event_id = ?
       ORDER BY p.cognome, p.nome`,
      [societyId, eventId]
    )) as [any[], any];
    return res.json(rows);
  } catch (e: any) {
    logger.error({ err: e }, "GET presenze error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/presenze — upsert singola presenza
router.post("/presenze", requireAuth, requireRole("admin", "allenatore", "mister", "dirigente", "mister_admin", "preparatore_portieri"), requirePermission("gestione_presenze"), requireLeva(_levaFromPlayerInBody), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { playerId, eventId, stato, nota } = req.body as Record<string, any>;
  if (!playerId || !eventId || !stato) return res.status(400).json({ error: "missing_fields" });

  try {
    // Verify the event belongs to this society
    const [evCheck] = (await pool.execute(
      "SELECT id FROM events WHERE id = ? AND society_id = ?", [eventId, societyId]
    )) as [any[], any];
    if (!evCheck.length) return res.status(403).json({ error: "forbidden" });

    await pool.execute(
      `INSERT INTO presenze (player_id, event_id, stato, nota)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE stato = VALUES(stato), nota = VALUES(nota)`,
      [playerId, eventId, stato, nota ?? null]
    );
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "POST presenza error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/presenze/bulk — salva presenze di un intero evento
router.post("/presenze/bulk", requireAuth, requireRole("admin", "allenatore", "mister", "dirigente", "mister_admin", "preparatore_portieri"), requirePermission("gestione_presenze"), requireLeva(_levaFromEventInBody), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { eventId, presenze } = req.body as { eventId: number; presenze: Array<{ playerId: number; stato: string; nota?: string }> };

  if (!eventId || !Array.isArray(presenze)) return res.status(400).json({ error: "missing_fields" });

  try {
    const [evCheck] = (await pool.execute(
      "SELECT id FROM events WHERE id = ? AND society_id = ?", [eventId, societyId]
    )) as [any[], any];
    if (!evCheck.length) return res.status(403).json({ error: "forbidden" });

    if (!presenze.length) return res.json({ ok: true, updated: 0 });

    const values = presenze.map(p => [p.playerId, eventId, p.stato, p.nota ?? null]);
    const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");
    const flat = values.flat();

    await pool.execute(
      `INSERT INTO presenze (player_id, event_id, stato, nota) VALUES ${placeholders}
       ON DUPLICATE KEY UPDATE stato = VALUES(stato), nota = VALUES(nota)`,
      flat
    );
    return res.json({ ok: true, updated: presenze.length });
  } catch (e: any) {
    logger.error({ err: e }, "POST presenze/bulk error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/presenze/notify-coaches — web push to coaches of a leva (fire-and-forget)
// Chiamato dal genitore che segnala assenza/revoca. NON aggiungere requireRole:
// il chiamante legittimo e' un genitore (no staff).
//
// CABLAGGIO RESOLVER UNICO (commit prima cablatura): destinatari risolti via
// resolveRecipients('avviso_assenza', { societyId, leva, senderUserId }). Lo
// scope 'avviso_assenza' include SOLO staffLeva (mister/allenatore/preparatore_
// portieri/dirigente leva-matched via _levaMatchClause). NIENTE admin/mister_admin
// catch-all (come da matrice). Sender sempre escluso dentro il resolver.
router.post("/presenze/notify-coaches", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { leva, title, body, tag } = req.body as Record<string, any>;
  if (!leva || !title) return res.status(400).json({ error: "missing_fields" });
  try {
    const ids = await resolveRecipients("avviso_assenza", {
      societyId,
      leva: String(leva),
      senderUserId: userId,
    });

    sendPushToUsers(ids, societyKeyFor(societyId), {
      title, body: body || "", url: "/presenze", tag: tag || "assenza",
    }).catch((e: any) => logger.warn({ err: e }, "notify-coaches push error"));

    // Scrivi anche card blob per i destinatari (frontend filtra per userId)
    addNotificaToBlob(societyId, ids, {
      type: "avviso_assenza",
      title: title || "📩 Avviso assenza",
      body: body || "",
    }).catch(() => {});

    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "POST presenze/notify-coaches error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
