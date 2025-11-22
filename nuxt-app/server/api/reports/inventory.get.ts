import { db } from "../../db";
import { trackingItems } from "../../db/schema";
import { isNull, and, lte, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    // Calculate date 10 days ago
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // Get tracking items that are received at warehouse more than 10 days ago
    const items = await db
      .select({
        id: trackingItems.id,
        tracking_number: trackingItems.tracking_number,
        weight: trackingItems.weight,
        amount: trackingItems.amount,
        warehouse_id: trackingItems.warehouse_id,
        received_at_warehouse_at: trackingItems.received_at_warehouse_at,
        created_at: trackingItems.created_at,
      })
      .from(trackingItems)
      .where(
        and(
          isNull(trackingItems.deleted_at),
          isNull(trackingItems.packing_at),
          isNull(trackingItems.boxed_at),
          isNull(trackingItems.delivering_at),
          isNull(trackingItems.delivered_at),
          lte(trackingItems.received_at_warehouse_at, tenDaysAgo)
        )
      )
      .orderBy(trackingItems.received_at_warehouse_at)
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(trackingItems)
      .where(
        and(
          isNull(trackingItems.deleted_at),
          isNull(trackingItems.packing_at),
          isNull(trackingItems.boxed_at),
          isNull(trackingItems.delivering_at),
          isNull(trackingItems.delivered_at),
          lte(trackingItems.received_at_warehouse_at, tenDaysAgo)
        )
      );

    return {
      success: true,
      data: items,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  } catch (error: any) {
    console.error("Error fetching inventory report:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch inventory report",
    });
  }
});
