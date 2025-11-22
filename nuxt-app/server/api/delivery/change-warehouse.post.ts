import { db } from "../../db";
import { boxes, trackingItems, trackingItemActionLoggers } from "../../db/schema";
import { eq, isNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { boxCode, warehouseId } = body;

    if (!boxCode || !boxCode.trim()) {
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

    // Check if box exists
    const box = await db.query.boxes.findFirst({
      where: eq(boxes.code, boxCode.trim()),
    });

    if (!box) {
      throw createError({
        statusCode: 404,
        statusMessage: "Box not found",
      });
    }

    // Get all tracking items in this box
    const items = await db
      .select()
      .from(trackingItems)
      .where(eq(trackingItems.box_id, box.id));

    if (items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No tracking items found in this box",
      });
    }

    // Update all tracking items with transaction
    await db.transaction(async (tx) => {
      const now = new Date();

      for (const item of items) {
        // Update tracking item - change warehouse and set changing_warehouse_at
        await tx
          .update(trackingItems)
          .set({
            warehouse_id: warehouseId,
            changing_warehouse_at: now,
            updated_at: now,
          })
          .where(eq(trackingItems.id, item.id));

        // Log the action
        await tx.insert(trackingItemActionLoggers).values({
          user_id: event.context.user.id,
          type: {
            action: "changingWarehouse",
            trackingItemId: item.id,
            trackingNumber: item.tracking_number,
            boxId: box.id,
            boxCode: box.code,
            newWarehouseId: warehouseId,
            oldWarehouseId: item.warehouse_id,
          },
        });
      }
    });

    return {
      success: true,
      message: `Successfully changed warehouse for ${items.length} tracking item(s) in box ${boxCode}`,
      data: {
        itemsUpdated: items.length,
        boxCode: boxCode,
        newWarehouseId: warehouseId,
      },
    };
  } catch (error: any) {
    console.error("Error changing warehouse:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to change warehouse",
    });
  }
});
