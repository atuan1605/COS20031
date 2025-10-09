import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Use the DATABASE_URL environment variable
const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/nuxt_db";

// For server-side only
const client = postgres(connectionString);
export const db = drizzle(client);
