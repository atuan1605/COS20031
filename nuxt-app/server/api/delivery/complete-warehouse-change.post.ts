import { db } from "../../db";
import { boxes, trackingItems, trackingItemActionLoggers } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { boxId } = body;

    if (!boxId || !boxId.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Box ID is required",
      });
    }

    // Check if box exists
    const box = await db.query.boxes.findFirst({
      where: eq(boxes.id, boxId),
    });

    if (!box) {
      throw createError({
        statusCode: 404,
        statusMessage: "Box not found",
      });
    }

    // Check if box is in changingWarehouse status
    if (box.status !== "changingWarehouse") {
      throw createError({
        statusCode: 400,
        statusMessage: "Box is not in changing warehouse status",
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

    // Update box and all tracking items in transaction
    await db.transaction(async (tx) => {
      const now = new Date();

      // Update box status to changedWarehouse
      await tx
        .update(boxes)
        .set({
          status: "changedWarehouse",
          updated_at: now,
        })
        .where(eq(boxes.id, box.id));

      // Update all tracking items to changedWarehouse status
      for (const item of items) {
        await tx
          .update(trackingItems)
          .set({
            changed_warehouse_at: now,
            updated_at: now,
          })
          .where(eq(trackingItems.id, item.id));

        // Log the action
        await tx.insert(trackingItemActionLoggers).values({
          user_id: event.context.user.id,
          type: {
            action: "changedWarehouse",
            trackingItemId: item.id,
            trackingNumber: item.tracking_number,
            boxId: box.id,
            boxCode: box.code,
            warehouseId: item.warehouse_id,
          },
        });
      }
    });

    return {
      success: true,
      message: `Successfully completed warehouse change for box ${box.code} with ${items.length} tracking item(s)`,
      data: {
        boxId: box.id,
        boxCode: box.code,
        itemsUpdated: items.length,
      },
    };
  } catch (error: any) {
    console.error("Error completing warehouse change:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to complete warehouse change",
    });
  }
});
