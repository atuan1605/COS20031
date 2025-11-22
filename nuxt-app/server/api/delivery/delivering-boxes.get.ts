import { db } from '../../db';
import { boxes, trackingItems } from '../../db/schema';
import { eq, or, and, sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tab = query.tab as string;

  if (tab === 'deliver') {
    // Tab 1: Get boxes with status 'none' (not empty) OR 'changedWarehouse'

    // Get boxes with status 'none' that have tracking items
    const noneBoxes = await db
      .selectDistinct({
        id: boxes.id,
        code: boxes.code,
        warehouse_id: boxes.warehouse_id,
        status: boxes.status,
        created_at: boxes.created_at,
        updated_at: boxes.updated_at,
        deleted_at: boxes.deleted_at,
        committed_at: boxes.committed_at,
      })
      .from(boxes)
      .innerJoin(trackingItems, eq(boxes.id, trackingItems.box_id))
      .where(eq(boxes.status, 'none'));

    // Get boxes with status 'changedWarehouse'
    const changedWarehouseBoxes = await db
      .select({
        id: boxes.id,
        code: boxes.code,
        warehouse_id: boxes.warehouse_id,
        status: boxes.status,
        created_at: boxes.created_at,
        updated_at: boxes.updated_at,
        deleted_at: boxes.deleted_at,
        committed_at: boxes.committed_at,
      })
      .from(boxes)
      .where(eq(boxes.status, 'changedWarehouse'));

    // Combine and sort
    const result = [...noneBoxes, ...changedWarehouseBoxes].sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dateA - dateB;
    });

    return {
      success: true,
      data: result,
    };
  } else if (tab === 'complete') {
    // Tab 2: Get boxes with status 'delivering'
    const result = await db
      .select({
        id: boxes.id,
        code: boxes.code,
        warehouse_id: boxes.warehouse_id,
        status: boxes.status,
        created_at: boxes.created_at,
        updated_at: boxes.updated_at,
        deleted_at: boxes.deleted_at,
        committed_at: boxes.committed_at,
      })
      .from(boxes)
      .where(eq(boxes.status, 'delivering'))
      .orderBy(boxes.updated_at);

    return {
      success: true,
      data: result,
    };
  }

  // Default: return empty
  return {
    success: true,
    data: [],
  };
});
