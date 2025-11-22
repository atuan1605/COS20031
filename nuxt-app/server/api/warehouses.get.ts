import { db } from "../db";
import { warehouses } from "../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const listAll = query.listAll === 'true';

    if (listAll) {
      // Return full warehouse details
      const warehouseList = await db
        .select({
          id: warehouses.id,
          address: warehouses.address,
          status: warehouses.status,
          created_at: warehouses.created_at,
        })
        .from(warehouses)
        .where(eq(warehouses.status, "active"))
        .orderBy(warehouses.created_at);

      return {
        success: true,
        data: warehouseList,
      };
    }

    // Default behavior: return only IDs
    const activeWarehouses = await db
      .select({
        id: warehouses.id,
      })
      .from(warehouses)
      .where(eq(warehouses.status, "active"));

    // Extract only IDs as string array
    const warehouseIds = activeWarehouses.map((warehouse) => warehouse.id);

    return warehouseIds;
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch warehouses",
    });
  }
});
