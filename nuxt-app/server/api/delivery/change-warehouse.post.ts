import { db } from "../../db";
import { boxes, trackingItems, trackingItemActionLoggers, payments, boxPayments, carriers } from "../../db/schema";
import { eq, isNull, isNotNull, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { boxCode, warehouseId, paymentCode } = body;

    if (!boxCode || !boxCode.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Box code is required",
      });
    }

    if (!paymentCode || !paymentCode.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Payment code is required",
      });
    }

    if (!warehouseId || !warehouseId.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Warehouse ID is required",
      });
    }

    // Check if box exists
    const box = await db.query.boxes.findFirst({
      where: eq(boxes.code, boxCode.trim()),
    });

    if (!box) {
      throw createError({
        statusCode: 404,
        statusMessage: "Box not found",
      });
    }

    // Check if box is already committed
    if (box.committed_at) {
      throw createError({
        statusCode: 400,
        statusMessage: "Box is already committed and cannot be modified",
      });
    }

    // Only allow change warehouse if box status is 'none' or 'changedWarehouse'
    if (box.status !== 'none' && box.status !== 'changedWarehouse') {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot change warehouse for box with status '${box.status}'. Box must have status 'none' or 'changedWarehouse'`,
      });
    }

    // Check if payment exists
    const payment = await db.query.payments.findFirst({
      where: eq(payments.code, paymentCode.trim()),
      with: {
        carrier: true,
      },
    });

    if (!payment) {
      throw createError({
        statusCode: 404,
        statusMessage: "Payment not found",
      });
    }

    // Check payment status - cannot submit if delivering or already successful
    if (payment.delivering_at && payment.success_at) {
      throw createError({
        statusCode: 400,
        statusMessage: "Payment is already completed and cannot be modified",
      });
    }

    if (payment.delivering_at && !payment.success_at) {
      throw createError({
        statusCode: 400,
        statusMessage: "Payment is currently being delivered and cannot be modified",
      });
    }

    // Get all tracking items in this box
    // Only select tracking items with status 'boxed' or 'changedWarehouse'
    const allItems = await db
      .select()
      .from(trackingItems)
      .where(eq(trackingItems.box_id, box.id));

    // Filter items by status
    const items = allItems.filter(item => {
      // boxed: item.boxed_at && !item.changing_warehouse_at
      // changedWarehouse: item.changed_warehouse_at
      const isBoxed = !!item.boxed_at && !item.changing_warehouse_at && !item.changed_warehouse_at;
      const isChangedWarehouse = !!item.changed_warehouse_at;
      return isBoxed || isChangedWarehouse;
    });

    if (items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No eligible tracking items (boxed or changedWarehouse) found in this box",
      });
    }

    // Check if warehouse is actually changing
    const currentWarehouseId = items[0]?.warehouse_id;
    if (currentWarehouseId === warehouseId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Box is already in the selected warehouse",
      });
    }

    // Calculate total amount: sum of tracking item amounts * carrier weight coefficient
    const trackingItemTotal = items.reduce((sum, item) => {
      const amount = item.amount ? parseFloat(item.amount) : 0;
      return sum + amount;
    }, 0);

    const weightCoefficient = payment.carrier?.weight_coefficient
      ? parseFloat(payment.carrier.weight_coefficient)
      : 1;

    const totalAmount = trackingItemTotal * weightCoefficient;

    // Update with transaction
    await db.transaction(async (tx) => {
      const now = new Date();

      // Update all tracking items - change warehouse and set changing_warehouse_at
      for (const item of items) {
        await tx
          .update(trackingItems)
          .set({
            warehouse_id: warehouseId,
            changing_warehouse_at: now,
            changed_warehouse_at: null,
            updated_at: now,
          })
          .where(eq(trackingItems.id, item.id));

        // Log the action
        await tx.insert(trackingItemActionLoggers).values({
          carrier_id: payment.carrier_id,
          user_id: event.context.user.id,
          type: {
            action: "changingWarehouse",
            trackingItemId: item.id,
            trackingNumber: item.tracking_number,
            boxId: box.id,
            boxCode: box.code,
            newWarehouseId: warehouseId,
            oldWarehouseId: item.warehouse_id,
          },
        });
      }

      // Create box-payment association
      await tx.insert(boxPayments).values({
        box_id: box.id,
        payment_id: payment.id,
      });

      // Update box status to changingWarehouse
      await tx
        .update(boxes)
        .set({
          status: "changingWarehouse",
          updated_at: now,
          warehouse_id: warehouseId
        })
        .where(eq(boxes.id, box.id));

      // Update payment total amount and set delivering_at
      await tx
        .update(payments)
        .set({
          total_amount: totalAmount.toFixed(2),
          delivering_at: now,
          updated_at: now,
          status: "warehouse"
        })
        .where(eq(payments.id, payment.id));
    });

    return {
      success: true,
      message: `Successfully linked box ${boxCode} to payment ${paymentCode} and changed warehouse for ${items.length} tracking item(s)`,
      data: {
        itemsUpdated: items.length,
        boxCode: boxCode,
        paymentCode: paymentCode,
        newWarehouseId: warehouseId,
        totalAmount: totalAmount.toFixed(2),
      },
    };
  } catch (error: any) {
    console.error("Error changing warehouse:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to change warehouse",
    });
  }
});
