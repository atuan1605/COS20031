import { trackingItems } from "../db/schema";
import { db } from "../db";
import { eq, isNull, desc, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const {
      tracking_number,
      returned_status,
      include_deleted = "false",
      limit = "50",
      offset = "0",
    } = query;

    // Build where conditions
    const conditions = [];

    // Filter by tracking number
    if (tracking_number) {
      conditions.push(
        eq(trackingItems.tracking_number, tracking_number as string)
      );
    }

    // Filter by returned status
    if (returned_status) {
      conditions.push(
        eq(trackingItems.returned_status, returned_status as any)
      );
    }

    // Exclude deleted items by default
    if (include_deleted === "false") {
      conditions.push(isNull(trackingItems.deleted_at));
    }

    // Build query with conditions
    let items;
    if (conditions.length > 0) {
      items = await db
        .select()
        .from(trackingItems)
        .where(and(...conditions))
        .orderBy(desc(trackingItems.created_at))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
    } else {
      items = await db
        .select()
        .from(trackingItems)
        .orderBy(desc(trackingItems.created_at))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
    }

    return {
      success: true,
      data: items,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: items.length,
      },
    };
  } catch (error: any) {
    console.error("Error fetching tracking items:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch tracking items",
    });
  }
});
