import { Router } from "express";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { sendPushToUsers, societyKeyFor } from "../../lib/push-sender";
import { resolveRecipients } from "../../lib/recipient-resolver";
import { addNotificaToBlob } from "./minors";

const router = Router();

// POST /api/v2/allenamenti/notifica-eliminazione — UNA notifica per eliminazione
// allenamento (singolo o serie ricorrente). Coerente con la matrice EVENT_AUDIENCE:
//   allenamento_eliminato → famiglieLeva + staffLeva   (sender escluso)
// Niente notifica per CREATE/UPDATE allenamento (matrice: silenzio).
//
// Multi-leva supportato: un allenamento puo' avere piu' leve (ev.leve = []).
// Iteriamo le leve, UNION dei destinatari (Set dedup), UNA singola push aggregata.
// Per serie ricorrenti: il FE chiama questo endpoint UNA volta sola (mai una per
// occorrenza) con title aggregato tipo "Serie di allenamenti annullata".
//
// Body: { leve: string[], title: string, body: string }
// Risposta: { ok: true, notificati: number }
router.post("/allenamenti/notifica-eliminazione",
  requireAuth,
  requireRole("admin", "allenatore", "mister", "preparatore_portieri", "dirigente", "mister_admin"),
  async (req, res) => {
    const { societyId, userId } = req.jwtUser!;
    const body = req.body as { leve?: unknown; title?: unknown; body?: unknown };

    const leveRaw = Array.isArray(body?.leve) ? body!.leve as any[] : [];
    const leve = leveRaw
      .map(x => (typeof x === "string" ? x.trim() : ""))
      .filter(x => x.length > 0 && x.length <= 80);
    const title = String(body?.title || "").slice(0, 200).trim();
    const bodyTxt = String(body?.body || "").slice(0, 500);

    if (!leve.length || !title) {
      return res.status(400).json({ error: "invalid_body", detail: "richiesti: leve[] non vuoto e title non vuoto" });
    }

    // UNION destinatari su tutte le leve (Set dedup).
    const recipients = new Set<number>();
    for (const lv of leve) {
      try {
        const ids = await resolveRecipients("allenamento_eliminato", {
          societyId,
          leva: lv,
          senderUserId: userId,
        });
        for (const id of ids) recipients.add(id);
      } catch (e: any) {
        logger.warn({ err: e?.message, leva: lv }, "allenamenti/notifica-eliminazione: resolve error");
      }
    }

    if (!recipients.size) return res.json({ ok: true, notificati: 0 });
    const ids = Array.from(recipients);

    sendPushToUsers(ids, societyKeyFor(societyId), {
      title,
      body: bodyTxt,
      tag:  "allenamento_eliminato",
    }).catch((e: any) =>
      logger.warn({ err: e?.message, leve }, "allenamenti/notifica-eliminazione: push error")
    );
    addNotificaToBlob(societyId, ids, {
      type:  "evento",
      title,
      body:  bodyTxt,
    }).catch(() => { /* gia' loggato dentro helper */ });

    return res.json({ ok: true, notificati: ids.length });
  }
);

export default router;
