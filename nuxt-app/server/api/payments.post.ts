import { db } from "../db";
import { payments, carriers } from "../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { carrier_id, code, received_address, status } = body;

    if (!carrier_id || !carrier_id.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Carrier ID is required",
      });
    }

    if (!code || !code.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Payment code is required",
      });
    }

    // Check if carrier exists
    const carrier = await db.query.carriers.findFirst({
      where: eq(carriers.id, carrier_id),
    });

    if (!carrier) {
      throw createError({
        statusCode: 404,
        statusMessage: "Carrier not found",
      });
    }

    // Check if payment code already exists
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.code, code.trim()),
    });

    if (existingPayment) {
      throw createError({
        statusCode: 400,
        statusMessage: "Payment code already exists",
      });
    }

    const now = new Date();

    const [payment] = await db
      .insert(payments)
      .values({
        carrier_id,
        code: code.trim(),
        received_address: received_address?.trim() || null,
        total_amount: "0",
        received_at: now,
        status: status,
      })
      .returning();

    return {
      success: true,
      message: "Payment created successfully",
      data: payment,
    };
  } catch (error: any) {
    console.error("Error creating payment:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create payment",
    });
  }
});
