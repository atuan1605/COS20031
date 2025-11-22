import { trackingItems, trackingItemActionLoggers } from "../../db/schema";
import { db } from "../../db";
import { eq, and, isNull } from "drizzle-orm";
import { getTrackingItemStatus, TrackingItemStatus, moveToStatus } from "../../utils/trackingItemStatus";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id, weight, chainTrackingNumber } = body;

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

    // Update weight if provided
    if (weight !== undefined && weight !== null) {
      updates.weight = weight.toString();
    }

    // Handle chain update
    if (chainTrackingNumber) {
      // Find the tracking item to add to chain
      const chainItems = await db
        .select()
        .from(trackingItems)
        .where(eq(trackingItems.tracking_number, chainTrackingNumber))
        .limit(1);

      if (chainItems.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: `Tracking number ${chainTrackingNumber} not found`,
        });
      }

      const chainItem = chainItems[0];
      const chainItemStatus = getTrackingItemStatus(chainItem);

      // Check if chain item is at receivedAtWarehouse status ONLY
      // Must have receivedAtWarehouseAt set and all other status timestamps null
      if (
        chainItemStatus !== TrackingItemStatus.RECEIVED_AT_WAREHOUSE ||
        !chainItem.received_at_warehouse_at ||
        chainItem.packing_at !== null ||
        chainItem.boxed_at !== null ||
        chainItem.delivering_at !== null ||
        chainItem.delivered_at !== null
      ) {
        throw createError({
          statusCode: 400,
          statusMessage: `Tracking item ${chainTrackingNumber} must be at receivedAtWarehouse status only (no other status set). Current status: ${chainItemStatus}`,
        });
      }

      // Generate chain UUID if current item doesn't have one
      if (!currentItem.chain) {
        updates.chain = crypto.randomUUID();
      }

      // Update chain item: set chain and move to packing status
      await db
        .update(trackingItems)
        .set({
          chain: currentItem.chain || updates.chain,
          packing_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(trackingItems.id, chainItem.id));

      // Log the chain action
      if (event.context.user) {
        await db.insert(trackingItemActionLoggers).values({
          user_id: event.context.user.id,
          type: {
            action: 'addToChain',
            trackingNumber: chainItem.tracking_number,
            trackingItemId: chainItem.id,
            chainId: currentItem.chain || updates.chain,
            chainedTo: currentItem.tracking_number,
            timestamp: new Date().toISOString()
          }
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
              chain: chainTrackingNumber ? (currentItem.chain || updates.chain) : undefined
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
        chain: currentItem.chain || updates.chain,
        chainTrackingNumber
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
