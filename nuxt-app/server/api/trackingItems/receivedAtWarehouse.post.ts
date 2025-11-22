import { db } from "../../db";
import { trackingItems, trackingItemActionLoggers } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    // Check authentication
    if (!event.context.user) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const body = await readBody(event);

    // Validate required fields
    if (!body.trackingNumber) {
      throw createError({
        statusCode: 400,
        message: "trackingNumber is required",
      });
    }

    if (!body.weight) {
      throw createError({
        statusCode: 400,
        message: "weight is required",
      });
    }

    if (!body.amount) {
      throw createError({
        statusCode: 400,
        message: "amount is required",
      });
    }

    if (!body.warehouseId) {
      throw createError({
        statusCode: 400,
        message: "warehouseId is required",
      });
    }

    // Validate trackingNumber format (max 12 digits)
    const trackingNumberStr = body.trackingNumber.toString();
    if (!/^\d{1,12}$/.test(trackingNumberStr)) {
      throw createError({
        statusCode: 400,
        message: "trackingNumber must be numeric and contain maximum 12 digits",
      });
    }

    // Check if trackingNumber already exists
    const existingItem = await db
      .select()
      .from(trackingItems)
      .where(eq(trackingItems.tracking_number, trackingNumberStr))
      .limit(1);

    if (existingItem.length > 0) {
      throw createError({
        statusCode: 409,
        message: "trackingNumber already exists",
      });
    }

    // Create new tracking item
    const now = new Date();
    const newTrackingItem = await db
      .insert(trackingItems)
      .values({
        tracking_number: trackingNumberStr,
        file: body.file || null,
        weight: body.weight.toString(),
        amount: body.amount.toString(),
        warehouse_id: body.warehouseId,
        received_at_warehouse_at: now,
        returned_status: "none",
      })
      .returning();

    // Log the action
    await db.insert(trackingItemActionLoggers).values({
      user_id: event.context.user.id,
      type: {
        action: "receivedAtWarehouse",
        trackingItemId: newTrackingItem[0].id,
        trackingNumber: trackingNumberStr,
        timestamp: now.toISOString(),
      },
    });

    return {
      success: true,
      trackingItem: newTrackingItem[0],
    };
  } catch (error: any) {
    console.error("Error creating tracking item:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to create tracking item",
    });
  }
});
