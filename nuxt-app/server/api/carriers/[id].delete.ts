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
        statusMessage: "Only admins can delete carriers",
      });
    }

    const id = getRouterParam(event, "id");

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

    // Soft delete
    await db
      .update(carriers)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(carriers.id, id));

    return {
      success: true,
      message: "Carrier deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting carrier:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete carrier",
    });
  }
});
