import { db } from "../../db";
import { boxes } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Box ID is required",
      });
    }

    // Soft delete by setting deleted_at timestamp
    await db
      .update(boxes)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(boxes.id, id));

    return {
      success: true,
      message: "Box deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting box:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete box",
    });
  }
});
