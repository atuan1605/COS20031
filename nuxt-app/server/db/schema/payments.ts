import { pgTable, uuid, text, timestamp, decimal } from "drizzle-orm/pg-core";
import { carriers } from "./carriers";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  carrier_id: uuid("carrier_id")
    .notNull()
    .references(() => carriers.id),
  received_address: text("received_address"),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});
