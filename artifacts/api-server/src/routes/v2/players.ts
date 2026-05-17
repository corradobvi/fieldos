import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";

const router = Router();

const ADMIN_ROLES = ["admin", "allenatore", "dirigente"];

const PIANO_NORM: Record<string, string> = { gratuito: "mister", base: "mister_pro", premium: "societa" };
const PLAYER_LIMITS: Record<string, number> = { mister: 25, mister_pro: Infinity, societa: Infinity, demo: Infinity };

async function getSocietyPlayerLimit(societyId: number): Promise<number> {
  const [rows] = await pool.execute("SELECT piano FROM societies WHERE id = ?", [societyId]) as [any[], any];
  const raw = rows[0]?.piano || "demo";
  const norm = PIANO_NORM[raw] || raw;
  return PLAYER_LIMITS[norm] ?? 25;
}

// GET /api/v2/players?leva=U14
router.get("/players", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  const leva = req.query.leva as string | undefined;

  try {
    const [rows] = (await pool.execute(
      `SELECT p.id, p.nome, p.cognome, p.soprannome, p.numero, p.ruolo_campo,
              p.anno_nascita, p.leva, p.telefono_genitore, p.email_genitore,
              p.note, p.foto_url, p.created_at
       FROM players p
       WHERE p.society_id = ?
         ${leva ? "AND p.leva = ?" : ""}
       ORDER BY p.cognome, p.nome`,
      leva ? [societyId, leva] : [societyId]
    )) as [any[], any];
    return res.json(rows);
  } catch (e: any) {
    logger.error({ err: e }, "GET players error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/players/:id
router.get("/players/:id", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [rows] = (await pool.execute(
      "SELECT * FROM players WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any[], any];
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e: any) {
    logger.error({ err: e }, "GET player error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/players
router.post("/players", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { nome, cognome, soprannome, numero, ruoloCampo, annoNascita, leva,
          telefonoGenitore, emailGenitore, note,
          parentalConsentGiven } = req.body as Record<string, any>;

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

    const isMinor = annoNascita && (new Date().getFullYear() - parseInt(annoNascita)) < 18;
    const consentGivenBy = isMinor && parentalConsentGiven ? userId : null;
    const consentAt      = isMinor && parentalConsentGiven ? new Date() : null;

    const [result] = (await pool.execute(
      `INSERT INTO players
        (society_id, nome, cognome, soprannome, numero, ruolo_campo, anno_nascita,
         leva, telefono_genitore, email_genitore, note,
         parental_consent_given_by, parental_consent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [societyId, nome.trim(), cognome.trim(), soprannome ?? null, numero ?? null,
       ruoloCampo ?? null, annoNascita ?? null, leva ?? null,
       telefonoGenitore ?? null, emailGenitore ?? null, note ?? null,
       consentGivenBy, consentAt]
    )) as [any, any];

    return res.status(201).json({ id: result.insertId });
  } catch (e: any) {
    logger.error({ err: e }, "POST player error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/v2/players/:id
router.put("/players/:id", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { nome, cognome, soprannome, numero, ruoloCampo, annoNascita, leva,
          telefonoGenitore, emailGenitore, note, fotoUrl,
          parentalConsentGiven } = req.body as Record<string, any>;

  try {
    const isMinor = annoNascita && (new Date().getFullYear() - parseInt(annoNascita)) < 18;
    const consentGivenBy = isMinor && parentalConsentGiven ? userId : null;
    const consentAt      = isMinor && parentalConsentGiven ? new Date() : null;

    const [result] = (await pool.execute(
      `UPDATE players SET
        nome             = COALESCE(?, nome),
        cognome          = COALESCE(?, cognome),
        soprannome       = COALESCE(?, soprannome),
        numero           = COALESCE(?, numero),
        ruolo_campo      = COALESCE(?, ruolo_campo),
        anno_nascita     = COALESCE(?, anno_nascita),
        leva             = COALESCE(?, leva),
        telefono_genitore = COALESCE(?, telefono_genitore),
        email_genitore   = COALESCE(?, email_genitore),
        note             = COALESCE(?, note),
        foto_url         = COALESCE(?, foto_url),
        parental_consent_given_by = CASE WHEN ? IS NOT NULL THEN ? ELSE parental_consent_given_by END,
        parental_consent_at       = CASE WHEN ? IS NOT NULL THEN ? ELSE parental_consent_at END
       WHERE id = ? AND society_id = ?`,
      [nome ?? null, cognome ?? null, soprannome ?? null, numero ?? null,
       ruoloCampo ?? null, annoNascita ?? null, leva ?? null,
       telefonoGenitore ?? null, emailGenitore ?? null, note ?? null,
       fotoUrl ?? null,
       consentGivenBy, consentGivenBy,
       consentAt, consentAt,
       req.params.id, societyId]
    )) as [any, any];

    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
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
