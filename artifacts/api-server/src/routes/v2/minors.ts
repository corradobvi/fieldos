import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { sendPushToUsers, getUsersForPush, societyKeyFor } from "../../lib/push-sender";

const router = Router();

const STAFF_ROLES = ["admin", "allenatore", "dirigente"];
const VALID_GUARDIAN_ROLES = ["mamma", "papa", "nonno", "nonna", "tutore_legale"];

// POST /api/v2/players/minor — Mister/admin crea giocatore minore con dati minimi GDPR
router.post("/players/minor", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { firstName, lastNameInitial, levaKey, shirtNumber } = req.body as Record<string, any>;

  if (!firstName?.trim()) return res.status(400).json({ error: "firstName_required" });
  const initial = lastNameInitial?.trim() ?? "";
  if (!initial || initial.length > 10 || !initial.includes(".")) {
    return res.status(400).json({ error: "lastNameInitial_invalid", detail: "Must contain a dot, max 10 chars (e.g. 'B.' or 'B.V.')" });
  }
  if (!levaKey?.trim()) return res.status(400).json({ error: "levaKey_required" });

  try {
    // Check duplicati: nome + cognome_iniziale già esistenti nella società. Non blocca (frontend ha già chiesto conferma).
    const [existingCheck] = (await pool.execute(
      `SELECT id, nome, cognome_iniziale FROM players
       WHERE society_id = ? AND LOWER(nome) = LOWER(?) AND LOWER(cognome_iniziale) = LOWER(?)
       LIMIT 1`,
      [societyId, firstName.trim(), initial]
    )) as [any[], any];
    if ((existingCheck as any[]).length > 0) {
      const ex = (existingCheck as any[])[0];
      logger.warn({ societyId, firstName, lastNameInitial: initial, existingId: ex.id }, "[minor] Possibile duplicato");
    }

    const [result] = (await pool.execute(
      `INSERT INTO players
         (society_id, nome, cognome, cognome_iniziale, numero, leva, incomplete,
          parental_consent_given_by, parental_consent_at)
       VALUES (?, ?, '', ?, ?, ?, 1, NULL, NULL)`,
      [societyId, firstName.trim(), initial, shirtNumber != null ? Number(shirtNumber) : null, levaKey.trim()]
    )) as [any, any];

    logger.info({ playerId: result.insertId, societyId, userId, leva: levaKey }, "minor player created");

    return res.status(201).json({
      player: {
        id: result.insertId,
        firstName: firstName.trim(),
        lastNameInitial: initial,
        levaKey: levaKey.trim(),
        shirtNumber: shirtNumber != null ? Number(shirtNumber) : null,
        incomplete: true,
      },
    });
  } catch (e: any) {
    logger.error({ err: e }, "POST players/minor error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/players/public-incomplete?code=XXXX&levaKey=X
// Lista giocatori senza auth — solo dati non sensibili. Usato nel flusso auto-registrazione genitore.
router.get("/players/public-incomplete", async (req, res) => {
  const code = (req.query.code as string | undefined)?.trim().toUpperCase();
  if (!code) return res.status(400).json({ error: "code_required" });

  try {
    let [socRows] = (await pool.execute(
      "SELECT id FROM societies WHERE UPPER(codice) = ? AND stato = 'attiva' LIMIT 1",
      [code]
    )) as [any[], any];
    // Fallback blob: stesso pattern di guardian-register (admin può cambiare codice solo nel blob)
    if (!socRows.length) {
      const [blobRows] = (await pool.execute(
        `SELECT \`key\`, state_json FROM society_state
         WHERE \`key\` LIKE 'fieldos_state_soc_%' AND \`key\` NOT LIKE 'fieldos_demo%'`
      )) as [any[], any];
      for (const row of blobRows) {
        let state: any;
        try { state = JSON.parse(row.state_json as string); } catch { continue; }
        const rowCode = String(state?.codiceSocieta || "").trim().toUpperCase();
        if (!rowCode || rowCode !== code) continue;
        const m = String(row.key).match(/fieldos_state_soc_(\d+)$/);
        const blobSocId = m ? parseInt(m[1], 10) : 0;
        if (!blobSocId) continue;
        const [check] = (await pool.execute(
          "SELECT id FROM societies WHERE id = ? AND stato = 'attiva' LIMIT 1",
          [blobSocId]
        )) as [any[], any];
        if (check.length) { socRows = check; break; }
      }
    }
    if (!socRows.length) return res.status(404).json({ error: "society_not_found" });
    const societyId = (socRows[0] as any).id;

    const levaKey = req.query.levaKey as string | undefined;
    const [rows] = (await pool.execute(
      `SELECT p.id, p.nome AS firstName, p.cognome_iniziale AS lastNameInitial,
              p.numero AS shirtNumber, p.leva AS levaKey, p.incomplete,
              COUNT(pg.id) AS guardiansCount
       FROM players p
       LEFT JOIN player_guardians pg ON pg.player_id = p.id
       WHERE p.society_id = ? AND p.cognome_iniziale IS NOT NULL
         ${levaKey ? "AND p.leva = ?" : ""}
       GROUP BY p.id ORDER BY p.nome`,
      levaKey ? [societyId, levaKey] : [societyId]
    )) as [any[], any];

    return res.json((rows as any[]).map((r: any) => ({
      id: r.id,
      firstName: r.firstName,
      lastNameInitial: r.lastNameInitial,
      shirtNumber: r.shirtNumber,
      levaKey: r.levaKey,
      incomplete: !!r.incomplete,
      guardiansCount: Number(r.guardiansCount),
    })));
  } catch (e: any) {
    logger.error({ err: e }, "GET players/public-incomplete error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/players/incomplete?levaKey=X
// Lista giocatori della leva per associazione genitore.
// Restituisce solo nome + iniziale + numero — mai cognome completo né birth_date.
// Mostra sia giocatori incompleti sia completati (per secondo/terzo tutore).
// Filtro: solo player creati via nuovo flusso (cognome_iniziale IS NOT NULL).
router.get("/players/incomplete", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const levaKey = req.query.levaKey as string | undefined;

  try {
    const [rows] = (await pool.execute(
      `SELECT p.id,
              p.nome            AS firstName,
              p.cognome_iniziale AS lastNameInitial,
              p.numero          AS shirtNumber,
              p.leva            AS levaKey,
              p.incomplete,
              COUNT(pg.id)      AS guardiansCount
       FROM players p
       LEFT JOIN player_guardians pg ON pg.player_id = p.id
       WHERE p.society_id = ?
         AND p.cognome_iniziale IS NOT NULL
         ${levaKey ? "AND p.leva = ?" : ""}
       GROUP BY p.id
       ORDER BY p.nome`,
      levaKey ? [societyId, levaKey] : [societyId]
    )) as [any[], any];

    return res.json(rows.map((r: any) => ({
      id: r.id,
      firstName: r.firstName,
      lastNameInitial: r.lastNameInitial,
      shirtNumber: r.shirtNumber,
      levaKey: r.levaKey,
      incomplete: !!r.incomplete,
      guardiansCount: Number(r.guardiansCount),
    })));
  } catch (e: any) {
    logger.error({ err: e }, "GET players/incomplete error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/players/:id/claim — Genitore si associa al giocatore
router.post("/players/:id/claim", requireAuth, async (req, res) => {
  const { userId, societyId } = req.jwtUser!;
  const playerId = parseInt(req.params.id, 10);
  if (isNaN(playerId)) return res.status(400).json({ error: "invalid_player_id" });

  const { role, consent, lastNameFull, birthDate } = req.body as Record<string, any>;

  if (!VALID_GUARDIAN_ROLES.includes(role)) {
    return res.status(400).json({ error: "invalid_role", valid: VALID_GUARDIAN_ROLES });
  }
  if (consent !== true) return res.status(400).json({ error: "consent_required" });

  try {
    const [players] = (await pool.execute(
      "SELECT id, nome, cognome_iniziale, leva, incomplete, society_id FROM players WHERE id = ? AND society_id = ?",
      [playerId, societyId]
    )) as [any[], any];
    if (!players.length) return res.status(404).json({ error: "player_not_found" });
    const player = players[0];

    // Duplicate check
    const [existing] = (await pool.execute(
      "SELECT id FROM player_guardians WHERE player_id = ? AND user_id = ?",
      [playerId, userId]
    )) as [any[], any];
    if (existing.length) return res.status(409).json({ error: "already_associated" });

    // Conta i guardian già esistenti prima dell'insert: usato per push primo claim (notifica unica al mister)
    const [gCountRows] = (await pool.execute(
      "SELECT COUNT(*) AS n FROM player_guardians WHERE player_id = ?",
      [playerId]
    )) as [any[], any];
    const isFirstClaim = ((gCountRows[0] as any).n ?? 0) === 0;

    // Incomplete player: must supply full name + birth_date
    if (player.incomplete) {
      if (!lastNameFull?.trim()) return res.status(400).json({ error: "lastNameFull_required_for_incomplete_player" });
      if (!birthDate) return res.status(400).json({ error: "birthDate_required_for_incomplete_player" });

      await pool.execute(
        "UPDATE players SET cognome = ?, birth_date = ?, incomplete = 0 WHERE id = ?",
        [lastNameFull.trim(), birthDate, playerId]
      );
      logger.info({ playerId, userId, societyId }, "[GDPR] player completed by guardian");
    }

    // Insert guardian link
    const [ins] = (await pool.execute(
      `INSERT INTO player_guardians (player_id, user_id, role, consent_given, consent_at)
       VALUES (?, ?, ?, 1, NOW())`,
      [playerId, userId, role]
    )) as [any, any];

    // Legacy user_players link for backward compat (presenze, existing push queries)
    await pool.execute(
      "INSERT IGNORE INTO user_players (user_id, player_id) VALUES (?, ?)",
      [userId, playerId]
    ).catch(() => {});

    // Card blob SEMPRE (anche claim successivi); push browser SOLO al primo claim per evitare spam
    try {
      // Per "nuovo genitore" notificare SOLO staff (admin/mister/allenatori/dirigenti), NON altri genitori
      const targetIds = await getUsersForPush(societyId, { leva: player.leva, excludeUserId: userId, staffOnly: true });
      if (targetIds && targetIds.length) {
        let guardianFullName = '';
        try {
          const [u] = (await pool.execute(
            "SELECT nome, cognome FROM users WHERE id = ? LIMIT 1",
            [userId]
          )) as [any[], any];
          if (u.length) guardianFullName = `${u[0].nome || ''} ${u[0].cognome || ''}`.trim();
        } catch {}

        const childFullName = `${player.nome} ${lastNameFull?.trim() || player.cognome_iniziale || ''}`.trim();

        addNotificaToBlob(societyId, targetIds, {
          type: 'nuovo_genitore',
          title: `✅ Nuovo genitore: ${guardianFullName || 'genitore'}`,
          body: `Figli: ${childFullName}`,
        }).catch(() => {});

        if (isFirstClaim) {
          sendPushToUsers(targetIds, societyKeyFor(societyId), {
            title: "👨‍👧 Nuovo genitore collegato",
            body: `${childFullName}: ${guardianFullName || 'un genitore'} si è registrato.`,
            tag: `player-guardian-${playerId}`,
          }).catch(() => {});
        }
      }
    } catch (_) { /* notifica non-bloccante */ }

    // Propaga MySQL → blob: sia il player che il guardian (evita letture stale e bug "genitore fantasma")
    await syncPlayerFromMysqlToBlob(societyId, playerId).catch(() => {});
    await syncGuardianToBlob(societyId, userId).catch(() => {});

    return res.json({
      ok: true,
      guardian: { id: ins.insertId, playerId, userId, role, consentGiven: true },
    });
  } catch (e: any) {
    logger.error({ err: e }, "POST players/:id/claim error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PATCH /api/v2/players/:id/personal-data — Genitore associato aggiorna cognome / data nascita del figlio
router.patch("/players/:id/personal-data", requireAuth, async (req, res) => {
  const { userId, societyId } = req.jwtUser!;
  const playerId = parseInt(req.params.id, 10);
  if (isNaN(playerId)) return res.status(400).json({ error: "invalid_player_id" });

  const { lastNameFull, birthDate } = req.body as Record<string, any>;
  const newLastName = typeof lastNameFull === "string" ? lastNameFull.trim() : null;
  const newBirth    = typeof birthDate === "string" && birthDate.trim() ? birthDate.trim() : null;
  if (!newLastName && !newBirth) return res.status(400).json({ error: "no_fields_to_update" });

  try {
    // Verifica che il chiamante sia un guardian del player
    const [g] = (await pool.execute(
      `SELECT pg.id FROM player_guardians pg
       INNER JOIN players p ON p.id = pg.player_id
       WHERE pg.player_id = ? AND pg.user_id = ? AND p.society_id = ?
       LIMIT 1`,
      [playerId, userId, societyId]
    )) as [any[], any];
    if (!g.length) return res.status(403).json({ error: "not_a_guardian" });

    const updates: string[] = [];
    const params: any[] = [];
    if (newLastName) { updates.push("cognome = ?"); params.push(newLastName); }
    if (newBirth)    { updates.push("birth_date = ?"); params.push(newBirth); }
    // Se erano incompleti e ora hanno cognome+data, segna completi
    updates.push("incomplete = CASE WHEN cognome <> '' AND birth_date IS NOT NULL THEN 0 ELSE incomplete END");
    params.push(playerId);

    await pool.execute(
      `UPDATE players SET ${updates.join(", ")} WHERE id = ?`,
      params
    );
    logger.info({ playerId, userId, societyId, lastNameFull: !!newLastName, birthDate: !!newBirth }, "[GDPR] player personal data updated by guardian");

    // Propaga lo stato MySQL del player nel blob society_state (evita letture stale da altri device)
    await syncPlayerFromMysqlToBlob(societyId, playerId);

    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "PATCH players/:id/personal-data error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/players/rosa-sync — Sync stato player dal DB (per blob mister)
router.get("/players/rosa-sync", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [rows] = (await pool.execute(
      `SELECT p.id, p.nome, p.cognome, p.cognome_iniziale, p.leva, p.numero, p.incomplete,
              p.approval_status, p.birth_date,
              (SELECT COUNT(*) FROM player_guardians WHERE player_id = p.id) AS guardiansCount
       FROM players p WHERE p.society_id = ?
       ORDER BY p.id`,
      [societyId]
    )) as [any[], any];
    return res.json({ players: rows });
  } catch (e: any) {
    logger.error({ err: e }, "GET players/rosa-sync error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/players/:id/guardians — Lista tutori di un giocatore (pannello mister)
router.get("/players/:id/guardians", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const { societyId, userId: requesterId } = req.jwtUser!;
  const playerId = parseInt(req.params.id, 10);
  if (isNaN(playerId)) return res.status(400).json({ error: "invalid_player_id" });

  logger.info({ requesterId, playerId, societyId }, "[GDPR] guardians list accessed");

  try {
    const [playerRows] = (await pool.execute(
      "SELECT id FROM players WHERE id = ? AND society_id = ?",
      [playerId, societyId]
    )) as [any[], any];
    if (!playerRows.length) return res.status(404).json({ error: "player_not_found" });

    const [rows] = (await pool.execute(
      `SELECT pg.id, pg.user_id AS userId, pg.role,
              pg.consent_given AS consentGiven, pg.consent_at AS consentAt,
              pg.created_at AS createdAt,
              u.nome, u.cognome, u.email
       FROM player_guardians pg
       JOIN users u ON u.id = pg.user_id
       WHERE pg.player_id = ?
       ORDER BY pg.created_at`,
      [playerId]
    )) as [any[], any];

    return res.json(rows.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      userName: `${r.nome} ${r.cognome}`,
      email: r.email,
      role: r.role,
      consentGiven: !!r.consentGiven,
      consentAt: r.consentAt,
      createdAt: r.createdAt,
    })));
  } catch (e: any) {
    logger.error({ err: e }, "GET players/:id/guardians error");
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/players/:playerId/guardians/:guardianId — Mister sgancia un tutore
router.delete("/players/:playerId/guardians/:guardianId", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const { societyId, userId: requesterId } = req.jwtUser!;
  const playerId  = parseInt(req.params.playerId, 10);
  const guardianId = parseInt(req.params.guardianId, 10);
  if (isNaN(playerId) || isNaN(guardianId)) return res.status(400).json({ error: "invalid_ids" });

  try {
    const [playerRows] = (await pool.execute(
      "SELECT id FROM players WHERE id = ? AND society_id = ?",
      [playerId, societyId]
    )) as [any[], any];
    if (!playerRows.length) return res.status(404).json({ error: "player_not_found" });

    const [guardianRows] = (await pool.execute(
      "SELECT id, user_id FROM player_guardians WHERE id = ? AND player_id = ?",
      [guardianId, playerId]
    )) as [any[], any];
    if (!guardianRows.length) return res.status(404).json({ error: "guardian_not_found" });

    const guardianUserId = guardianRows[0].user_id;

    await pool.execute("DELETE FROM player_guardians WHERE id = ?", [guardianId]);
    await pool.execute(
      "DELETE FROM user_players WHERE user_id = ? AND player_id = ?",
      [guardianUserId, playerId]
    ).catch(() => {});

    logger.info({ requesterId, guardianId, guardianUserId, playerId, societyId }, "[GDPR] guardian unlinked by staff");

    // Sync blob: aggiorna o rimuovi guardian da USERS_DB in base ai player_guardians residui
    try {
      const [residui] = (await pool.execute(
        `SELECT COUNT(*) AS n FROM player_guardians pg
         INNER JOIN players p ON p.id = pg.player_id
         WHERE pg.user_id = ? AND p.society_id = ?`,
        [guardianUserId, societyId]
      )) as [any[], any];
      const hasOtherChildren = Number((residui[0] as any).n) > 0;
      if (hasOtherChildren) {
        await syncGuardianToBlob(societyId, guardianUserId).catch(() => {});
      } else {
        await removeGuardianFromBlob(societyId, guardianUserId).catch(() => {});
      }
    } catch (_) { /* non-bloccante */ }

    // Push al guardian rimosso
    try {
      const [playerInfo] = (await pool.execute(
        "SELECT nome, cognome, cognome_iniziale FROM players WHERE id = ? LIMIT 1",
        [playerId]
      )) as [any[], any];
      const pName = playerInfo[0]
        ? `${playerInfo[0].nome} ${playerInfo[0].cognome || playerInfo[0].cognome_iniziale || ''}`.trim()
        : 'un giocatore';
      sendPushToUsers([guardianUserId], societyKeyFor(societyId), {
        title: "❌ Tutore sganciato",
        body: `Sei stato sganciato dal profilo di ${pName}. Contatta la società per chiarimenti.`,
        tag: `guardian-removed-${playerId}-${guardianUserId}`,
      }).catch(() => {});
    } catch (_) { /* non-bloccante */ }

    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "DELETE players/:playerId/guardians/:guardianId error");
    return res.status(500).json({ error: "server_error" });
  }
});

// Helper: propaga lo stato MySQL del player nel blob society_state. Idempotente, fault-tolerant.
// Chiamato dopo UPDATE su players in claim e personal-data per evitare letture stale da altri device.
async function syncPlayerFromMysqlToBlob(societyId: number, playerId: number): Promise<void> {
  if (!societyId || !playerId) return;
  try {
    const [rows] = (await pool.execute(
      `SELECT id, nome, cognome, cognome_iniziale, birth_date, incomplete, approval_status, numero, leva
       FROM players WHERE id = ? AND society_id = ? LIMIT 1`,
      [playerId, societyId]
    )) as [any[], any];
    if (!rows.length) return;
    const m = rows[0];

    const stateKey = `fieldos_state_soc_${societyId}`;
    const [blobRows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [stateKey]
    )) as [any[], any];
    if (!blobRows.length) return;

    let state: any;
    try { state = JSON.parse(blobRows[0].state_json as string); } catch { return; }
    if (!Array.isArray(state.players)) return;

    const idx = state.players.findIndex((p: any) => p && p.id === playerId);
    if (idx < 0) return; // Out of scope: non creare entry mancanti

    const blobPlayer = state.players[idx];
    if (m.cognome != null) blobPlayer.cogn = m.cognome;
    if (m.cognome_iniziale != null) blobPlayer.cogn_iniziale = m.cognome_iniziale;
    if (m.birth_date != null) blobPlayer.birth_date = m.birth_date;
    blobPlayer.incomplete = m.incomplete === 1;
    if (m.approval_status != null) blobPlayer.approval_status = m.approval_status;
    state.players[idx] = blobPlayer;

    await pool.execute(
      "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
      [JSON.stringify(state), stateKey]
    );
  } catch (e: any) {
    logger.error({ err: e?.message, societyId, playerId }, "syncPlayerFromMysqlToBlob failed");
    // Non rilanciare: l'endpoint chiamante deve riuscire comunque
  }
}

// Helper: scrive una entry "card notifica" nel blob society_state per ciascun userId destinatario.
// Usata dai flow API-only (claim, notify-coaches) per generare card visibili al mister
// nel tab Notifiche di Comunicazioni. Frontend filtra per `n.userId === me.id` strict.
export async function addNotificaToBlob(
  societyId: number,
  userIds: number[],
  notifica: { type: string; title: string; body: string; eventId?: any; convocazioneId?: any },
): Promise<void> {
  if (!societyId || !userIds.length) return;
  try {
    const stateKey = `fieldos_state_soc_${societyId}`;
    const [rows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [stateKey],
    )) as [any[], any];
    if (!rows.length) return;

    let state: any;
    try { state = JSON.parse(rows[0].state_json as string); } catch { return; }
    if (!Array.isArray(state.notifiche)) state.notifiche = [];

    const baseTs = Date.now();
    const baseId = `srv_${baseTs}_${Math.random().toString(36).slice(2, 8)}`;

    for (const uid of userIds) {
      state.notifiche.push({
        id: `${baseId}_${uid}`,
        userId: Number(uid),
        type: notifica.type,
        title: notifica.title,
        body: notifica.body,
        eventId: notifica.eventId ?? null,
        convocazioneId: notifica.convocazioneId ?? null,
        quoteKey: null,
        docKey: null,
        ts: baseTs,
        read: false,
      });
    }

    await pool.execute(
      "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
      [JSON.stringify(state), stateKey],
    );
  } catch (e: any) {
    logger.error({ err: e?.message, societyId, userIds }, "addNotificaToBlob failed");
    // Non rilanciare
  }
}

// Helper: propaga il guardian MySQL → blob USERS_DB. Idempotente, fault-tolerant.
// Usato in POST /claim e DELETE /guardians per evitare il bug "genitore fantasma"
// (auto-save di altri device che sovrascrivono il blob senza l'utente nuovo).
export async function syncGuardianToBlob(societyId: number, userId: number): Promise<void> {
  if (!societyId || !userId) return;
  try {
    const [userRows] = (await pool.execute(
      "SELECT id, email, ruolo, nome, cognome, leva, stato FROM users WHERE id = ? AND society_id = ? LIMIT 1",
      [userId, societyId]
    )) as [any[], any];
    if (!userRows.length) return;
    const u = userRows[0];

    const [childRows] = (await pool.execute(
      `SELECT p.id, p.nome, p.cognome, p.cognome_iniziale, pg.role
       FROM player_guardians pg
       INNER JOIN players p ON p.id = pg.player_id
       WHERE pg.user_id = ? AND p.society_id = ?`,
      [userId, societyId]
    )) as [any[], any];

    const figli: string[] = [];
    const figliIds: number[] = [];
    let titoloFamiliare: string | null = null;
    for (const c of childRows as any[]) {
      const cogn = c.cognome || c.cognome_iniziale || '';
      figli.push(`${c.nome} ${cogn}`.trim());
      figliIds.push(Number(c.id));
      if (!titoloFamiliare) titoloFamiliare = c.role;
    }

    const stateKey = `fieldos_state_soc_${societyId}`;
    const [blobRows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [stateKey]
    )) as [any[], any];
    if (!blobRows.length) return;

    let state: any;
    try { state = JSON.parse(blobRows[0].state_json as string); } catch { return; }
    if (!Array.isArray(state.USERS_DB)) state.USERS_DB = [];

    const guardianEntry = {
      id: Number(u.id),
      email: u.email,
      role: u.ruolo,
      nome: u.nome || '',
      cogn: u.cognome || '',
      leva: u.leva || null,
      stato: u.stato || 'attivo',
      figli,
      figliIds,
      titoloFamiliare,
      _isV2: true,
    };

    const idx = state.USERS_DB.findIndex((x: any) => x && Number(x.id) === Number(u.id));
    if (idx < 0) {
      state.USERS_DB.push(guardianEntry);
    } else {
      state.USERS_DB[idx] = { ...state.USERS_DB[idx], ...guardianEntry };
    }

    const maxId = state.USERS_DB.reduce((m: number, x: any) => Math.max(m, Number(x.id) || 0), 0);
    state.nextUserId = Math.max(Number(state.nextUserId) || 1, maxId + 1);

    await pool.execute(
      "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
      [JSON.stringify(state), stateKey]
    );
  } catch (e: any) {
    logger.error({ err: e?.message, societyId, userId }, "syncGuardianToBlob failed");
  }
}

// Helper: rimuove un guardian dal blob USERS_DB (chiamato quando il guardian non ha più figli associati).
async function removeGuardianFromBlob(societyId: number, userId: number): Promise<void> {
  if (!societyId || !userId) return;
  try {
    const stateKey = `fieldos_state_soc_${societyId}`;
    const [blobRows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [stateKey]
    )) as [any[], any];
    if (!blobRows.length) return;

    let state: any;
    try { state = JSON.parse(blobRows[0].state_json as string); } catch { return; }
    if (!Array.isArray(state.USERS_DB)) return;

    const before = state.USERS_DB.length;
    state.USERS_DB = state.USERS_DB.filter((x: any) => !x || Number(x.id) !== Number(userId));
    if (state.USERS_DB.length === before) return; // nessuna modifica

    await pool.execute(
      "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
      [JSON.stringify(state), stateKey]
    );
  } catch (e: any) {
    logger.error({ err: e?.message, societyId, userId }, "removeGuardianFromBlob failed");
  }
}

export default router;
