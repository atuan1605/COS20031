import { db } from "../db";
import { carriers } from "../db/schema";

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user;

    // Check if user is admin
    if (user.role !== "admin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Only admins can create carriers",
      });
    }

    const body = await readBody(event);
    const { name, contact, weight_coefficient } = body;

    if (!name || !name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Carrier name is required",
      });
    }

    // Validate weight_coefficient if provided
    if (weight_coefficient !== undefined && weight_coefficient !== null) {
      const coefficient = parseFloat(weight_coefficient);
      if (isNaN(coefficient) || coefficient < 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "Weight coefficient must be a non-negative number",
        });
      }
    }

    const [carrier] = await db
      .insert(carriers)
      .values({
        name: name.trim(),
        contact: contact?.trim() || null,
        weight_coefficient: weight_coefficient ? weight_coefficient.toString() : null,
      })
      .returning();

    return {
      success: true,
      message: "Carrier created successfully",
      data: carrier,
    };
  } catch (error: any) {
    console.error("Error creating carrier:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create carrier",
    });
  }
});
