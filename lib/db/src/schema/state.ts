import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const societyState = pgTable("society_state", {
  key: text("key").primaryKey(),
  stateJson: text("state_json").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SocietyState = typeof societyState.$inferSelect;
export type InsertSocietyState = typeof societyState.$inferInsert;
