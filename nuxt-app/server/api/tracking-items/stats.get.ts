import { trackingItems } from "../../db/schema";
import { db } from "../../db";
import { count, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    // Get total count
    const totalCount = await db.select({ count: count() }).from(trackingItems);

    // Get status breakdown
    const statusBreakdown = await db
      .select({
        status: trackingItems.returned_status,
        count: count(),
      })
      .from(trackingItems)
      .groupBy(trackingItems.returned_status);

    // Get fragile items count
    const fragileCount = await db
      .select({ count: count() })
      .from(trackingItems)
      .where(sql`${trackingItems.is_fragile_item} = true`);

    return {
      total: totalCount[0]?.count || 0,
      statusBreakdown: statusBreakdown.map((item) => ({
        status: item.status,
        count: item.count,
      })),
      fragileItems: fragileCount[0]?.count || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get stats: ${error.message}`,
    });
  }
});
