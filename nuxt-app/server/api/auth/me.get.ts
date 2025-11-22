import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user?.id;

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        username: true,
        role: true,
        created_at: true,
        verified_at: true,
      },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    console.error("Error fetching user details:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch user details",
    });
  }
});
