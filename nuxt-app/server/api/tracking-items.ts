import { trackingItems } from "../db/schema";
import { db } from "../db";

export default defineEventHandler(async (event) => {
  if (event.node.req.method === "GET") {
    // all
    const items = await db.select().from(trackingItems);
    return items;
  }

  if (event.node.req.method === "POST") {
    // new
    const body = await readBody(event);
    const { name } = body;

    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: "Name is required",
      });
    }

    const newItem = await db
      .insert(trackingItems)
      .values({
        name,
      })
      .returning();

    return newItem[0];
  }
});
