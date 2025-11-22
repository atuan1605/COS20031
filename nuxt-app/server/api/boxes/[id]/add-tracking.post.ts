import { db } from "../../../db";
import { boxes, trackingItems, trackingItemActionLoggers } from "../../../db/schema";
import { eq, and, isNull, or } from "drizzle-orm";
import { getTrackingItemStatus, TrackingItemStatus } from "../../../utils/trackingItemStatus";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);
    const { trackingNumber } = body;

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Box ID is required",
      });
    }

    if (!trackingNumber || !trackingNumber.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tracking number is required",
      });
    }

    // Check if box exists and has valid status
    const box = await db.query.boxes.findFirst({
      where: eq(boxes.id, id),
    });

    if (!box) {
      throw createError({
        statusCode: 404,
        statusMessage: "Box not found",
      });
    }

    // Check if box status is 'none' or 'changedWarehouse'
    if (box.status !== 'none' && box.status !== 'changedWarehouse') {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot add tracking items to box with status '${box.status}'. Box must have status 'none' or 'changedWarehouse'`,
      });
    }

    // Get the tracking item
    const trackingItemResult = await db
      .select()
      .from(trackingItems)
      .where(eq(trackingItems.tracking_number, trackingNumber.trim()))
      .limit(1);

    if (trackingItemResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tracking item not found",
      });
    }

    const trackingItem = trackingItemResult[0];

    // Check if tracking item warehouse matches box warehouse
    if (trackingItem.warehouse_id !== box.warehouse_id) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot add tracking item. Tracking item is in warehouse '${trackingItem.warehouse_id}' but box is in warehouse '${box.warehouse_id}'`,
      });
    }

    // Check if tracking item has weight and amount
    if (!trackingItem.weight || parseFloat(trackingItem.weight) <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tracking item must have a valid weight before adding to box",
      });
    }

    if (!trackingItem.amount || parseFloat(trackingItem.amount) <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tracking item must have a valid amount before adding to box",
      });
    }

    // Check status - must be packing or receivedAtWarehouse
    const status = getTrackingItemStatus(trackingItem);
    if (status !== TrackingItemStatus.PACKING && status !== TrackingItemStatus.RECEIVED_AT_WAREHOUSE) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot add tracking item. Status must be 'Packing' or 'Received at Warehouse'. Current status: ${status}`,
      });
    }

    // Check if tracking item already has a box
    if (trackingItem.box_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tracking item is already in a box",
      });
    }

    // If tracking item has a chain, get all items in that chain
    const itemsToUpdate: string[] = [trackingItem.id];

    if (trackingItem.chain) {
      const chainItems = await db
        .select({ id: trackingItems.id })
        .from(trackingItems)
        .where(
          and(
            eq(trackingItems.chain, trackingItem.chain),
            isNull(trackingItems.box_id)
          )
        );

      // Add all chain items to the update list
      chainItems.forEach(item => {
        if (!itemsToUpdate.includes(item.id)) {
          itemsToUpdate.push(item.id);
        }
      });
    }

    // Update all tracking items to this box with transaction
    await db.transaction(async (tx) => {
      const now = new Date();

      for (const itemId of itemsToUpdate) {
        // Update tracking item
        await tx
          .update(trackingItems)
          .set({
            box_id: id,
            boxed_at: now,
            updated_at: now,
          })
          .where(eq(trackingItems.id, itemId));

        // Log the action
        await tx.insert(trackingItemActionLoggers).values({
          user_id: event.context.user.id,
          type: {
            action: "boxed",
            trackingItemId: itemId,
            boxId: id,
            boxCode: box.code,
          },
        });
      }
    });

    return {
      success: true,
      message: `Successfully added ${itemsToUpdate.length} tracking item(s) to box`,
      data: {
        itemsAdded: itemsToUpdate.length,
      },
    };
  } catch (error: any) {
    console.error("Error adding tracking item to box:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to add tracking item to box",
    });
  }
});
