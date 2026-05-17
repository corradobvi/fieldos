import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";

const router = Router();

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
