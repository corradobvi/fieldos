import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";

const router = Router();

function checkAuth(req: any, res: any): boolean {
  const secret   = req.headers["x-admin-secret"];
  const saSecret = process.env.ADMIN_RESET_SECRET;
  if (!saSecret || secret !== saSecret) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

const MAX = 100;

// GET /api/v2/_admin/audit-sessioni-libreria
router.get("/_admin/audit-sessioni-libreria", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    // 1. Totali per categoria
    const [totRows] = await pool.execute(`
      SELECT
        COUNT(*) AS totale,
        SUM(ufficiale_myvivaio = TRUE)  AS ufficiali_myvivaio,
        SUM(ufficiale_myvivaio = FALSE AND visibilita = 'privata')  AS private_mister,
        SUM(ufficiale_myvivaio = FALSE AND visibilita = 'pubblica') AS community
      FROM sessioni_libreria
    `) as [any[], any];
    const tot = totRows[0];

    // 2. Per società (non-ufficiali) — una riga per societa+creator
    const [socRows] = await pool.execute(`
      SELECT
        sl.societa_id,
        COALESCE(s.nome, '(nessuna)') AS societa_nome,
        COALESCE(u.email, '(sconosciuto)') AS creator_email,
        COUNT(*) AS sessioni_create,
        SUM(sl.visibilita = 'privata')  AS private,
        SUM(sl.visibilita = 'pubblica') AS pubbliche
      FROM sessioni_libreria sl
      LEFT JOIN societies s ON s.id = sl.societa_id
      LEFT JOIN users u ON u.id = sl.mister_id
      WHERE sl.ufficiale_myvivaio = FALSE
      GROUP BY sl.societa_id, sl.mister_id, s.nome, u.email
      ORDER BY sessioni_create DESC
      LIMIT ${MAX + 1}
    `) as [any[], any];
    const socTruncated = socRows.length > MAX;
    const perSocieta = socRows.slice(0, MAX).map((r: any) => ({
      societa_id:      r.societa_id,
      societa_nome:    r.societa_nome,
      creator_email:   r.creator_email,
      sessioni_create: Number(r.sessioni_create),
      private:         Number(r.private),
      pubbliche:       Number(r.pubbliche),
    }));

    // 3. Sessioni sospette per titolo (non-ufficiali)
    const KEYWORDS = ['test','prova','pippo','aaa','asd','xxx','123','tmp','foo','bar','esempio'];
    const likeClause = KEYWORDS.map(() => 'sl.titolo LIKE ?').join(' OR ');
    const likeParams = KEYWORDS.map(k => `%${k}%`);
    const [suspRows] = await pool.execute(`
      SELECT
        sl.id, sl.titolo, sl.societa_id,
        COALESCE(s.nome, '(nessuna)') AS societa_nome,
        COALESCE(u.email, '(sconosciuto)') AS creator_email,
        sl.visibilita, sl.created_at
      FROM sessioni_libreria sl
      LEFT JOIN societies s ON s.id = sl.societa_id
      LEFT JOIN users u ON u.id = sl.mister_id
      WHERE sl.ufficiale_myvivaio = FALSE AND (${likeClause})
      ORDER BY sl.created_at DESC
      LIMIT ${MAX + 1}
    `, likeParams) as [any[], any];
    const suspTruncated = suspRows.length > MAX;
    const sessioniTestSospette = suspRows.slice(0, MAX).map((r: any) => {
      const lower = (r.titolo as string).toLowerCase();
      const match = KEYWORDS.find(k => lower.includes(k)) ?? '';
      return {
        id:            r.id,
        titolo:        r.titolo,
        societa_id:    r.societa_id,
        societa_nome:  r.societa_nome,
        creator_email: r.creator_email,
        visibilita:    r.visibilita,
        created_at:    r.created_at,
        motivo_sospetto: `titolo contiene "${match}"`,
      };
    });

    // 4. Tutte le sessioni non-ufficiali
    const [allRows] = await pool.execute(`
      SELECT
        sl.id, sl.titolo, sl.categoria, sl.eta_leva, sl.durata_minuti,
        sl.visibilita, sl.societa_id,
        COALESCE(s.nome, '(nessuna)') AS societa_nome,
        COALESCE(u.email, '(sconosciuto)') AS creator_email,
        sl.created_at
      FROM sessioni_libreria sl
      LEFT JOIN societies s ON s.id = sl.societa_id
      LEFT JOIN users u ON u.id = sl.mister_id
      WHERE sl.ufficiale_myvivaio = FALSE
      ORDER BY sl.created_at DESC
      LIMIT ${MAX + 1}
    `) as [any[], any];
    const allTruncated = allRows.length > MAX;
    const tutteLeSessioniNonUfficiali = allRows.slice(0, MAX).map((r: any) => ({
      id:            r.id,
      titolo:        r.titolo,
      categoria:     r.categoria,
      eta_leva:      r.eta_leva,
      durata_minuti: r.durata_minuti,
      visibilita:    r.visibilita,
      societa_id:    r.societa_id,
      societa_nome:  r.societa_nome,
      creator_email: r.creator_email,
      created_at:    r.created_at,
    }));

    logger.info({ totale: Number(tot.totale) }, "admin: audit-sessioni-libreria");

    return res.json({
      totale_sessioni: Number(tot.totale),
      per_categoria: {
        ufficiali_myvivaio: Number(tot.ufficiali_myvivaio ?? 0),
        private_mister:     Number(tot.private_mister ?? 0),
        community:          Number(tot.community ?? 0),
      },
      per_societa:                      perSocieta,
      per_societa_truncated:            socTruncated,
      sessioni_test_sospette:           sessioniTestSospette,
      sessioni_test_sospette_truncated: suspTruncated,
      tutte_le_sessioni_non_ufficiali:           tutteLeSessioniNonUfficiali,
      tutte_le_sessioni_non_ufficiali_truncated: allTruncated,
    });
  } catch (e: any) {
    logger.error({ err: e }, "admin: audit-sessioni-libreria failed");
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

// POST /api/v2/_admin/delete-sessioni-libreria
// Body: { ids: string[] }  — cancella sessioni NON ufficiali per id
router.post("/_admin/delete-sessioni-libreria", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
  if (!ids.length) return res.status(400).json({ error: "ids array required" });
  if (ids.length > 50) return res.status(400).json({ error: "max 50 ids per call" });
  try {
    const placeholders = ids.map(() => '?').join(',');
    // Protezione: cancella solo sessioni NON ufficiali
    const [result] = await pool.execute(
      `DELETE FROM sessioni_libreria WHERE id IN (${placeholders}) AND ufficiale_myvivaio = FALSE`,
      ids
    ) as [any, any];
    logger.info({ deleted: result.affectedRows, ids }, "admin: delete-sessioni-libreria");
    return res.json({ ok: true, deleted: result.affectedRows, requested: ids.length });
  } catch (e: any) {
    logger.error({ err: e }, "admin: delete-sessioni-libreria failed");
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

export default router;
