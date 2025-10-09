import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export default {
  schema: "./server/db/schema",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:5432/nuxt_db",
  },
} satisfies Config;
