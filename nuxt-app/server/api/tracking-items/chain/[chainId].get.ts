import { trackingItems } from "../../../db/schema";
import { db } from "../../../db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const chainId = getRouterParam(event, "chainId");

  if (!chainId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Chain ID is required",
    });
  }

  try {
    const items = await db
      .select({
        id: trackingItems.id,
        tracking_number: trackingItems.tracking_number,
        weight: trackingItems.weight,
      })
      .from(trackingItems)
      .where(eq(trackingItems.chain, chainId));

    return {
      success: true,
      data: items,
    };
  } catch (error: any) {
    console.error("Error fetching chain items:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch chain items",
    });
  }
});
