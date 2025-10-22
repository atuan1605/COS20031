import { trackingItems } from "../db/schema";
import { db } from "../db";

export default defineEventHandler(async (event) => {
  if (event.node.req.method === "GET") {
    // Get all tracking items
    const items = await db.select().from(trackingItems);
    return items;
  }

  if (event.node.req.method === "POST") {
    // Create new tracking item
    const body = await readBody(event);
    const { tracking_number, weight, file, is_fragile_item, returned_status } =
      body;

    if (!tracking_number || !weight) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tracking number and weight are required",
      });
    }

    const newItem = await db
      .insert(trackingItems)
      .values({
        tracking_number,
        weight: weight.toString(), // Convert to string for decimal
        file,
        is_fragile_item: is_fragile_item || false,
        returned_status: returned_status || "none",
      })
      .returning();

    return newItem[0];
  }
});
