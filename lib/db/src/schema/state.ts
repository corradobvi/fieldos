import { mysqlTable, varchar, text, datetime } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const societyState = mysqlTable("society_state", {
  // MySQL cannot use TEXT as a primary key — use VARCHAR(255) instead
  key: varchar("key", { length: 255 }).primaryKey(),
  stateJson: text("state_json").notNull(),
  // MySQL has no TIMESTAMPTZ — use DATETIME and store UTC values
  updatedAt: datetime("updated_at")
    .notNull()
    .default(sql`NOW()`),
});

export type SocietyState = typeof societyState.$inferSelect;
export type InsertSocietyState = typeof societyState.$inferInsert;
