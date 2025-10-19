import { trackingItems } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

// Function to generate random 12-digit tracking number
function generateTrackingNumber(): string {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

// Function to check if tracking number exists
async function isTrackingNumberExists(
  trackingNumber: string
): Promise<boolean> {
  const existing = await db
    .select()
    .from(trackingItems)
    .where(eq(trackingItems.tracking_number, trackingNumber))
    .limit(1);

  return existing.length > 0;
}

// Function to generate unique tracking number
async function generateUniqueTrackingNumber(): Promise<string> {
  let trackingNumber: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    trackingNumber = generateTrackingNumber();
    attempts++;

    if (attempts > maxAttempts) {
      throw new Error(
        "Unable to generate unique tracking number after multiple attempts"
      );
    }
  } while (await isTrackingNumberExists(trackingNumber));

  return trackingNumber;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      weight,
      file,
      is_fragile_item,
      returned_status,
      tracking_number, // Optional: allow custom tracking number
    } = body;

    // Validate required fields
    if (!weight) {
      throw createError({
        statusCode: 400,
        statusMessage: "Weight is required",
      });
    }

    // Validate weight format
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Weight must be a positive number",
      });
    }

    let finalTrackingNumber: string;

    // If tracking number is provided, check if it's unique
    if (tracking_number) {
      if (tracking_number.length !== 12 || !/^\d{12}$/.test(tracking_number)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Tracking number must be exactly 12 digits",
        });
      }

      if (await isTrackingNumberExists(tracking_number)) {
        throw createError({
          statusCode: 409,
          statusMessage: "Tracking number already exists",
        });
      }

      finalTrackingNumber = tracking_number;
    } else {
      // Generate unique tracking number
      finalTrackingNumber = await generateUniqueTrackingNumber();
    }

    // Create new tracking item
    const newItem = await db
      .insert(trackingItems)
      .values({
        tracking_number: finalTrackingNumber,
        weight: weightNum.toFixed(2), // Ensure 2 decimal places
        file: file || null,
        is_fragile_item: is_fragile_item || false,
        returned_status: returned_status || "none",
      })
      .returning();

    return {
      success: true,
      data: newItem[0],
      message: `Tracking item created successfully with tracking number: ${finalTrackingNumber}`,
    };
  } catch (error: any) {
    console.error("Error creating tracking item:", error);

    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    // Handle database errors
    if (error.code === "23505") {
      // Unique constraint violation
      throw createError({
        statusCode: 409,
        statusMessage: "Tracking number already exists",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create tracking item",
    });
  }
});