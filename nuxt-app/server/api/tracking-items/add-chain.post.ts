import { trackingItems, trackingItemActionLoggers } from "../../db/schema";
import { db } from "../../db";
import { eq, inArray } from "drizzle-orm";
import { getTrackingItemStatus, TrackingItemStatus } from "../../utils/trackingItemStatus";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    // Accept array of tracking_numbers or ids
    const { trackingNumbers = [], trackingIds = [], chainId: inputChainId } = body;
    if ((!trackingNumbers || trackingNumbers.length === 0) && (!trackingIds || trackingIds.length === 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Must provide trackingNumbers or trackingIds array",
      });
    }

    // Fetch all items by trackingNumbers or ids
    let items: any[] = [];
    if (trackingNumbers.length > 0) {
      items = await db.select().from(trackingItems).where(inArray(trackingItems.tracking_number, trackingNumbers));
    }
    if (trackingIds.length > 0) {
      const byId = await db.select().from(trackingItems).where(inArray(trackingItems.id, trackingIds));
      items = items.concat(byId);
    }
    // Remove duplicates
    const seen = new Set();
    items = items.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    if (items.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "No tracking items found",
      });
    }

    // Check all items have valid status (packing or receivedAtWarehouse) first
    for (const item of items) {
      const status = getTrackingItemStatus(item);
      if (status !== TrackingItemStatus.PACKING && status !== TrackingItemStatus.RECEIVED_AT_WAREHOUSE) {
        throw createError({
          statusCode: 400,
          statusMessage: `Tracking item ${item.tracking_number} must be at Packing or Received at Warehouse status. Current status: ${status}`,
        });
      }
    }

    // Fetch current item if inputChainId was provided
    let currentItem = null;
    if (inputChainId) {
      const currentItems = await db.select().from(trackingItems).where(eq(trackingItems.chain, inputChainId)).limit(1);
      if (currentItems.length > 0) {
        currentItem = currentItems[0];
      }
    }

    // Determine final chainId:
    // 1. If any item to add has chain, use that chain
    // 2. Otherwise, if current item has chain, use that
    // 3. Otherwise, use inputChainId if provided
    // 4. Otherwise, create new chain
    let finalChainId = null;
    for (const item of items) {
      if (item.chain) {
        finalChainId = item.chain;
        break;
      }
    }
    if (!finalChainId && currentItem && currentItem.chain) {
      finalChainId = currentItem.chain;
    }
    if (!finalChainId) {
      finalChainId = inputChainId || crypto.randomUUID();
    }

    // Filter items that need update (don't already have this chainId)
    const itemsToUpdate = items.filter(item => item.chain !== finalChainId);

    // Transaction: update all items to have the same chainId
    await db.transaction(async (tx) => {
      const now = new Date();

      // Update current item if needed
      if (currentItem && currentItem.chain !== finalChainId) {
        const currentStatus = getTrackingItemStatus(currentItem);
        const updateData: any = {
          chain: finalChainId,
          updated_at: now,
        };
        // If current item is at receivedAtWarehouse, move to packing
        if (currentStatus === TrackingItemStatus.RECEIVED_AT_WAREHOUSE) {
          updateData.packing_at = now;
        }

        await tx.update(trackingItems)
          .set(updateData)
          .where(eq(trackingItems.id, currentItem.id));

        // Log the chain action for current item
        if (event.context.user) {
          await tx.insert(trackingItemActionLoggers).values({
            user_id: event.context.user.id,
            type: {
              action: 'addToChain',
              trackingNumber: currentItem.tracking_number,
              trackingItemId: currentItem.id,
              chainId: finalChainId,
              timestamp: now.toISOString()
            }
          });
        }
      }

      // Update items being added
      for (const item of itemsToUpdate) {
        const itemStatus = getTrackingItemStatus(item);
        const updateData: any = {
          chain: finalChainId,
          updated_at: now,
        };
        // If item is at receivedAtWarehouse, move to packing
        if (itemStatus === TrackingItemStatus.RECEIVED_AT_WAREHOUSE) {
          updateData.packing_at = now;
        }

        await tx.update(trackingItems)
          .set(updateData)
          .where(eq(trackingItems.id, item.id));

        // Log the chain action
        if (event.context.user) {
          await tx.insert(trackingItemActionLoggers).values({
            user_id: event.context.user.id,
            type: {
              action: 'addToChain',
              trackingNumber: item.tracking_number,
              trackingItemId: item.id,
              chainId: finalChainId,
              timestamp: now.toISOString()
            }
          });
        }
      }
    });

    return {
      success: true,
      message: `Updated ${itemsToUpdate.length} items to chain ${finalChainId}`,
      chainId: finalChainId,
      updated: itemsToUpdate.length
    };
  } catch (error: any) {
    console.error("Error adding chain to items:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to add chain to items",
    });
  }
});
