import { db } from "../../../db";
import { boxes, trackingItems, trackingItemActionLoggers } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);
    const { trackingItemId } = body;

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Box ID is required",
      });
    }

    if (!trackingItemId || !trackingItemId.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tracking item ID is required",
      });
    }

    // Check if box exists
    const box = await db.query.boxes.findFirst({
      where: eq(boxes.id, id),
    });

    if (!box) {
      throw createError({
        statusCode: 404,
        statusMessage: "Box not found",
      });
    }

    // Get the tracking item
    const trackingItemResult = await db
      .select()
      .from(trackingItems)
      .where(eq(trackingItems.id, trackingItemId.trim()))
      .limit(1);

    if (trackingItemResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tracking item not found",
      });
    }

    const trackingItem = trackingItemResult[0];

    // Check if tracking item is in this box
    if (trackingItem.box_id !== id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tracking item is not in this box",
      });
    }

    // If tracking item has a chain, get all items in that chain that are in this box
    const itemsToRemove: string[] = [trackingItem.id];

    if (trackingItem.chain) {
      const chainItems = await db
        .select({ id: trackingItems.id })
        .from(trackingItems)
        .where(
          and(
            eq(trackingItems.chain, trackingItem.chain),
            eq(trackingItems.box_id, id)
          )
        );

      // Add all chain items to the remove list
      chainItems.forEach(item => {
        if (!itemsToRemove.includes(item.id)) {
          itemsToRemove.push(item.id);
        }
      });
    }

    // Remove tracking items from box with transaction
    await db.transaction(async (tx) => {
      const now = new Date();

      // Update all tracking items - remove box_id and boxed_at
      for (const itemId of itemsToRemove) {
        await tx
          .update(trackingItems)
          .set({
            box_id: null,
            boxed_at: null,
            updated_at: now,
          })
          .where(eq(trackingItems.id, itemId));

        // Log the action for each item
        await tx.insert(trackingItemActionLoggers).values({
          user_id: event.context.user.id,
          type: {
            action: "removeFromBox",
            trackingItemId: itemId,
            boxId: id,
            boxCode: box.code,
            trackingNumber: trackingItem.tracking_number,
          },
        });
      }
    });

    return {
      success: true,
      message: `Successfully removed ${itemsToRemove.length} tracking item(s) from box`,
      data: {
        itemsRemoved: itemsToRemove.length,
      },
    };
  } catch (error: any) {
    console.error("Error removing tracking item from box:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to remove tracking item from box",
    });
  }
});
