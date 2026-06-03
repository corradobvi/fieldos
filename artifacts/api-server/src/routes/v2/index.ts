// v2 router — 2026-05-21
import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { SCHEMA_SQL, SEED_SQL, MIGRATIONS_SQL, PULCINI_SEED_SQL, ESORDIENTI_SEED_SQL, GIOVANISSIMI_SEED_SQL, ALLIEVI_SEED_SQL, JUNIORES_SEED_SQL, PRIMI_CALCI_SEED_SQL } from "./schema";
import authRouter          from "./auth";
import selfRegisterRouter  from "./self-register";
import societyRouter       from "./society";
import leveRouter          from "./leve";
import playersRouter       from "./players";
import minorsRouter        from "./minors";
import usersRouter         from "./users";
import eventsRouter        from "./events";
import presenzeRouter      from "./presenze";
import comunicazioniRouter from "./comunicazioni";
import chatRouter          from "./chat";
import quoteRouter         from "./quote";
import migrateRouter       from "./migrate";
import stripeRouter        from "./stripe";
import demoWaRouter        from "./demo-wa";
import superadminRouter    from "./superadmin";
import accountRouter            from "./account";
import notifPrefsRouter        from "./notification-preferences";
import allenamentiRouter       from "./allenamenti";
import aiAllenamentiRouter     from "./ai-allenamenti";
import aiTorneiRouter          from "./ai-tornei";
import utmStatsRouter          from "./utm-stats";
import adminResetDemoRouter    from "./admin-reset-demo";
import adminPopulateSessioniRouter from "./admin-populate-sessioni";
import selectPlanRouter            from "./select-plan";
import adminGenitoreDebugRouter    from "./admin-genitore-debug";
import adminPushDebugRouter        from "./admin-push-debug";
import adminCleanupPreviewRouter   from "./admin-cleanup-preview";
import adminBackfillRolesRouter    from "./admin-backfill-roles";
import notificheRisultatoRouter    from "./notifiche-risultato";
import migratePolisRouter          from "./migrate-polis";
import matchesRouter               from "./matches";
import statsRouter                 from "./stats";
import adminBackfillMatchesRouter  from "./admin-backfill-matches";
const router = Router();

