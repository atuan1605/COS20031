import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const trackingItems = pgTable("tracking_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
