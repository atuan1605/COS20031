import { trackingItems, trackingItemActionLoggers } from "../../db/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { getTrackingItemStatus, TrackingItemStatus } from "../../utils/trackingItemStatus";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id, weight, amount } = body;

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
    const updates: any = {
      updated_at: new Date(),
    };


    // Only allow weight update if status is packing or receivedAtWarehouse
    const currentStatus = getTrackingItemStatus(currentItem);
    if (weight !== undefined && weight !== null) {
      if (currentStatus === TrackingItemStatus.PACKING || currentStatus === TrackingItemStatus.RECEIVED_AT_WAREHOUSE) {
        updates.weight = weight;
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: "Weight can only be updated when status is Packing or Received at Warehouse",
        });
      }
    }

    // Update amount if provided
    if (amount !== undefined && amount !== null) {
      if (currentStatus === TrackingItemStatus.PACKING || currentStatus === TrackingItemStatus.RECEIVED_AT_WAREHOUSE) {
        updates.amount = amount;
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: "Weight can only be updated when status is Packing or Received at Warehouse",
        });
      }

    }

    // Apply updates to current item
    if (Object.keys(updates).length > 1) { // More than just updated_at
      await db
        .update(trackingItems)
        .set(updates)
        .where(eq(trackingItems.id, id));

      // Log the update action
      if (event.context.user) {
        await db.insert(trackingItemActionLoggers).values({
          user_id: event.context.user.id,
          type: {
            action: 'updateTrackingItem',
            trackingNumber: currentItem.tracking_number,
            trackingItemId: currentItem.id,
            updates: {
              weight: weight !== undefined ? weight : undefined,
              amount: amount !== undefined ? amount : undefined
            },
            timestamp: new Date().toISOString()
          }
        });
      }
    }

    return {
      success: true,
      message: "Tracking item updated successfully",
      data: {
        id,
        amount: updates.amount,
        weight: updates.weight
      }
    };
  } catch (error: any) {
    console.error("Error updating tracking item:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update tracking item",
    });
  }
});
