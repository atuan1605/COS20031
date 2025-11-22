import { db } from '../../db';
import { boxes, trackingItems, trackingItemActionLoggers, payments } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { boxId, paymentCode } = body;
  if (!boxId || !paymentCode) {
    throw createError({ statusCode: 400, statusMessage: 'Box ID and payment code required' });
  }
  const box = await db.query.boxes.findFirst({ where: eq(boxes.id, boxId) });
  if (!box || box.status !== 'changedWarehouse') {
    throw createError({ statusCode: 400, statusMessage: 'Box not found or not in changedWarehouse status' });
  }
  const payment = await db.query.payments.findFirst({ where: eq(payments.code, paymentCode) });
  if (!payment) {
    throw createError({ statusCode: 404, statusMessage: 'Payment not found' });
  }
  const items = await db.select().from(trackingItems).where(eq(trackingItems.box_id, boxId));
  await db.transaction(async (tx) => {
    const now = new Date();
    for (const item of items) {
      await tx.update(trackingItems).set({ delivering_at: now, updated_at: now }).where(eq(trackingItems.id, item.id));
      await tx.insert(trackingItemActionLoggers).values({
        carrier_id: payment.carrier_id,
        type: { action: 'delivering', trackingItemId: item.id, boxId: box.id, boxCode: box.code },
      });
    }
    await tx.update(boxes).set({ status: 'delivering', updated_at: now }).where(eq(boxes.id, box.id));
    await tx.update(payments).set({ status: 'customer', updated_at: now }).where(eq(payments.id, payment.id));
  });
  return { success: true, message: 'Box delivered to customer' };
});
