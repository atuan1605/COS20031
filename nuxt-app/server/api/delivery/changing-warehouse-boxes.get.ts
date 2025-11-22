import { db } from "../../db";
import { boxes } from "../../db/schema";
import { eq, isNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    // Get boxes with changingWarehouse status
    const changingBoxes = await db
      .select({
        id: boxes.id,
        code: boxes.code,
        warehouse_id: boxes.warehouse_id,
        status: boxes.status,
        created_at: boxes.created_at,
        updated_at: boxes.updated_at,
      })
      .from(boxes)
      .where(eq(boxes.status, "changingWarehouse"))
      .orderBy(boxes.updated_at);

    return {
      success: true,
      data: changingBoxes,
    };
  } catch (error: any) {
    console.error("Error fetching changing warehouse boxes:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch changing warehouse boxes",
    });
  }
});
