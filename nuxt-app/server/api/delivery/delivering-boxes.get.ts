import { db } from '../../db';
import { boxes } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  // Get boxes with status 'delivering'
  const result = await db.query.boxes.findMany({
    where: eq(boxes.status, 'delivering'),
    orderBy: boxes.updated_at,
  });
  return {
    success: true,
    data: result,
  };
});
