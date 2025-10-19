import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";

// Create returned_items_status enum
export const returnedItemsStatusEnum = pgEnum("returned_items_status_enum", [
  "none",
  "returnedAtWarehouse",
  "customerReturn",
  "continue",
]);

export const trackingItems = pgTable("tracking_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  returned_at: timestamp("returned_at", { withTimezone: true }),
  returned_status: returnedItemsStatusEnum("returned_status").default("none"),
  tracking_number: text("tracking_number").unique().notNull(),
  file: text("file"),
  weight: decimal("weight", { precision: 6, scale: 2 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  received_at_warehouse_at: timestamp("received_at_warehouse_at", {
    withTimezone: true,
  }),
  packing_at: timestamp("packing_at", { withTimezone: true }),
  boxed_at: timestamp("boxed_at", { withTimezone: true }),
  delivering_at: timestamp("delivering_at", { withTimezone: true }),
  delivered_at: timestamp("delivered_at", { withTimezone: true }),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  is_fragile_item: boolean("is_fragile_item").default(false),
});
