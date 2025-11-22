import { db } from "../../db";
import { boxes, trackingItems } from "../../db/schema";
import { eq, isNull, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Box ID is required",
      });
    }

    // Get box details
    const box = await db.query.boxes.findFirst({
      where: eq(boxes.id, id),
    });

    if (!box) {
      throw createError({
        statusCode: 404,
        statusMessage: "Box not found",
      });
    }

    // Get tracking items in this box with their details
    const items = await db
      .select({
        id: trackingItems.id,
        tracking_number: trackingItems.tracking_number,
        weight: trackingItems.weight,
        created_at: trackingItems.created_at,
        received_at_warehouse_at: trackingItems.received_at_warehouse_at,
        packing_at: trackingItems.packing_at,
        boxed_at: trackingItems.boxed_at,
        chain: trackingItems.chain,
      })
      .from(trackingItems)
      .where(eq(trackingItems.box_id, id))
      .orderBy(trackingItems.created_at);

    return {
      success: true,
      data: {
        ...box,
        trackingItems: items,
      },
    };
  } catch (error: any) {
    console.error("Error fetching box details:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch box details",
    });
  }
});
