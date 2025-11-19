import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Create a status enum for warehouse status
export const warehouseStatusEnum = pgEnum("warehouse_status", ["active", "inactive"]);

export const warehouses = pgTable("warehouses", {
  id: text("id").primaryKey(),
  address: text("address").notNull(),
  status: warehouseStatusEnum("status").default("active").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  inactive_at: timestamp("inactive_at"),
});
