import { pgTable, uuid, text, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { isNull, relations } from "drizzle-orm";
import { carriers } from "./carriers";
import { boxPayments } from "./box_payments";

export const paymentStatusEnum = pgEnum("payment_status", [
  "warehouse",
  "customer",
]);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").unique().notNull(),
  carrier_id: uuid("carrier_id")
    .notNull()
    .references(() => carriers.id),
  received_address: text("received_address"),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }),
  received_at: timestamp("received_at", { withTimezone: true }),
  delivering_at: timestamp("delivering_at", { withTimezone: true }),
  success_at: timestamp("success_at", { withTimezone: true }),
  status: paymentStatusEnum("status"), // 'warehouse', 'customer', 'changeWarehouse'
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  carrier: one(carriers, {
    fields: [payments.carrier_id],
    references: [carriers.id],
  }),
  boxPayments: many(boxPayments),
}));
