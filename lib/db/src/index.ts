import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Validate the URL before passing to mysql2 — Railway template strings like
// ${{MySQL.DATABASE_URL}} that are not yet resolved will throw "Invalid URL"
// and crash the server at startup. Fall back to placeholder so the server
// starts even when the DB variable is misconfigured.
function resolveDbUrl(): string {
  const raw = process.env.DATABASE_URL || "";
  if (!raw) return "mysql://localhost/placeholder";
  try {
    new URL(raw);
    return raw;
  } catch {
    return "mysql://localhost/placeholder";
  }
}

export const pool = mysql.createPool(resolveDbUrl());
export const db = drizzle(pool, { schema, mode: "default" });

export * from "./schema";
