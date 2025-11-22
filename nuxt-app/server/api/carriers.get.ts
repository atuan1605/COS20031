import { db } from "../db";
import { carriers } from "../db/schema";
import { isNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user;

    // Check if user is admin
    if (user.role !== "admin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Only admins can view carriers",
      });
    }

    const allCarriers = await db
      .select()
      .from(carriers)
      .where(isNull(carriers.deleted_at))
      .orderBy(carriers.created_at);

    return {
      success: true,
      data: allCarriers,
    };
  } catch (error: any) {
    console.error("Error fetching carriers:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch carriers",
    });
  }
});
