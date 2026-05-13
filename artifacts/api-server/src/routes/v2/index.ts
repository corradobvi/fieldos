import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { SCHEMA_SQL, SEED_SQL, MIGRATIONS_SQL } from "./schema";
import authRouter          from "./auth";
import selfRegisterRouter  from "./self-register";
import societyRouter       from "./society";
import leveRouter          from "./leve";
import playersRouter       from "./players";
import usersRouter         from "./users";
import eventsRouter        from "./events";
import presenzeRouter      from "./presenze";
import comunicazioniRouter from "./comunicazioni";
import chatRouter          from "./chat";
import quoteRouter         from "./quote";
import migrateRouter       from "./migrate";
import stripeRouter        from "./stripe";

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

router.use(authRouter);
router.use(selfRegisterRouter);
router.use(societyRouter);
router.use(leveRouter);
router.use(playersRouter);
router.use(usersRouter);
router.use(eventsRouter);
router.use(presenzeRouter);
router.use(comunicazioniRouter);
router.use(chatRouter);
router.use(quoteRouter);
router.use(migrateRouter);
router.use(stripeRouter);

export default router;
