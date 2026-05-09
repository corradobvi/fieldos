import { mysqlTable, varchar, longtext, timestamp } from "drizzle-orm/mysql-core";

export const societyState = mysqlTable("society_state", {
  key: varchar("key", { length: 255 }).primaryKey(),
  stateJson: longtext("state_json").notNull(),
  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SocietyState = typeof societyState.$inferSelect;
export type InsertSocietyState = typeof societyState.$inferInsert;
