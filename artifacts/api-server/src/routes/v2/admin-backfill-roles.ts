// Backfill mirato di users.ruolo a partire dal blob society_state per UNA società.
// Causa: storicamente la promozione/declassamento dalla UI "Gestione Utenti" aggiornava solo
// USERS_DB nel blob e NON propagava a users.ruolo su MySQL. La fix permanente (PATCH /users/:id)
// è in vigore, ma gli utenti GIÀ promossi pre-fix restano con ruolo MySQL stale.
//
// Questo endpoint legge il blob society_state, per ogni utente con ruolo blob in whitelist
// esegue UPDATE users SET ruolo=? WHERE id=? AND society_id=? (idempotente).
// Default: dry-run. Per applicare davvero serve { apply: true } nel body.
//
// Auth: stessa convenzione di admin-genitore-debug → header X-SA-Secret == process.env.SA_SECRET.

import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";

const router = Router();

const RUOLO_WHITELIST = new Set([
  "admin", "allenatore", "dirigente", "preparatore_portieri", "mister_admin",
  "genitore", "nonno", "giocatore", "pendente",
]);

function checkAuth(req: any, res: any): boolean {
  const secret = req.headers["x-sa-secret"];
  const saSecret = process.env.SA_SECRET ?? "super123";
  if (secret !== saSecret) { res.status(401).json({ error: "unauthorized" }); return false; }
  return true;
}

// POST /api/v2/superadmin/_backfill-roles
// Body: { societyId: number, apply?: boolean }   default apply=false (dry-run)
router.post("/superadmin/_backfill-roles", async (req, res) => {
  if (!checkAuth(req, res)) return;

  const societyId = Number((req.body && (req.body as any).societyId) || 0);
  const apply = (req.body as any)?.apply === true;
  if (!Number.isFinite(societyId) || societyId <= 0) {
    return res.status(400).json({ error: "invalid_societyId" });
  }

  try {
    // 1) Carica il blob society_state della società target.
    const stateKey = `fieldos_state_soc_${societyId}`;
    const [blobRows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [stateKey]
    )) as [any[], any];
    if (!blobRows.length) {
      return res.status(404).json({ error: "blob_not_found", stateKey });
    }
    let state: any;
    try { state = JSON.parse(blobRows[0].state_json as string); }
    catch (e: any) { return res.status(500).json({ error: "blob_unparseable", detail: e?.message?.slice(0, 120) }); }

    const blobUsers = Array.isArray(state.USERS_DB) ? state.USERS_DB : [];
    if (!blobUsers.length) {
      return res.json({
        dryRun: !apply, societyId, totalBlobUsers: 0,
        stats: { updated: 0, alreadyOk: 0, skippedInvalidRole: 0, skippedNoMysqlRow: 0 },
        updates: [], targetCheck: {},
      });
    }

    // 2) Per ogni utente blob, recupera lo stato MySQL e decidi se aggiornare.
    const updates: Array<{ id: number; name: string; email: string; before: string | null; after: string; action: string }> = [];
    let cntUpdated = 0, cntAlreadyOk = 0, cntInvalidRole = 0, cntNoMysqlRow = 0;

    for (const u of blobUsers) {
      const uid = Number(u && u.id);
      if (!Number.isFinite(uid) || uid <= 0) continue;
      const blobRuolo = String((u && u.role) || "").trim();
      const name = String(((u && u.nome) || "") + " " + ((u && u.cogn) || "")).trim();
      const email = String((u && u.email) || "");
      if (!RUOLO_WHITELIST.has(blobRuolo)) {
        cntInvalidRole++;
        updates.push({ id: uid, name, email, before: null, after: blobRuolo, action: "skip_invalid_blob_role" });
        continue;
      }
      // Stato attuale MySQL
      const [curRows] = (await pool.execute(
        "SELECT ruolo FROM users WHERE id = ? AND society_id = ? LIMIT 1",
        [uid, societyId]
      )) as [any[], any];
      if (!curRows.length) {
        cntNoMysqlRow++;
        updates.push({ id: uid, name, email, before: null, after: blobRuolo, action: "skip_no_mysql_row" });
        continue;
      }
      const currentRuolo = String(curRows[0].ruolo || "");
      if (currentRuolo === blobRuolo) {
        cntAlreadyOk++;
        updates.push({ id: uid, name, email, before: currentRuolo, after: blobRuolo, action: "already_ok" });
        continue;
      }
      // Differente → UPDATE (se apply=true).
      if (apply) {
        const [r] = (await pool.execute(
          "UPDATE users SET ruolo = ? WHERE id = ? AND society_id = ?",
          [blobRuolo, uid, societyId]
        )) as [any, any];
        const ok = r && r.affectedRows > 0;
        if (ok) cntUpdated++; else cntNoMysqlRow++;
        updates.push({
          id: uid, name, email,
          before: currentRuolo, after: blobRuolo,
          action: ok ? "updated" : "update_no_rows",
        });
      } else {
        updates.push({ id: uid, name, email, before: currentRuolo, after: blobRuolo, action: "would_update" });
      }
    }

    // 3) Rileggi SEMPRE i target richiesti (60, 87) DOPO l'eventuale update — feedback live.
    const targetIds = [60, 87];
    const targetCheck: Record<string, any> = {};
    for (const tid of targetIds) {
      const [r] = (await pool.execute(
        "SELECT id, nome, cognome, email, ruolo FROM users WHERE id = ? AND society_id = ? LIMIT 1",
        [tid, societyId]
      )) as [any[], any];
      targetCheck[String(tid)] = r.length
        ? { id: r[0].id, name: `${r[0].nome} ${r[0].cognome}`.trim(), email: r[0].email, ruolo: r[0].ruolo }
        : { found: false };
    }

    logger.info({
      societyId, apply, updated: cntUpdated, alreadyOk: cntAlreadyOk,
      invalidRole: cntInvalidRole, noMysqlRow: cntNoMysqlRow,
    }, "backfill-roles done");

    return res.json({
      dryRun: !apply,
      societyId,
      totalBlobUsers: blobUsers.length,
      stats: {
        updated: cntUpdated,
        alreadyOk: cntAlreadyOk,
        skippedInvalidRole: cntInvalidRole,
        skippedNoMysqlRow: cntNoMysqlRow,
      },
      updates,
      targetCheck,
    });
  } catch (e: any) {
    logger.error({ err: e }, "backfill-roles error");
    return res.status(500).json({ error: "server_error", detail: e?.sqlMessage || e?.message?.slice(0, 200) });
  }
});

export default router;
