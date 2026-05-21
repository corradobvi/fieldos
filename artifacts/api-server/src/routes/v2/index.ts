// v2 router — 2026-05-21
import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { SCHEMA_SQL, SEED_SQL, MIGRATIONS_SQL, PULCINI_SEED_SQL, ESORDIENTI_SEED_SQL, GIOVANISSIMI_SEED_SQL, ALLIEVI_SEED_SQL, JUNIORES_SEED_SQL } from "./schema";
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

const router = Router();

// Run schema creation on startup (idempotent)
let _schemaReady = false;
async function ensureSchema() {
  if (_schemaReady) return;
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

  // Explicit column guards for founding — SHOW COLUMNS is reliable across all MySQL versions
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

export default router;
