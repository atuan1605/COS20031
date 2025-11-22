import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { warehouses } from "./warehouses";

export const boxStatusEnum = pgEnum("box_status", [
  "none",
  "changingWarehouse",
  "changedWarehouse",
  "delivering",
  "delivered",
]);

export const boxes = pgTable("boxes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").unique().notNull(),
  warehouse_id: text("warehouse_id").references(() => warehouses.id),
  status: boxStatusEnum("status").default("none").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  committed_at: timestamp("committed_at", { withTimezone: true }),
});
