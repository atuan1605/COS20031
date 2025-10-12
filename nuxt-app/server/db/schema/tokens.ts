import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const tokens = pgTable("tokens", {
  id: uuid("id").primaryKey(),
  value: text("value").notNull().unique(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  expired_at: timestamp("expired_at").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations between tokens and users
export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.user_id],
    references: [users.id],
  }),
}));
