import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole } from "../../lib/auth";

const router = Router();

// GET /api/v2/society
router.get("/society", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [rows] = (await pool.execute(
      "SELECT id, nome, citta, colore_primario, colore_accento, logo_url, codice, piano, demo_scadenza, stato, created_at FROM societies WHERE id = ?",
      [societyId]
    )) as [any[], any];

    if (!rows.length) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e: any) {
    logger.error({ err: e }, "GET society error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/v2/society
router.put("/society", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  const { nome, citta, colorePrimario, coloreAccento, logoUrl, codice } = req.body as Record<string, string>;

  // Solo l'account owner può modificare i dati della società
  try {
    const [ownerRows] = (await pool.execute(
      "SELECT is_account_owner FROM users WHERE id = ? AND society_id = ? LIMIT 1",
      [userId, societyId]
    )) as [any[], any];
    if (!ownerRows.length || !ownerRows[0].is_account_owner) {
      return res.status(403).json({ error: "forbidden", message: "Solo l'admin titolare può modificare i dati della società" });
    }
  } catch (e: any) {
    logger.error({ err: e }, "PUT society owner-check error");
    return res.status(500).json({ error: "server_error" });
  }

  try {
    // If codice is being changed, check uniqueness
    if (codice !== undefined) {
      const [conflict] = (await pool.execute(
        "SELECT id FROM societies WHERE UPPER(codice) = UPPER(?) AND id != ?",
        [codice, societyId]
      )) as [any[], any];
      if (conflict.length) return res.status(409).json({ error: "codice_in_uso" });
    }

    await pool.execute(
      `UPDATE societies SET
        nome            = COALESCE(?, nome),
        citta           = COALESCE(?, citta),
        colore_primario = COALESCE(?, colore_primario),
        colore_accento  = COALESCE(?, colore_accento),
        logo_url        = COALESCE(?, logo_url),
        codice          = COALESCE(?, codice)
       WHERE id = ?`,
      [nome ?? null, citta ?? null, colorePrimario ?? null, coloreAccento ?? null, logoUrl ?? null, codice ?? null, societyId]
    );

    const [rows] = (await pool.execute(
      "SELECT id, nome, citta, colore_primario, colore_accento, logo_url, codice, piano, stato FROM societies WHERE id = ?",
      [societyId]
    )) as [any[], any];

    return res.json(rows[0]);
  } catch (e: any) {
    logger.error({ err: e }, "PUT society error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
