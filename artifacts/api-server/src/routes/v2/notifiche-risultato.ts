import { Router } from "express";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { sendPushToUsers, societyKeyFor } from "../../lib/push-sender";
import { resolveRecipients } from "../../lib/recipient-resolver";
import { addNotificaToBlob } from "./minors";

const router = Router();

// POST /api/v2/notifiche/risultato-partita
// Body: { leva, title, body }  — societyId è preso dal JWT, lista destinatari risolta server-side.
//
// CABLAGGIO RESOLVER UNICO (commit cablatura risultato): destinatari risolti via
// resolveRecipients('risultato', { societyId, leva, senderUserId }). Lo scope
// 'risultato' = famiglieLeva (genitori + nonni via player_guardians/users.leva
// legacy, + giocatori U14+ della leva). NIENTE staff, niente admin/mister_admin.
// Differenza con il vecchio getGuardiansForLeva: ora include anche i giocatori
// U14+ della leva (matrice del task — i giocatori senior ricevono le notifiche
// di dominio). Sulle leve U6-U13 nessuna differenza.
// La vecchia funzione locale getGuardiansForLeva e' stata rimossa (era usata
// SOLO qui, grep confermato).
router.post(
  "/notifiche/risultato-partita",
  requireAuth,
  requireRole("admin", "allenatore", "mister", "dirigente", "mister_admin"),
  async (req, res) => {
    const { societyId, userId } = req.jwtUser!;
    const { leva, title, body } = req.body as Record<string, any>;

    if (!leva || !title) return res.status(400).json({ error: "leva_title_required" });
    if (String(title).length > 200 || String(body || "").length > 500) {
      return res.status(400).json({ error: "payload_too_large" });
    }

    try {
      const ids = await resolveRecipients("risultato", {
        societyId,
        leva: String(leva),
        senderUserId: userId,
      });
      if (!ids.length) return res.json({ ok: true, sent: 0, recipients: 0 });

      const result = await sendPushToUsers(ids, societyKeyFor(societyId), {
        title: String(title),
        body: String(body || ""),
        tag: `risultato-${leva}`,
      });

      // Card in-app per i destinatari (sostituisce la pushNotifica FE rimossa).
      // Stesso shape che scriveva il FE: { type:'risultato_partita', title, body }
      // con eventId/convocazioneId/quoteKey/docKey null (default di addNotificaToBlob).
      // Stesso pattern usato in presenze.ts notify-coaches.
      addNotificaToBlob(societyId, ids, {
        type: "risultato_partita",
        title: String(title),
        body: String(body || ""),
      }).catch(() => { /* non-bloccante, gia' loggato dentro l'helper */ });

      return res.json({ ok: true, recipients: ids.length, sent: result.sent, errors: result.errors });
    } catch (e: any) {
      logger.error({ err: e?.message }, "POST notifiche/risultato-partita error");
      return res.status(500).json({ error: "server_error" });
    }
  }
);

export default router;
