import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

function checkAuth(req: any, res: any): boolean {
  const secret = req.headers["x-sa-secret"];
  const saSecret = process.env.SA_SECRET ?? "super123";
  if (secret !== saSecret) { res.status(401).json({ error: "unauthorized" }); return false; }
  return true;
}

router.get("/superadmin/_diag/push", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const societyId = parseInt(String(req.query.societyId || '38'));
  try {
    const [total] = await pool.execute(`SELECT COUNT(*) AS n FROM push_subscriptions`) as [any[], any];
    const [bySoc] = await pool.execute(
      `SELECT COUNT(*) AS n FROM push_subscriptions WHERE society_key = ?`,
      [`fieldos_state_soc_${societyId}`]
    ) as [any[], any];
    const [sample] = await pool.execute(
      `SELECT id, user_id, society_key, CHAR_LENGTH(subscription) AS sub_size, updated_at
       FROM push_subscriptions ORDER BY id DESC LIMIT 10`
    ) as [any[], any];
    const [socSubs] = await pool.execute(
      `SELECT id, user_id, CHAR_LENGTH(subscription) AS sub_size, updated_at
       FROM push_subscriptions WHERE society_key = ? ORDER BY id`,
      [`fieldos_state_soc_${societyId}`]
    ) as [any[], any];
    const [bySocAll] = await pool.execute(
      `SELECT society_key, COUNT(*) AS n FROM push_subscriptions GROUP BY society_key ORDER BY n DESC`
    ) as [any[], any];
    return res.json({
      total: total[0].n,
      by_society_38: bySoc[0].n,
      by_society_all: bySocAll,
      society_38_subs: socSubs,
      sample_recent: sample,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

// GET /api/v2/superadmin/_diag/push-remap?societyId=38&dryRun=1
// Analizza (e con dryRun=0 esegue) il remap delle subscription push:
// user_id BLOB → user_id MySQL, identificando l'utente per email (blob USERS_DB ↔ MySQL users).
router.get("/superadmin/_diag/push-remap", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const societyId = parseInt(String(req.query.societyId || ''));
  const dryRun = String(req.query.dryRun ?? '1') !== '0';
  if (!societyId || !Number.isFinite(societyId)) {
    return res.status(400).json({ error: "societyId required" });
  }
  const stateKey = `fieldos_state_soc_${societyId}`;

  try {
    // 1. Carica il blob USERS_DB della società
    const [blobRows] = await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [stateKey]
    ) as [any[], any];
    if (!blobRows.length) {
      return res.status(404).json({ error: "blob_not_found", stateKey });
    }
    let state: any;
    try { state = JSON.parse(blobRows[0].state_json as string); }
    catch { return res.status(500).json({ error: "blob_parse_error" }); }
    const blobUsers: any[] = Array.isArray(state.USERS_DB) ? state.USERS_DB : [];
    const blobUserById = new Map<number, any>(blobUsers.map((u: any) => [u.id, u]));

    // 2. Carica utenti MySQL della società
    const [mysqlRows] = await pool.execute(
      `SELECT id, email FROM users WHERE society_id = ? AND stato = 'attivo'`,
      [societyId]
    ) as [any[], any];
    const mysqlIdByEmail = new Map<string, number>(
      (mysqlRows as any[]).map((r: any) => [String(r.email || '').toLowerCase(), r.id as number])
    );
    const mysqlIds = new Set((mysqlRows as any[]).map((r: any) => r.id as number));

    // 3. Carica subscription per la società
    const [subs] = await pool.execute(
      `SELECT id, user_id, society_key, CHAR_LENGTH(subscription) AS sub_size, updated_at
       FROM push_subscriptions WHERE society_key = ? ORDER BY id`,
      [stateKey]
    ) as [any[], any];

    // 4. Analisi riga per riga
    const analysis: any[] = [];
    const toRemap: Array<{ subId: number; oldUserId: number; newUserId: number; email: string }> = [];
    for (const s of subs as any[]) {
      const blobUserId = s.user_id as number;
      // Se l'id corrisponde già a un id MySQL della società, è già OK
      if (mysqlIds.has(blobUserId)) {
        analysis.push({
          sub_id: s.id, user_id_blob: blobUserId, email: null, user_id_mysql: blobUserId,
          match_status: "user_id_già_mysql",
        });
        continue;
      }
      // Cerca nel blob l'utente con quell'id per estrarre l'email
      const bu = blobUserById.get(blobUserId);
      const email = bu && typeof bu.email === 'string' ? bu.email.toLowerCase().trim() : null;
      if (!email) {
        analysis.push({
          sub_id: s.id, user_id_blob: blobUserId, email: null, user_id_mysql: null,
          match_status: "blob_user_non_trovato",
        });
        continue;
      }
      const mysqlId = mysqlIdByEmail.get(email);
      if (!mysqlId) {
        analysis.push({
          sub_id: s.id, user_id_blob: blobUserId, email, user_id_mysql: null,
          match_status: "email_non_trovata_in_mysql",
        });
        continue;
      }
      analysis.push({
        sub_id: s.id, user_id_blob: blobUserId, email, user_id_mysql: mysqlId,
        match_status: "ok_remappabile",
      });
      toRemap.push({ subId: s.id, oldUserId: blobUserId, newUserId: mysqlId, email });
    }

    // 5. Se dryRun=0, esegui UPDATE in transazione
    let applied: any[] = [];
    let txStatus: string = "skipped (dryRun)";
    if (!dryRun && toRemap.length > 0) {
      const conn = await (pool as any).getConnection();
      try {
        await conn.beginTransaction();
        for (const r of toRemap) {
          // Check: il target (user_id MySQL + society_key) non deve già esistere (UNIQUE KEY)
          const [existing] = await conn.execute(
            "SELECT id FROM `push_subscriptions` WHERE `user_id` = ? AND `society_key` = ? LIMIT 1",
            [r.newUserId, stateKey]
          );
          if ((existing as any[]).length) {
            // Conflitto: esiste già una subscription con quel target. Cancelliamo la riga blob per non rompere unique key.
            await conn.execute(
              "DELETE FROM `push_subscriptions` WHERE id = ?",
              [r.subId]
            );
            applied.push({ ...r, action: "deleted_duplicate" });
          } else {
            await conn.execute(
              "UPDATE `push_subscriptions` SET user_id = ? WHERE id = ?",
              [r.newUserId, r.subId]
            );
            applied.push({ ...r, action: "updated" });
          }
        }
        await conn.commit();
        txStatus = "committed";
      } catch (e: any) {
        try { await conn.rollback(); } catch (_) {}
        txStatus = "rolledback: " + (e?.message || String(e));
      } finally {
        try { conn.release(); } catch (_) {}
      }
    } else if (!dryRun && toRemap.length === 0) {
      txStatus = "no-op (toRemap is empty)";
    }

    return res.json({
      societyId, stateKey, dryRun,
      counts: {
        total_subscriptions: subs.length,
        ok_remappabile:        analysis.filter(a => a.match_status === "ok_remappabile").length,
        user_id_già_mysql:    analysis.filter(a => a.match_status === "user_id_già_mysql").length,
        email_non_trovata:    analysis.filter(a => a.match_status === "email_non_trovata_in_mysql").length,
        blob_user_non_trovato: analysis.filter(a => a.match_status === "blob_user_non_trovato").length,
      },
      analysis,
      applied,
      tx_status: txStatus,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

export default router;
