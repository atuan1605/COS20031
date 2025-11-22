import { trackingItems } from "../../db/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { getTrackingItemStatus, getStatusUpdatedAt } from "../../utils/trackingItemStatus";

export default defineEventHandler(async (event) => {
  try {
    const trackingNumber = getRouterParam(event, "trackingNumber");

    if (!trackingNumber) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tracking number is required",
      });
    }

    // Validate tracking number format
    if (trackingNumber.length > 12 || !/^\d+$/.test(trackingNumber)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid tracking number format. Must be digits only and max 12 characters.",
      });
    }

    const item = await db
      .select()
      .from(trackingItems)
      .where(eq(trackingItems.tracking_number, trackingNumber))
      .limit(1);

    if (item.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tracking item not found",
      });
    }

    const trackingItem = item[0];
    const status = getTrackingItemStatus(trackingItem);
    const statusUpdatedAt = getStatusUpdatedAt(trackingItem);

    return {
      success: true,
      data: {
        id: trackingItem.id,
        status,
        statusUpdatedAt,
      },
    };
  } catch (error: any) {
    console.error("Error fetching tracking item:", error);

    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch tracking item",
    });
  }
});
