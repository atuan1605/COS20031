import { db } from "../db";
import { users } from "../db/schema";
import { eq, isNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(isNull(users.deleted_at));
    return { users: allUsers };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch users",
    });
  }
});
