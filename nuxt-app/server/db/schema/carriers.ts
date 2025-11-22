import { pgTable, uuid, text, timestamp, decimal } from "drizzle-orm/pg-core";

export const carriers = pgTable("carriers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  contact: text("contact"),
  weight_coefficient: decimal("weight_coefficient", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});
