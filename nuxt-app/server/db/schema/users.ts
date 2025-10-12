import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Create a role enum for user roles
export const roleEnum = pgEnum("role", ["admin", "worker"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  deleted_at: timestamp("deleted_at"),
  role: roleEnum("role").default("worker").notNull(),
  verified_at: timestamp("verified_at")
});
