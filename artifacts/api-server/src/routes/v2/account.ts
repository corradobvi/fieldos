import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";

const router = Router();

// POST /api/v2/account/accept-privacy — raccoglie il consenso privacy per utenti pre-esistenti
router.post("/account/accept-privacy", requireAuth, async (req, res) => {
  const { userId } = req.jwtUser!;
  try {
    await pool.execute(
      `UPDATE users SET privacy_accepted_at = NOW() WHERE id = ? AND privacy_accepted_at IS NULL`,
      [userId]
    );
    logger.info({ userId }, "privacy accepted retroactively");
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "account/accept-privacy error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/account/accept-parental-consent/:playerId
// Solo per utenti ruolo 'genitore' effettivamente collegati al giocatore minorenne.
router.post("/account/accept-parental-consent/:playerId", requireAuth, async (req, res) => {
  const { userId, societyId, role } = req.jwtUser!;
  if (role !== "genitore") return res.status(403).json({ error: "forbidden" });

  const playerId = parseInt(String(req.params.playerId));
  if (isNaN(playerId)) return res.status(400).json({ error: "invalid_player_id" });

  try {
    // Verifica che il giocatore esista per questa società
    const [playerRows] = (await pool.execute(
      `SELECT id, anno_nascita FROM players WHERE id = ? AND society_id = ?`,
      [playerId, societyId]
    )) as [any[], any];
    if (!playerRows.length) return res.status(404).json({ error: "player_not_found" });

    const annNasc = playerRows[0].anno_nascita as number | null;
    const isMinor = annNasc != null && (new Date().getFullYear() - annNasc) < 18;
    if (!isMinor) return res.status(400).json({ error: "player_not_minor" });

    // Verifica che il genitore sia collegato al giocatore
    const [linkRows] = (await pool.execute(
      `SELECT 1 FROM user_players WHERE user_id = ? AND player_id = ? LIMIT 1`,
      [userId, playerId]
    )) as [any[], any];
    if (!linkRows.length) return res.status(403).json({ error: "not_linked" });

    await pool.execute(
      `UPDATE players
       SET parental_consent_given_by = ?, parental_consent_at = NOW()
       WHERE id = ? AND parental_consent_at IS NULL`,
      [userId, playerId]
    );
    logger.info({ userId, playerId }, "parental consent accepted");
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "account/accept-parental-consent error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/v2/account/marketing-consent — aggiorna preferenza marketing dell'utente loggato
router.put("/account/marketing-consent", requireAuth, async (req, res) => {
  const { userId } = req.jwtUser!;
  const { consent } = req.body as { consent?: boolean };

  if (typeof consent !== "boolean") {
    return res.status(400).json({ error: "consent_must_be_boolean" });
  }

  try {
    if (consent) {
      await pool.execute(
        `UPDATE users
         SET marketing_consent = TRUE,
             marketing_consent_at = NOW(),
             marketing_consent_revoked_at = NULL
         WHERE id = ?`,
        [userId]
      );
    } else {
      await pool.execute(
        `UPDATE users
         SET marketing_consent = FALSE,
             marketing_consent_at = NULL,
             marketing_consent_revoked_at = NOW()
         WHERE id = ?`,
        [userId]
      );
    }

    logger.info({ userId, consent }, "marketing consent updated");
    return res.json({ ok: true, consent });
  } catch (e: any) {
    logger.error({ err: e }, "account/marketing-consent error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
