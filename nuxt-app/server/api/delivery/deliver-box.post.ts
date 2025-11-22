import { db } from '../../db';
import { boxes, trackingItems, trackingItemActionLoggers, payments, boxPayments } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { boxId, paymentCode } = body;
  if (!boxId || !paymentCode) {
    throw createError({ statusCode: 400, statusMessage: 'Box ID and payment code required' });
  }
  const box = await db.query.boxes.findFirst({ where: eq(boxes.id, boxId) });
  if (!box) {
    throw createError({ statusCode: 404, statusMessage: 'Box not found' });
  }
  if (box.status !== 'changedWarehouse' && box.status !== 'none') {
    throw createError({ statusCode: 400, statusMessage: 'Box must be in changedWarehouse or none status' });
  }

  // If status is 'none', check if box is not empty
  if (box.status === 'none') {
    const itemsCount = await db.select().from(trackingItems).where(eq(trackingItems.box_id, boxId));
    if (itemsCount.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Cannot deliver empty box' });
    }
  }
  const payment = await db.query.payments.findFirst({
    where: eq(payments.code, paymentCode),
    with: {
      carrier: true,
    },
  });
  if (!payment) {
    throw createError({ statusCode: 404, statusMessage: 'Payment not found' });
  }
  const items = await db.select().from(trackingItems).where(eq(trackingItems.box_id, boxId));

  // Calculate total amount: sum of tracking item amounts * carrier weight coefficient
  const trackingItemTotal = items.reduce((sum, item) => {
    const amount = item.amount ? parseFloat(item.amount) : 0;
    return sum + amount;
  }, 0);

  const weightCoefficient = payment.carrier?.weight_coefficient
    ? parseFloat(payment.carrier.weight_coefficient)
    : 1;

  const totalAmount = trackingItemTotal * weightCoefficient;

  await db.transaction(async (tx) => {
    const now = new Date();
    for (const item of items) {
      await tx.update(trackingItems).set({ delivering_at: now, updated_at: now }).where(eq(trackingItems.id, item.id));
      await tx.insert(trackingItemActionLoggers).values({
        carrier_id: payment.carrier_id,
        user_id: event.context.user.id,
        type: { action: 'delivering', trackingItemId: item.id, boxId: box.id, boxCode: box.code },
      });
    }

    // Create box-payment association if not exists
    const existingBoxPayment = await tx.query.boxPayments.findFirst({
      where: eq(boxPayments.box_id, box.id)
    });
    if (!existingBoxPayment) {
      await tx.insert(boxPayments).values({
        box_id: box.id,
        payment_id: payment.id,
      });
    }

    await tx.update(boxes).set({ status: 'delivering', updated_at: now }).where(eq(boxes.id, box.id));
    await tx.update(payments).set({
      status: 'customer',
      total_amount: totalAmount.toFixed(2),
      delivering_at: now,
      updated_at: now
    }).where(eq(payments.id, payment.id));
  });
  return { success: true, message: 'Box delivered to customer' };
});
