import { Router } from "express";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { sendPushToUsers, societyKeyFor } from "../../lib/push-sender";
import { resolveRecipients } from "../../lib/recipient-resolver";
import { addNotificaToBlob } from "./minors";

const router = Router();

// POST /api/v2/convocazioni/notifica — notifica creazione/aggiornamento convocazione.
//
// Cablaggio resolver unico per evento convocazione (stessa Opzione B di
// quota/documento, hash 49e5294/baf6d9c): le convocazioni vivono nel blob FE
// (state.convocazioni[]), non in MySQL. Il FE costruisce title/body
// personalizzati per player (es. "📋 Mario Rossi CONVOCATO/A") e passa la
// lista al BE che risolve i destinatari via resolveRecipients('convocazione').
//
// SCOPE da matrice (recipient-resolver.ts EVENT_AUDIENCE.convocazione):
// tutoriConvocati → tutori dei SOLI player convocati (NON l'intera leva).
// Sender escluso. Per ogni item passiamo convocatiPlayerIds:[playerId]
// così il resolver agganciamento per singolo player (title personalizzato
// con nome+cognome del convocato — UX importante, perde senso unificare).
//
// Body: { convocazioni: Array<{
//          playerId: number, title: string, body: string,
//          eventId?: any, convocazioneId?: any
//        }> }
// Risposta: { ok: true, notificati: number }
router.post("/convocazioni/notifica",
  requireAuth,
  requireRole("admin", "allenatore", "mister", "dirigente", "mister_admin"),
  async (req, res) => {
    const { societyId, userId } = req.jwtUser!;
    const body = req.body as { convocazioni?: unknown };

    if (!Array.isArray(body?.convocazioni) || !body!.convocazioni!.length) {
      return res.status(400).json({ error: "convocazioni_required", detail: "body.convocazioni deve essere un array non vuoto" });
    }

    // Sanifica + cap 200 (una convocazione raramente supera 30 player; 200 e' margine ampio)
    const items: Array<{ playerId: number; title: string; body: string; eventId: any; convocazioneId: any }> = [];
    for (const raw of body!.convocazioni!) {
      const pid = Number((raw as any)?.playerId);
      const title = String((raw as any)?.title || "").slice(0, 200);
      const bodyTxt = String((raw as any)?.body || "").slice(0, 500);
      const eventId = (raw as any)?.eventId ?? null;
      const convocazioneId = (raw as any)?.convocazioneId ?? null;
      if (!Number.isFinite(pid) || pid <= 0 || !title.trim()) continue;
      items.push({ playerId: pid, title, body: bodyTxt, eventId, convocazioneId });
      if (items.length >= 200) break;
    }
    if (!items.length) return res.json({ ok: true, notificati: 0 });

    let notificati = 0;
    for (const c of items) {
      try {
        const ids = await resolveRecipients("convocazione", {
          societyId,
          convocatiPlayerIds: [c.playerId],
          senderUserId: userId,
        });
        if (!ids.length) continue;
        sendPushToUsers(ids, societyKeyFor(societyId), {
          title: c.title,
          body:  c.body,
          tag:   "convocazione",
        }, "notify_convocazioni").catch((e: any) =>
          logger.warn({ err: e?.message, playerId: c.playerId }, "convocazioni/notifica: push error")
        );
        addNotificaToBlob(societyId, ids, {
          type:           "convocazione",
          title:          c.title,
          body:           c.body,
          eventId:        c.eventId,
          convocazioneId: c.convocazioneId,
        }).catch(() => { /* gia' loggato dentro helper */ });
        notificati++;
      } catch (e: any) {
        logger.warn({ err: e?.message, playerId: c.playerId }, "convocazioni/notifica: item failed");
      }
    }

    return res.json({ ok: true, notificati });
  }
);

export default router;
