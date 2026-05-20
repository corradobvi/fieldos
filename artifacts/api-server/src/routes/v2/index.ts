import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { SCHEMA_SQL, SEED_SQL, MIGRATIONS_SQL } from "./schema";
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
