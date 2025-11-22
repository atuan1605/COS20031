import { db } from "../db";
import { boxes } from "../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { code, warehouseId } = body;

    if (!code || !code.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Box code is required",
      });
    }

    if (!warehouseId || !warehouseId.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Warehouse ID is required",
      });
    }

    // Check if code already exists
    const existingBox = await db.query.boxes.findFirst({
      where: eq(boxes.code, code.trim()),
    });

    if (existingBox) {
      throw createError({
        statusCode: 400,
        statusMessage: "Box code already exists",
      });
    }

    // Create new box
    const newBox = await db
      .insert(boxes)
      .values({
        code: code.trim(),
        warehouse_id: warehouseId.trim(),
      })
      .returning();

    return {
      success: true,
      data: newBox[0],
    };
  } catch (error: any) {
    console.error("Error creating box:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create box",
    });
  }
});
