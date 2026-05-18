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
    const [socRows] = (await pool.execute(
      "SELECT id FROM societies WHERE UPPER(codice) = ? AND stato = 'attiva' LIMIT 1",
      [code]
    )) as [any[], any];
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

    // Push staff when player completed
    if (player.incomplete) {
      getUsersForPush(societyId, { leva: player.leva })
        .then(ids => {
          if (!ids.length) return;
          return sendPushToUsers(ids, societyKeyFor(societyId), {
            title: "✅ Scheda giocatore completata",
            body: `${player.nome} ${lastNameFull?.trim() ?? ""} è stato completato dal genitore`,
            tag: `player-complete-${playerId}`,
          });
        })
        .catch(() => {});
    }

    return res.json({
      ok: true,
      guardian: { id: ins.insertId, playerId, userId, role, consentGiven: true },
    });
  } catch (e: any) {
    logger.error({ err: e }, "POST players/:id/claim error");
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

    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "DELETE players/:playerId/guardians/:guardianId error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
