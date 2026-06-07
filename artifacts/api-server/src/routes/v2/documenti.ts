import { Router } from "express";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { sendPushToUsers, societyKeyFor } from "../../lib/push-sender";
import { resolveRecipients } from "../../lib/recipient-resolver";
import { addNotificaToBlob } from "./minors";

const router = Router();

// POST /api/v2/documenti/notifica — alert certificato medico (scadenza/scaduto).
//
// Cablaggio resolver unico per evento documento (stessa Opzione B di quota,
// hash 49e5294): i documenti vivono nel blob FE (state.documenti[]), non in
// MySQL. Il FE filtra i player con cert in scadenza/scaduto e passa la lista
// al BE che risolve i destinatari via resolveRecipients('documento') e invia
// push web + card blob (addNotificaToBlob con CAS).
//
// Scope da matrice (recipient-resolver.ts EVENT_AUDIENCE.documento):
// tutoriGiocatore + societa → admin/mister_admin della società + genitori/nonni
// linkati al player via player_guardians. Sender escluso.
//
// docKey passa-through: il FE lo costruisce (es. "docrem_<pid>_<certId>_YYYYMMDD")
// e lo passa al BE; addNotificaToBlob lo scrive nella card così la dedup FE
// `notifiche.some(n => n.docKey === key)` continua a funzionare al login
// successivo (evita di re-inviare la stessa notifica più volte).
//
// Body: { documenti: Array<{ playerId: number, title: string, body: string, docKey?: string }> }
// Risposta: { ok: true, notificati: number }
router.post("/documenti/notifica",
  requireAuth,
  requireRole("admin", "dirigente", "mister_admin"),
  async (req, res) => {
    const { societyId, userId } = req.jwtUser!;
    const body = req.body as { documenti?: unknown };

    if (!Array.isArray(body?.documenti) || !body!.documenti!.length) {
      return res.status(400).json({ error: "documenti_required", detail: "body.documenti deve essere un array non vuoto" });
    }

    // Sanifica + cap 200 (volume < quote: 1 alert/giorno per player)
    const items: Array<{ playerId: number; title: string; body: string; docKey: string | null }> = [];
    for (const raw of body!.documenti!) {
      const pid = Number((raw as any)?.playerId);
      const title = String((raw as any)?.title || "").slice(0, 200);
      const bodyTxt = String((raw as any)?.body || "").slice(0, 500);
      const docKeyRaw = (raw as any)?.docKey;
      const docKey = (typeof docKeyRaw === "string" && docKeyRaw.trim()) ? docKeyRaw.slice(0, 120) : null;
      if (!Number.isFinite(pid) || pid <= 0 || !title.trim()) continue;
      items.push({ playerId: pid, title, body: bodyTxt, docKey });
      if (items.length >= 200) break;
    }
    if (!items.length) return res.json({ ok: true, notificati: 0 });

    let notificati = 0;
    for (const d of items) {
      try {
        const ids = await resolveRecipients("documento", {
          societyId,
          playerId: d.playerId,
          senderUserId: userId,
        });
        if (!ids.length) continue;
        sendPushToUsers(ids, societyKeyFor(societyId), {
          title: d.title,
          body:  d.body,
          tag:   "documento",
        }).catch((e: any) => logger.warn({ err: e?.message, playerId: d.playerId }, "documenti/notifica: push error"));
        addNotificaToBlob(societyId, ids, {
          type:   "documento",
          title:  d.title,
          body:   d.body,
          docKey: d.docKey,
        }).catch(() => { /* gia' loggato dentro helper */ });
        notificati++;
      } catch (e: any) {
        logger.warn({ err: e?.message, playerId: d.playerId }, "documenti/notifica: item failed");
      }
    }

    return res.json({ ok: true, notificati });
  }
);

export default router;
