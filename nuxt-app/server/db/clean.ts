import { db } from "./index";
import { users, tokens } from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

async function cleanDatabase() {
  try {
    console.log("🧹 Cleaning database...");

    // Xóa tất cả tokens trước (vì có foreign key)
    await db.delete(tokens);
    console.log("✅ Deleted all tokens");

    // Xóa tất cả users
    await db.delete(users);
    console.log("✅ Deleted all users");

    console.log("🎉 Database cleaned successfully!");
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    throw error;
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanDatabase().catch(console.error);
}

export { cleanDatabase };
