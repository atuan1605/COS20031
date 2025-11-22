import { db } from "../db";
import { boxes, trackingItems } from "../db/schema";
import { desc, eq, isNull, sql, like, or, inArray } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const search = (query.search as string) || "";
    const offset = (page - 1) * limit;

    // Build where conditions - only show boxes with status 'none' or 'changedWarehouse'
    const whereConditions = [
      isNull(boxes.deleted_at),
      or(
        eq(boxes.status, 'none'),
        eq(boxes.status, 'changedWarehouse')
      )
    ];

    if (search) {
      whereConditions.push(like(boxes.code, `%${search}%`));
    }

    // Get boxes with aggregated tracking data
    const boxesData = await db
      .select({
        id: boxes.id,
        code: boxes.code,
        warehouse_id: boxes.warehouse_id,
        created_at: boxes.created_at,
        committed_at: boxes.committed_at,
        tracking_count: sql<number>`count(${trackingItems.id})::int`,
        total_weight: sql<string>`coalesce(sum(${trackingItems.weight}), 0)::numeric(10,2)`,
      })
      .from(boxes)
      .leftJoin(trackingItems, eq(boxes.id, trackingItems.box_id))
      .where(sql`${sql.join(whereConditions, sql` AND `)}`)
      .groupBy(boxes.id)
      .orderBy(desc(boxes.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(boxes)
      .where(sql`${sql.join(whereConditions, sql` AND `)}`);

    const total = totalResult[0]?.count || 0;

    return {
      success: true,
      data: boxesData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching boxes:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch boxes",
    });
  }
});
