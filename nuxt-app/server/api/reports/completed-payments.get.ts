import { db } from "../../db";
import { payments, boxPayments, boxes } from "../../db/schema";
import { isNotNull, eq, sql, inArray } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const search = (query.search as string) || "";
    const offset = (page - 1) * pageSize;

    // Build where conditions
    let whereConditions = isNotNull(payments.success_at);

    if (search) {
      whereConditions = sql`${whereConditions} AND (
        ${payments.code} ILIKE ${`%${search}%`} OR
        ${payments.received_address} ILIKE ${`%${search}%`}
      )`;
    }

    // Get payments with success_at (completed payments)
    const completedPayments = await db
      .select({
        id: payments.id,
        code: payments.code,
        carrier_id: payments.carrier_id,
        received_address: payments.received_address,
        total_amount: payments.total_amount,
        status: payments.status,
        success_at: payments.success_at,
        delivering_at: payments.delivering_at,
        created_at: payments.created_at,
      })
      .from(payments)
      .where(whereConditions)
      .orderBy(sql`${payments.success_at} DESC`)
      .limit(pageSize)
      .offset(offset);

    // Get boxes for each payment
    const paymentIds = completedPayments.map((payment) => payment.id);

    let boxesData: any[] = [];
    if (paymentIds.length > 0) {
      boxesData = await db
        .select({
          payment_id: boxPayments.payment_id,
          box_id: boxes.id,
          box_code: boxes.code,
          box_status: boxes.status,
        })
        .from(boxPayments)
        .leftJoin(boxes, eq(boxPayments.box_id, boxes.id))
        .where(inArray(boxPayments.payment_id, paymentIds));
    }

    // Group boxes by payment_id
    const boxesMap = new Map<string, any[]>();
    boxesData.forEach((item) => {
      if (!boxesMap.has(item.payment_id)) {
        boxesMap.set(item.payment_id, []);
      }
      boxesMap.get(item.payment_id)!.push({
        id: item.box_id,
        code: item.box_code,
        status: item.box_status,
      });
    });

    // Map boxes to payments
    const paymentsWithBoxes = completedPayments.map((payment) => ({
      ...payment,
      boxes: boxesMap.get(payment.id) || [],
      box_count: boxesMap.get(payment.id)?.length || 0,
    }));

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(payments)
      .where(whereConditions);

    return {
      success: true,
      data: paymentsWithBoxes,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  } catch (error: any) {
    console.error("Error fetching completed payments report:", error);
    console.error("Error details:", error.message, error.stack);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch completed payments report",
    });
  }
});
