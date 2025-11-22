import { trackingItems, trackingItemActionLoggers } from "../../db/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { getTrackingItemStatus, TrackingItemStatus } from "../../utils/trackingItemStatus";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id } = body;

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tracking item ID is required",
      });
    }

    // Get current item
    const items = await db
      .select()
      .from(trackingItems)
      .where(eq(trackingItems.id, id))
      .limit(1);

    if (items.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tracking item not found",
      });
    }

    const currentItem = items[0];

    if (!currentItem.chain) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tracking item is not in a chain",
      });
    }

    // Check if item is at packing status
    const currentStatus = getTrackingItemStatus(currentItem);
    if (currentStatus !== TrackingItemStatus.PACKING) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot remove from chain. Item must be at packing status. Current status: ${currentStatus}`,
      });
    }

    // Remove from chain and revert to receivedAtWarehouse status
    await db
      .update(trackingItems)
      .set({
        chain: null,
        packing_at: null,
        updated_at: new Date(),
      })
      .where(eq(trackingItems.id, id));

    // Log the action
    if (event.context.user) {
      await db.insert(trackingItemActionLoggers).values({
        user_id: event.context.user.id,
        type: {
          action: 'removeFromChain',
          trackingNumber: currentItem.tracking_number,
          trackingItemId: currentItem.id,
          chainId: currentItem.chain,
          timestamp: new Date().toISOString()
        }
      });
    }

    return {
      success: true,
      message: "Tracking item removed from chain successfully",
      data: {
        id,
        tracking_number: currentItem.tracking_number
      }
    };
  } catch (error: any) {
    console.error("Error removing tracking item from chain:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to remove tracking item from chain",
    });
  }
});
