import { pgTable, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";
import { carriers } from "./carriers";
import { relations } from "drizzle-orm";

export const trackingItemActionLoggers = pgTable("tracking_item_action_loggers", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id),
  carrier_id: uuid("carrier_id").references(() => carriers.id),
  type: jsonb("type").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Define relations
export const trackingItemActionLoggersRelations = relations(trackingItemActionLoggers, ({ one }) => ({
  user: one(users, {
    fields: [trackingItemActionLoggers.user_id],
    references: [users.id],
  }),
  carrier: one(carriers, {
    fields: [trackingItemActionLoggers.carrier_id],
    references: [carriers.id],
  }),
}));
