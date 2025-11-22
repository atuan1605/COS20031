import { db } from '../../db';
import { boxes, trackingItems, trackingItemActionLoggers, payments, boxPayments } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { boxId } = body;
  if (!boxId) {
    throw createError({ statusCode: 400, statusMessage: 'Box ID required' });
  }
  const box = await db.query.boxes.findFirst({ where: eq(boxes.id, boxId) });
  if (!box || box.status !== 'delivering') {
    throw createError({ statusCode: 400, statusMessage: 'Box not found or not in delivering status' });
  }
  const items = await db.select().from(trackingItems).where(eq(trackingItems.box_id, boxId));
  await db.transaction(async (tx) => {
    const now = new Date();
    for (const item of items) {
      await tx.update(trackingItems).set({ delivered_at: now, updated_at: now }).where(eq(trackingItems.id, item.id));
      await tx.insert(trackingItemActionLoggers).values({
        user_id: event.context.user.id,
        type: { action: 'delivered', trackingItemId: item.id, boxId: box.id, boxCode: box.code },
      });
    }
    await tx.update(boxes).set({ status: 'delivered', updated_at: now, committed_at: now }).where(eq(boxes.id, box.id));
    // Update payment total_amount and status if payment exists for this box
    const boxPayment = await tx.query.boxPayments.findFirst({ where: eq(boxPayments.box_id, box.id) });
    if (boxPayment) {
      // Get all boxes for this payment
      const allBoxPayments = await tx.query.boxPayments.findMany({ where: eq(boxPayments.payment_id, boxPayment.payment_id) });
      let totalAmount = 0;
      let allDelivered = true;
      for (const bp of allBoxPayments) {
        const relatedBox = await tx.query.boxes.findFirst({ where: eq(boxes.id, bp.box_id) });
        if (relatedBox?.status !== 'delivered') {
          allDelivered = false;
        }
        const boxItems = await tx.select().from(trackingItems).where(eq(trackingItems.box_id, bp.box_id));
        for (const item of boxItems) {
          totalAmount += item.amount ? parseFloat(item.amount) : 0;
        }
      }
      // Always update total_amount
      await tx.update(payments).set({ total_amount: totalAmount.toFixed(2), updated_at: now }).where(eq(payments.id, boxPayment.payment_id));
      // If all boxes delivered, set status to 'customer' and success_at
      // If all boxes delivered, set success_at
      if (allDelivered) {
        await tx.update(payments).set({ success_at: now, updated_at: now }).where(eq(payments.id, boxPayment.payment_id));
      }
    }
  });
  return { success: true, message: 'Box completed and delivered' };
});
