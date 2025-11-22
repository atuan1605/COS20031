import { db } from "../../db";
import { boxes, trackingItems, boxPayments, payments } from "../../db/schema";
import { isNotNull, eq, sql, and, isNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    // Get committed boxes with aggregated data
    const committedBoxes = await db
      .select({
        id: boxes.id,
        code: boxes.code,
        warehouse_id: boxes.warehouse_id,
        committed_at: boxes.committed_at,
        tracking_count: sql<number>`count(distinct ${trackingItems.id})::int`,
        total_weight: sql<string>`coalesce(sum(${trackingItems.weight}), 0)`,
      })
      .from(boxes)
      .leftJoin(trackingItems, eq(boxes.id, trackingItems.box_id))
      .where(and(isNotNull(boxes.committed_at), isNull(boxes.deleted_at)))
      .groupBy(boxes.id)
      .orderBy(boxes.committed_at)
      .limit(pageSize)
      .offset(offset);

    // Get payment totals for each box
    const boxIds = committedBoxes.map((box) => box.id);

    let paymentTotals: any[] = [];
    if (boxIds.length > 0) {
      paymentTotals = await db
        .select({
          box_id: boxPayments.box_id,
          total_amount: sql<string>`coalesce(sum(cast(${payments.total_amount} as numeric)), 0)`,
        })
        .from(boxPayments)
        .leftJoin(payments, eq(boxPayments.payment_id, payments.id))
        .where(sql`${boxPayments.box_id} = ANY(${sql.raw(`ARRAY[${boxIds.map(id => `'${id}'`).join(',')}]::uuid[]`)})`)
        .groupBy(boxPayments.box_id);
    }

    // Map payment totals to boxes
    const paymentMap = new Map(
      paymentTotals.map((item) => [item.box_id, item.total_amount])
    );

    const boxesWithPayments = committedBoxes.map((box) => ({
      ...box,
      total_amount: paymentMap.get(box.id) || "0",
    }));

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(boxes)
      .where(and(isNotNull(boxes.committed_at), isNull(boxes.deleted_at)));

    return {
      success: true,
      data: boxesWithPayments,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  } catch (error: any) {
    console.error("Error fetching committed boxes report:", error);
    console.error("Error details:", error.message, error.stack);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch committed boxes report",
    });
  }
});
