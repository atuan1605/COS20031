import { trackingItems } from "../../db/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

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
    if (trackingNumber.length !== 12 || !/^\d{12}$/.test(trackingNumber)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid tracking number format. Must be 12 digits.",
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

    return {
      success: true,
      data: item[0],
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
