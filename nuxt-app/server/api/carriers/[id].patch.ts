import { db } from "../../db";
import { carriers } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user;

    // Check if user is admin
    if (user.role !== "admin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Only admins can update carriers",
      });
    }

    const id = getRouterParam(event, "id");
    const body = await readBody(event);
    const { name, contact, weight_coefficient } = body;

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Carrier ID is required",
      });
    }

    // Check if carrier exists
    const carrier = await db.query.carriers.findFirst({
      where: eq(carriers.id, id),
    });

    if (!carrier) {
      throw createError({
        statusCode: 404,
        statusMessage: "Carrier not found",
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

    const updateData: any = {
      updated_at: new Date(),
    };

    if (name !== undefined) {
      if (!name.trim()) {
        throw createError({
          statusCode: 400,
          statusMessage: "Carrier name cannot be empty",
        });
      }
      updateData.name = name.trim();
    }

    if (contact !== undefined) {
      updateData.contact = contact?.trim() || null;
    }

    if (weight_coefficient !== undefined) {
      updateData.weight_coefficient = weight_coefficient ? weight_coefficient.toString() : null;
    }

    const [updatedCarrier] = await db
      .update(carriers)
      .set(updateData)
      .where(eq(carriers.id, id))
      .returning();

    return {
      success: true,
      message: "Carrier updated successfully",
      data: updatedCarrier,
    };
  } catch (error: any) {
    console.error("Error updating carrier:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update carrier",
    });
  }
});