// Run schema creation on startup (idempotent)
let _schemaReady = false;
async function ensureSchema() {
  if (_schemaReady) return;
  console.log("[SCHEMA_GUARD] ensureSchema started");
  const statements = SCHEMA_SQL.split(";").map(s => s.trim()).filter(Boolean);
  for (const sql of statements) {
    await pool.execute(sql);
  }
  // Idempotent migrations — ignore errno 1060 (duplicate column) only
  const migrations = MIGRATIONS_SQL.split(";").map(s => s.trim()).filter(Boolean);
  for (const sql of migrations) {
    await pool.execute(sql).catch((e: any) => {
      if (e?.errno !== 1060) logger.warn({ errno: e?.errno, msg: e?.message?.slice(0, 80) }, "migration warning");
    });
  }

  // Explicit column guards — SHOW COLUMNS is reliable across all MySQL versions
  for (const [table, col, def] of [
    ["users",     "founding_promo_pending", "VARCHAR(20) NULL DEFAULT NULL"],
    ["societies", "founding_active",        "VARCHAR(20) NULL DEFAULT NULL"],
  ] as [string, string, string][]) {
    try {
      const [cols] = await pool.execute(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [col]) as [any[], any];
      if (!cols.length) {
        await pool.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` ${def}`);
        logger.info({ table, col }, "v2: column added via explicit guard");
      }
    } catch (e: any) {
      logger.error({ table, col, err: e?.message }, "v2: explicit column guard failed");
    }
  }

  // Guard budget_key: colonna regolare (NON generated) — GENERATED ALWAYS fallisce su Railway MySQL in ALTER TABLE
  try {
    console.log("[SCHEMA_GUARD] checking budget_key column");
    const [cols] = await pool.execute("SHOW COLUMNS FROM `ai_budget_utilizzo` LIKE 'budget_key'") as [any[], any];
    console.log(`[SCHEMA_GUARD] budget_key result: found=${cols.length} rows`);
    if (!cols.length) {
      console.log("[SCHEMA_GUARD] budget_key MISSING — adding regular VARCHAR column");
      await pool.execute("ALTER TABLE `ai_budget_utilizzo` ADD COLUMN `budget_key` VARCHAR(50) NULL");
      await pool.execute(
        "UPDATE `ai_budget_utilizzo` SET `budget_key` = CONCAT(COALESCE(mister_id,0),'_',COALESCE(societa_id,0),'_',mese_riferimento) WHERE `budget_key` IS NULL"
      );
      console.log("[SCHEMA_GUARD] budget_key column added and existing rows populated");
      logger.info("v2: budget_key regular column added via guard");
    }
  } catch (e: any) {
    console.log(`[SCHEMA_GUARD] budget_key guard FAILED: ${e?.message}`);
    logger.error({ err: e?.message }, "v2: budget_key column guard failed");
  }

  // Guard: unique index uq_ai_budget_key su ai_budget_utilizzo (con deduplicazione preventiva)
  try {
    const [idxRows] = await pool.execute(
      "SHOW INDEX FROM `ai_budget_utilizzo` WHERE Key_name = 'uq_ai_budget_key'"
    ) as [any[], any];
    if (!idxRows.length) {
      // Deduplicazione: mantieni la riga con id minore per ogni budget_key
      await pool.execute(
        "DELETE t1 FROM `ai_budget_utilizzo` t1 INNER JOIN `ai_budget_utilizzo` t2 ON t1.budget_key = t2.budget_key AND t1.id > t2.id"
      );
      console.log("[SCHEMA_GUARD] ai_budget_utilizzo deduplicata");
      await pool.execute("ALTER TABLE `ai_budget_utilizzo` ADD UNIQUE KEY uq_ai_budget_key (`budget_key`)");
      console.log("[SCHEMA_GUARD] uq_ai_budget_key index added");
      logger.info("v2: uq_ai_budget_key index added via explicit guard");
    }
  } catch (e: any) {
    console.log(`[SCHEMA_GUARD] uq_ai_budget_key index guard FAILED: ${e?.message}`);
    logger.error({ err: e?.message }, "v2: uq_ai_budget_key index guard failed");
  }

  // ENUM guard: aggiunge 'primi_calci' a eta_leva se non già presente
  try {
    const [enumRows] = await pool.execute(
      "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='sessioni_libreria' AND COLUMN_NAME='eta_leva' AND TABLE_SCHEMA=DATABASE()"
    ) as [any[], any];
    if (enumRows.length && !String(enumRows[0].COLUMN_TYPE).includes("primi_calci")) {
      await pool.execute(
        "ALTER TABLE sessioni_libreria MODIFY COLUMN eta_leva ENUM('primi_calci','pulcini','esordienti','giovanissimi','allievi','juniores') NOT NULL"
      );
      logger.info("v2: eta_leva ENUM esteso con primi_calci");
    }
  } catch (e: any) {
    logger.warn({ err: e?.message }, "v2: ENUM guard primi_calci fallito");
  }

  // Pulcini official seed — run only when count < 70 (idempotent via NOT EXISTS guards)
  try {
    const [pulciniCheck] = await pool.execute(
      "SELECT COUNT(*) AS n FROM sessioni_libreria WHERE ufficiale_myvivaio=TRUE AND eta_leva='pulcini'"
    ) as [any[], any];
    if ((pulciniCheck[0].n ?? 0) < 70) {
      const pulciniStatements = PULCINI_SEED_SQL.split(";").map((s: string) => s.trim()).filter(Boolean);
      for (const sql of pulciniStatements) {
        await pool.execute(sql).catch((e: any) => {
          logger.warn({ err: e?.message?.slice(0, 100) }, "pulcini seed warning");
        });
      }
      logger.info("v2: pulcini official sessions seeded");
    }
  } catch (e: any) {
    logger.warn({ err: e?.message }, "v2: pulcini seed skipped (table not ready yet)");
  }

  // Esordienti official seed — run only when count < 70 (idempotent via NOT EXISTS guards)
  try {
    const [esordientiCheck] = await pool.execute(
      "SELECT COUNT(*) AS n FROM sessioni_libreria WHERE ufficiale_myvivaio=TRUE AND eta_leva='esordienti'"
    ) as [any[], any];
    if ((esordientiCheck[0].n ?? 0) < 70) {
      const esordientiStatements = ESORDIENTI_SEED_SQL.split(";").map((s: string) => s.trim()).filter(Boolean);
      for (const sql of esordientiStatements) {
        await pool.execute(sql).catch((e: any) => {
          logger.warn({ err: e?.message?.slice(0, 100) }, "esordienti seed warning");
        });
      }
      logger.info("v2: esordienti official sessions seeded");
    }
  } catch (e: any) {
    logger.warn({ err: e?.message }, "v2: esordienti seed skipped (table not ready yet)");
  }

  // Giovanissimi official seed — run only when count < 70 (idempotent via NOT EXISTS guards)
  try {
    const [giovanissimiCheck] = await pool.execute(
      "SELECT COUNT(*) AS n FROM sessioni_libreria WHERE ufficiale_myvivaio=TRUE AND eta_leva='giovanissimi'"
    ) as [any[], any];
    if ((giovanissimiCheck[0].n ?? 0) < 70) {
      const giovanissimiStatements = GIOVANISSIMI_SEED_SQL.split(";").map((s: string) => s.trim()).filter(Boolean);
      for (const sql of giovanissimiStatements) {
        await pool.execute(sql).catch((e: any) => {
          logger.warn({ err: e?.message?.slice(0, 100) }, "giovanissimi seed warning");
        });
      }
      logger.info("v2: giovanissimi official sessions seeded");
    }
  } catch (e: any) {
    logger.warn({ err: e?.message }, "v2: giovanissimi seed skipped (table not ready yet)");
  }

  // Allievi official seed — run only when count < 70 (idempotent via NOT EXISTS guards)
  try {
    const [allieviCheck] = await pool.execute(
      "SELECT COUNT(*) AS n FROM sessioni_libreria WHERE ufficiale_myvivaio=TRUE AND eta_leva='allievi'"
    ) as [any[], any];
    if ((allieviCheck[0].n ?? 0) < 70) {
      const allieviStatements = ALLIEVI_SEED_SQL.split(";").map((s: string) => s.trim()).filter(Boolean);
      for (const sql of allieviStatements) {
        await pool.execute(sql).catch((e: any) => {
          logger.warn({ err: e?.message?.slice(0, 100) }, "allievi seed warning");
        });
      }
      logger.info("v2: allievi official sessions seeded");
    }
  } catch (e: any) {
    logger.warn({ err: e?.message }, "v2: allievi seed skipped (table not ready yet)");
  }

  // Juniores official seed — run only when count < 70 (idempotent via NOT EXISTS guards)
  try {
    const [junioresCheck] = await pool.execute(
      "SELECT COUNT(*) AS n FROM sessioni_libreria WHERE ufficiale_myvivaio=TRUE AND eta_leva='juniores'"
    ) as [any[], any];
    if ((junioresCheck[0].n ?? 0) < 70) {
      const junioresStatements = JUNIORES_SEED_SQL.split(";").map((s: string) => s.trim()).filter(Boolean);
      for (const sql of junioresStatements) {
        await pool.execute(sql).catch((e: any) => {
          logger.warn({ err: e?.message?.slice(0, 100) }, "juniores seed warning");
        });
      }
      logger.info("v2: juniores official sessions seeded");
    }
  } catch (e: any) {
    logger.warn({ err: e?.message }, "v2: juniores seed skipped (table not ready yet)");
  }

  // Primi Calci official seed — run only when count < 70 (idempotent via NOT EXISTS guards)
  try {
    const [primiCalciCheck] = await pool.execute(
      "SELECT COUNT(*) AS n FROM sessioni_libreria WHERE ufficiale_myvivaio=TRUE AND eta_leva='primi_calci'"
    ) as [any[], any];
    if ((primiCalciCheck[0].n ?? 0) < 70) {
      const primiCalciStatements = PRIMI_CALCI_SEED_SQL.split(";").map((s: string) => s.trim()).filter(Boolean);
      for (const sql of primiCalciStatements) {
        await pool.execute(sql).catch((e: any) => {
          logger.warn({ err: e?.message?.slice(0, 100) }, "primi_calci seed warning");
        });
      }
      logger.info("v2: primi_calci official sessions seeded");
    }
  } catch (e: any) {
    logger.warn({ err: e?.message }, "v2: primi_calci seed skipped (table not ready yet)");
  }

  // Seed only if no societies exist yet
  const [rows] = (await pool.execute("SELECT COUNT(*) AS n FROM societies")) as [any[], any];
  if (rows[0].n === 0) {
    const seeds = SEED_SQL.split(";").map(s => s.trim()).filter(Boolean);
    for (const sql of seeds) {
      await pool.execute(sql);
    }
    logger.info("v2: seed data inserted");
  }
  _schemaReady = true;
  console.log("[SCHEMA_GUARD] ensureSchema completed — _schemaReady=true");
  logger.info("v2: schema ready");
}

