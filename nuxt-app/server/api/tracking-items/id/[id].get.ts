import { trackingItems, trackingItemActionLoggers, users } from "../../../db/schema";
import { db } from "../../../db";
import { eq, desc, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID is required",
      });
    }

    const item = await db
      .select()
      .from(trackingItems)
      .where(eq(trackingItems.id, id))
      .limit(1);

    if (item.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tracking item not found",
      });
    }

    // Fetch action logs with user information
    const { carriers } = await import("../../../db/schema/carriers");
    const actionLogs = await db
      .select({
        id: trackingItemActionLoggers.id,
        type: trackingItemActionLoggers.type,
        created_at: trackingItemActionLoggers.created_at,
        username: users.username,
        carrier_name: carriers.name,
      })
      .from(trackingItemActionLoggers)
      .leftJoin(users, eq(trackingItemActionLoggers.user_id, users.id))
      .leftJoin(carriers, eq(trackingItemActionLoggers.carrier_id, carriers.id))
      .where(sql`${trackingItemActionLoggers.type}->>'trackingItemId' = ${id}`)
      .orderBy(desc(trackingItemActionLoggers.created_at));

    return {
      success: true,
      data: {
        ...item[0],
        actionLogs
      },
    };
  } catch (error: any) {
    console.error("Error fetching tracking item:", error);

    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch tracking item",
    });
  }
});
