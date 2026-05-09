import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// pool is created unconditionally — mysql2 pool is lazy and makes no connections
// until a query is first executed, so this is safe even when DATABASE_URL is
// undefined (the server still starts and serves the SPA).
export const pool = mysql.createPool({
  uri: process.env.DATABASE_URL ?? "mysql://localhost/placeholder",
  // Aruba MySQL default max_allowed_packet può essere basso; impostiamo 64MB lato client
  maxAllowedPacket: 64 * 1024 * 1024,
});
export const db = drizzle(pool, { schema, mode: "default" });

export * from "./schema";