// Middleware: ensure schema before any v2 request
router.use(async (_req, _res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (e: any) {
    logger.error({ err: e }, "v2: schema init failed");
    next(); // continue anyway — individual routes will fail gracefully
  }
});

// GET /api/v2/schema-info — public diagnostic, returns column presence for founding fields
router.get("/schema-info", async (_req, res) => {
  try {
    const check = async (table: string, col: string) => {
      const [r] = await pool.execute(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [col]) as [any[], any];
      return r.length > 0;
    };
    const [usersCols] = await pool.execute("SHOW COLUMNS FROM users") as [any[], any];
    const [socCols]   = await pool.execute("SHOW COLUMNS FROM societies") as [any[], any];
    return res.json({
      users_founding_promo_pending: await check("users",     "founding_promo_pending"),
      societies_founding_active:    await check("societies", "founding_active"),
      users_columns:    usersCols.map((c: any) => c.Field),
      societies_columns: socCols.map((c: any) => c.Field),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});


// GET /api/v2/health/ai-key — diagnostic: verifica presenza ANTHROPIC_API_KEY senza esporla
router.get("/health/ai-key", (_req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.json({ configured: false, keyLength: null, keyPrefix: null });
  }
  return res.json({
    configured: true,
    keyLength: key.length,
    keyPrefix: key.slice(0, 7) + "...",
  });
});

// GET /api/v2/health/schema-budget — TEMP diagnostic: colonne reali di ai_budget_utilizzo
router.get("/health/schema-budget", async (_req, res) => {
  try {
    const [cols] = await pool.execute("SHOW COLUMNS FROM `ai_budget_utilizzo`") as [any[], any];
    const [idxRows] = await pool.execute("SHOW INDEX FROM `ai_budget_utilizzo`") as [any[], any];
    return res.json({
      schemaReady: _schemaReady,
      columns: cols.map((c: any) => ({ field: c.Field, type: c.Type, null: c.Null, key: c.Key, extra: c.Extra })),
      indexes: idxRows.map((r: any) => ({ keyName: r.Key_name, column: r.Column_name, unique: r.Non_unique === 0 })),
      hasBudgetKey: cols.some((c: any) => c.Field === "budget_key"),
      hasUqIndex: idxRows.some((r: any) => r.Key_name === "uq_ai_budget_key"),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

router.use(authRouter);
router.use(selfRegisterRouter);
router.use(societyRouter);
router.use(leveRouter);
router.use(minorsRouter);
router.use(playersRouter);
router.use(usersRouter);
router.use(eventsRouter);
router.use(presenzeRouter);
router.use(comunicazioniRouter);
router.use(chatRouter);
router.use(quoteRouter);
router.use(migrateRouter);
router.use(stripeRouter);
router.use(demoWaRouter);
router.use(superadminRouter);
router.use(accountRouter);
router.use(notifPrefsRouter);
router.use(allenamentiRouter);
router.use(aiAllenamentiRouter);
router.use(aiTorneiRouter);
router.use(utmStatsRouter);
router.use(adminResetDemoRouter);
router.use(adminPopulateSessioniRouter);
router.use(selectPlanRouter);
router.use(adminGenitoreDebugRouter);
router.use(adminPushDebugRouter);
router.use(adminCleanupPreviewRouter);
router.use(adminBackfillRolesRouter);
router.use(notificheRisultatoRouter);
router.use(migratePolisRouter);
router.use(matchesRouter);
router.use(statsRouter);
router.use(adminBackfillMatchesRouter);
export default router;
