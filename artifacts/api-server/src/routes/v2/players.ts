import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";
import { syncGuardianToBlob } from "./minors";

const router = Router();

const ADMIN_ROLES = ["admin", "allenatore", "mister", "dirigente"];

// Ruoli staff abilitati alla lettura completa rosa: aggiunge mister_admin/preparatore
// rispetto a ADMIN_ROLES (che è whitelist di scrittura).
const STAFF_READ_ROLES = new Set([
  "admin", "mister_admin", "allenatore", "mister", "dirigente", "preparatore_portieri",
]);

const PIANO_NORM: Record<string, string> = { gratuito: "mister", base: "mister_pro", premium: "societa" };
const PLAYER_LIMITS: Record<string, number> = { mister: 25, mister_pro: Infinity, societa: Infinity, demo: Infinity };

async function getSocietyPlayerLimit(societyId: number): Promise<number> {
  const [rows] = await pool.execute("SELECT piano FROM societies WHERE id = ?", [societyId]) as [any[], any];
  const raw = rows[0]?.piano || "demo";
  const norm = PIANO_NORM[raw] || raw;
  return PLAYER_LIMITS[norm] ?? 25;
}

// GET /api/v2/players/pending-parental-consent
// Solo per genitore: restituisce i giocatori minori collegati via user_players senza consenso parentale.
router.get("/players/pending-parental-consent", requireAuth, async (req, res) => {
  const { userId, role } = req.jwtUser!;
  if (role !== "genitore") return res.json({ players: [] });

  try {
    const currentYear = new Date().getFullYear();
    const [rows] = (await pool.execute(
      `SELECT p.id, p.nome, p.cognome, p.anno_nascita
       FROM players p
       JOIN user_players up ON up.player_id = p.id
       WHERE up.user_id = ?
         AND p.anno_nascita IS NOT NULL
         AND (? - p.anno_nascita) < 18
         AND p.parental_consent_at IS NULL`,
      [userId, currentYear]
    )) as [any[], any];
    return res.json({ players: rows });
  } catch (e: any) {
    logger.error({ err: e }, "GET pending-parental-consent error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/players?leva=U14
// Gating ownership server-side (P1 security):
//   - staff (admin/mister_admin/allenatore/mister/dirigente/preparatore_portieri)
//       → lista completa della società (eventualmente filtrata per leva).
//   - genitore/nonno → SOLO i player con riga in player_guardians (legati al
//       chiamante via user_id).
//   - giocatore     → SOLO il player con (society_id, nome, cognome) ==
//       (jwt.societyId, users.nome, users.cognome). Match per nome+cognome:
//       stesso pattern usato dal resolver chat (squadra/torneo).
//   - altri ruoli   → 403.
router.get("/players", requireAuth, async (req, res) => {
  const { societyId, userId, role } = req.jwtUser!;
  const leva = req.query.leva as string | undefined;

  const baseSelect = `SELECT p.id, p.nome, p.cognome, p.soprannome, p.numero, p.ruolo_campo,
              p.anno_nascita, p.leva, p.telefono_genitore, p.email_genitore,
              p.note, p.foto_url, p.created_at,
              p.parental_consent_given_by, p.parental_consent_at`;

  try {
    let rows: any[];
    if (STAFF_READ_ROLES.has(role)) {
      [rows] = (await pool.execute(
        `${baseSelect}
         FROM players p
         WHERE p.society_id = ?
           ${leva ? "AND p.leva = ?" : ""}
         ORDER BY p.cognome, p.nome`,
        leva ? [societyId, leva] : [societyId]
      )) as [any[], any];
    } else if (role === "genitore" || role === "nonno") {
      [rows] = (await pool.execute(
        `${baseSelect}
         FROM players p
         JOIN player_guardians pg ON pg.player_id = p.id AND pg.user_id = ?
         WHERE p.society_id = ?
           ${leva ? "AND p.leva = ?" : ""}
         ORDER BY p.cognome, p.nome`,
        leva ? [userId, societyId, leva] : [userId, societyId]
      )) as [any[], any];
    } else if (role === "giocatore") {
      [rows] = (await pool.execute(
        `${baseSelect}
         FROM players p
         JOIN users u
           ON u.id = ? AND u.society_id = p.society_id
          AND u.nome = p.nome AND u.cognome = p.cognome
         WHERE p.society_id = ?
           ${leva ? "AND p.leva = ?" : ""}
         ORDER BY p.cognome, p.nome`,
        leva ? [userId, societyId, leva] : [userId, societyId]
      )) as [any[], any];
    } else {
      return res.status(403).json({ error: "forbidden" });
    }
    return res.json(rows);
  } catch (e: any) {
    logger.error({ err: e }, "GET players error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/players/:id
// Ownership server-side: stesso pattern di GET /players (staff full, genitore/nonno
// via player_guardians, giocatore via match nome+cognome). Altri ruoli → 403.
// Per non leak-are esistenza di player altrui: 404 se la riga non passa il filtro
// (anziché 403, che rivelerebbe che l'id esiste in altra ownership).
router.get("/players/:id", requireAuth, async (req, res) => {
  const { societyId, userId, role } = req.jwtUser!;
  const baseSelect = `SELECT p.id, p.nome, p.cognome, p.soprannome, p.numero, p.ruolo_campo,
              p.anno_nascita, p.leva, p.telefono_genitore, p.email_genitore,
              p.note, p.foto_url, p.created_at,
              p.parental_consent_given_by, p.parental_consent_at`;
  try {
    let rows: any[];
    if (STAFF_READ_ROLES.has(role)) {
      [rows] = (await pool.execute(
        `${baseSelect} FROM players p WHERE p.id = ? AND p.society_id = ?`,
        [req.params.id, societyId]
      )) as [any[], any];
    } else if (role === "genitore" || role === "nonno") {
      [rows] = (await pool.execute(
        `${baseSelect}
         FROM players p
         JOIN player_guardians pg ON pg.player_id = p.id AND pg.user_id = ?
         WHERE p.id = ? AND p.society_id = ?`,
        [userId, req.params.id, societyId]
      )) as [any[], any];
    } else if (role === "giocatore") {
      [rows] = (await pool.execute(
        `${baseSelect}
         FROM players p
         JOIN users u
           ON u.id = ? AND u.society_id = p.society_id
          AND u.nome = p.nome AND u.cognome = p.cognome
         WHERE p.id = ? AND p.society_id = ?`,
        [userId, req.params.id, societyId]
      )) as [any[], any];
    } else {
      return res.status(403).json({ error: "forbidden" });
    }
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e: any) {
    logger.error({ err: e }, "GET player error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/players
// Il consenso parentale non viene mai raccolto qui: solo il genitore può darlo,
// tramite /api/v2/account/accept-parental-consent/:playerId dopo il login.
router.post("/players", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { nome, cognome, soprannome, numero, ruoloCampo, annoNascita, leva,
          telefonoGenitore, emailGenitore, note } = req.body as Record<string, any>;

  if (!nome?.trim() || !cognome?.trim()) {
    return res.status(400).json({ error: "nome_cognome_required" });
  }

  try {
    const maxGioc = await getSocietyPlayerLimit(societyId);
    if (isFinite(maxGioc) && leva) {
      const [cnt] = await pool.execute(
        "SELECT COUNT(*) as n FROM players WHERE society_id = ? AND leva = ?",
        [societyId, leva]
      ) as [any[], any];
      if (cnt[0].n >= maxGioc) {
        return res.status(403).json({ error: "plan_limit_reached", limitType: "giocatoriPerLeva", current: cnt[0].n, max: maxGioc });
      }
    }

    const [result] = (await pool.execute(
      `INSERT INTO players
        (society_id, nome, cognome, soprannome, numero, ruolo_campo, anno_nascita,
         leva, telefono_genitore, email_genitore, note,
         parental_consent_given_by, parental_consent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
      [societyId, nome.trim(), cognome.trim(), soprannome ?? null, numero ?? null,
       ruoloCampo ?? null, annoNascita ?? null, leva ?? null,
       telefonoGenitore ?? null, emailGenitore ?? null, note ?? null]
    )) as [any, any];

    return res.status(201).json({ id: result.insertId });
  } catch (e: any) {
    logger.error({ err: e }, "POST player error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/v2/players/:id
// Il consenso parentale può essere aggiornato SOLO da un genitore collegato al giocatore
// tramite user_players. Admin e dirigenti non possono impostare il consenso al posto del genitore.
router.put("/players/:id", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { nome, cognome, soprannome, numero, ruoloCampo, annoNascita, leva,
          telefonoGenitore, emailGenitore, note, fotoUrl } = req.body as Record<string, any>;

  try {
    const [result] = (await pool.execute(
      `UPDATE players SET
        nome              = COALESCE(?, nome),
        cognome           = COALESCE(?, cognome),
        soprannome        = COALESCE(?, soprannome),
        numero            = COALESCE(?, numero),
        ruolo_campo       = COALESCE(?, ruolo_campo),
        anno_nascita      = COALESCE(?, anno_nascita),
        leva              = COALESCE(?, leva),
        telefono_genitore = COALESCE(?, telefono_genitore),
        email_genitore    = COALESCE(?, email_genitore),
        note              = COALESCE(?, note),
        foto_url          = COALESCE(?, foto_url),
        incomplete        = CASE WHEN COALESCE(?, cognome) <> '' AND COALESCE(?, cognome) IS NOT NULL THEN 0 ELSE incomplete END
       WHERE id = ? AND society_id = ?`,
      [nome ?? null, cognome ?? null, soprannome ?? null, numero ?? null,
       ruoloCampo ?? null, annoNascita ?? null, leva ?? null,
       telefonoGenitore ?? null, emailGenitore ?? null, note ?? null,
       fotoUrl ?? null,
       cognome ?? null, cognome ?? null,    // ← duplica per CASE
       req.params.id, societyId]
    )) as [any, any];

    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });

    // Sync blob USERS_DB per tutti i guardian del player: il loro figli/figliIds resta allineato
    try {
      const [guardianRows] = (await pool.execute(
        "SELECT user_id FROM player_guardians WHERE player_id = ?",
        [req.params.id]
      )) as [any[], any];
      for (const g of guardianRows as any[]) {
        await syncGuardianToBlob(societyId, g.user_id).catch(() => {});
      }
    } catch (_) { /* non-bloccante */ }

    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "PUT player error");
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/players/:id
router.delete("/players/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [result] = (await pool.execute(
      "DELETE FROM players WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "DELETE player error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
