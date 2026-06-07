import { Router } from "express";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { sendPushToUsers, societyKeyFor } from "../../lib/push-sender";
import { resolveRecipients } from "../../lib/recipient-resolver";
import { addNotificaToBlob } from "./minors";

const router = Router();

// Whitelist eventType ammessi su questo endpoint generico. Coincide con la
// matrice EVENT_AUDIENCE (recipient-resolver.ts), tutti scope = famiglieLeva.
// Niente staff, niente societa-wide: decisione di audience concordata e fissata.
const ALLOWED_EVENT_TYPES = new Set([
  "partita_fase1",
  "partita_fase2",
  "torneo_fase1",
  "torneo_fase2",
]);

// POST /api/v2/eventi/notifica-fase — endpoint generico per le notifiche di
// fase di partite e tornei (passo 1: solo BE, FE ancora chiama pushNotifica;
// lo spegnimento dei trigger FE arriva al passo 2).
//
// Trigger manuale lato admin/staff: una pressione bottone → una sola chiamata.
// Per i tornei (entita' padre): UNA chiamata, mai una per partita figlia
// — coerente con tornei.convocazioni_per_partita=false di default.
//
// Niente prefKey opt-out: notify_partite non esiste in NotifPrefKey/VALID_KEYS
// (notification-preferences.ts) — invio senza opt-out, come da brief.
//
// Body: { eventType, leva, title, body, refId? }
// Risposta: { ok: true, notificati: number }
router.post("/eventi/notifica-fase",
  requireAuth,
  requireRole("admin", "mister", "allenatore", "preparatore_portieri", "dirigente", "mister_admin"),
  async (req, res) => {
    const { societyId, userId } = req.jwtUser!;
    const body = req.body as { eventType?: unknown; leva?: unknown; title?: unknown; body?: unknown; refId?: unknown };

    const eventType = typeof body?.eventType === "string" ? body.eventType.trim() : "";
    const leva = typeof body?.leva === "string" ? body.leva.trim() : "";
    const title = String(body?.title || "").slice(0, 200).trim();
    const bodyTxt = String(body?.body || "").slice(0, 500);
    const refIdRaw = body?.refId;
    const refId =
      typeof refIdRaw === "string" ? refIdRaw.slice(0, 100) :
      typeof refIdRaw === "number" && Number.isFinite(refIdRaw) ? refIdRaw :
      null;

    if (!ALLOWED_EVENT_TYPES.has(eventType)) {
      return res.status(400).json({ error: "invalid_event_type", detail: "eventType deve essere uno di: partita_fase1, partita_fase2, torneo_fase1, torneo_fase2" });
    }
    if (!leva || !title) {
      return res.status(400).json({ error: "invalid_body", detail: "richiesti: leva e title non vuoti" });
    }

    let ids: number[] = [];
    try {
      ids = await resolveRecipients(eventType, {
        societyId,
        leva,
        senderUserId: userId,
      });
    } catch (e: any) {
      logger.warn({ err: e?.message, eventType, leva }, "eventi/notifica-fase: resolve error");
      return res.status(500).json({ error: "resolve_failed" });
    }

    if (!ids.length) return res.json({ ok: true, notificati: 0 });

    sendPushToUsers(ids, societyKeyFor(societyId), {
      title,
      body: bodyTxt,
      tag:  eventType,
    }).catch((e: any) =>
      logger.warn({ err: e?.message, eventType, leva }, "eventi/notifica-fase: push error")
    );
    // type='evento' per coerenza con le card calendario gia' presenti nel blob.
    // eventId preservato (refId puo' essere un match.id numerico o torneo UUID).
    addNotificaToBlob(societyId, ids, {
      type:    "evento",
      title,
      body:    bodyTxt,
      eventId: refId,
    }).catch(() => { /* gia' loggato dentro helper */ });

    return res.json({ ok: true, notificati: ids.length });
  }
);

export default router;
