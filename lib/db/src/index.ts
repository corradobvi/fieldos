import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// pool is created unconditionally — pg.Pool is lazy and makes no connections
// until pool.connect() / pool.query() is first called, so this is safe even
// when DATABASE_URL is undefined (the server still starts and serves the SPA).
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
