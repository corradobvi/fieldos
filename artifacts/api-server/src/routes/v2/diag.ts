import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";

const router = Router();
const SA_SECRET = process.env.SA_SECRET ?? "super123";

// GET /api/v2/_diag/societies-vs-allenamenti
// Endpoint TEMPORANEO — protetto da x-sa-secret — per diagnosticare bug cross-society
router.get("/_diag/societies-vs-allenamenti", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    // 1. Tutte le società nel DB
    const [societies] = (await pool.execute(
      "SELECT id, nome, piano, stato FROM societies ORDER BY id"
    )) as [any[], any];

    // 2. Tutti gli utenti (limit 100)
    const [users] = (await pool.execute(
      `SELECT id, email, CONCAT(nome, ' ', cognome) AS nome_completo,
              society_id, ruolo, stato
       FROM users ORDER BY society_id, id LIMIT 100`
    )) as [any[], any];

    // 3. Ultimi 30 allenamenti con nome società (JOIN)
    const [allenamenti] = (await pool.execute(
      `SELECT a.id, a.titolo, a.societa_id,
              s.nome AS societa_nome,
              a.event_id, a.leva_id, a.creato_da,
              u.email AS creato_da_email,
              a.created_at
       FROM allenamenti a
       LEFT JOIN societies s ON s.id = a.societa_id
       LEFT JOIN users u ON u.id = a.creato_da
       ORDER BY a.created_at DESC LIMIT 30`
    )) as [any[], any];

    // 4. societa_id orfani: presenti in allenamenti ma non in societies
    const [orphanRows] = (await pool.execute(
      `SELECT DISTINCT a.societa_id
       FROM allenamenti a
       LEFT JOIN societies s ON s.id = a.societa_id
       WHERE s.id IS NULL`
    )) as [any[], any];
    const orphan_societa_ids = orphanRows.map((r: any) => r.societa_id);

    // 5. Distribuzione: quanti allenamenti per societa_id
    const [countRows] = (await pool.execute(
      `SELECT a.societa_id, s.nome AS societa_nome, COUNT(*) AS n
       FROM allenamenti a
       LEFT JOIN societies s ON s.id = a.societa_id
       GROUP BY a.societa_id, s.nome
       ORDER BY a.societa_id`
    )) as [any[], any];

    // 6. Schema introspection
    const [tablesRows] = (await pool.execute(
      "SHOW TABLES LIKE 'user_societies'"
    )) as [any[], any];
    const ha_tabella_user_societies = tablesRows.length > 0;

    const [colSocietyIdUsers] = (await pool.execute(
      "SHOW COLUMNS FROM `users` LIKE 'society_id'"
    )) as [any[], any];
    const [colSocietaIdAll] = (await pool.execute(
      "SHOW COLUMNS FROM `allenamenti` LIKE 'societa_id'"
    )) as [any[], any];

    logger.info({ endpoint: "_diag/societies-vs-allenamenti" }, "diag endpoint called");

    return res.json({
      societies,
      users,
      allenamenti,
      allenamenti_per_societa: countRows,
      orphan_societa_ids,
      schema_check: {
        ha_tabella_user_societies,
        colonna_society_id_su_users: colSocietyIdUsers.length > 0,
        colonna_societa_id_su_allenamenti: colSocietaIdAll.length > 0,
      },
    });
  } catch (e: any) {
    logger.error({ err: e }, "_diag/societies-vs-allenamenti error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

export default router;
