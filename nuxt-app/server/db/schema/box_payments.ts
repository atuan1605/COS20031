import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { boxes } from "./boxes";
import { payments } from "./payments";

export const boxPayments = pgTable("box_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  box_id: uuid("box_id")
    .notNull()
    .references(() => boxes.id),
  payment_id: uuid("payment_id")
    .notNull()
    .references(() => payments.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
