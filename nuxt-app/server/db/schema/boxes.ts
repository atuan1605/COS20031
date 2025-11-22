import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const boxes = pgTable("boxes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").unique().notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});
