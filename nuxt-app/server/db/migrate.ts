import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Migration function
async function runMigration() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/nuxt_db";

  // Create a connection
  const connection = postgres(connectionString);
  const db = drizzle(connection);

  console.log("Running migrations...");

  // This will run the migrations
  await migrate(db, { migrationsFolder: "server/db/migrations" });

  console.log("Migrations completed!");

  // Close the connection
  await connection.end();
}

runMigration().catch(console.error);
