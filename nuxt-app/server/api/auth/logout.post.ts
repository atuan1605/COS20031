import { db } from "../../db";
import { tokens } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = getRequestHeader(event, "Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const token = authHeader.substring(7); // Loại bỏ phần "Bearer "

    // Tìm token trong database
    const tokenRecord = await db
      .select()
      .from(tokens)
      .where(eq(tokens.value, token))
      .limit(1);

    if (tokenRecord.length === 0) {
      throw createError({
        statusCode: 401,
        message: "Invalid token",
      });
    }

    // Đặt thời hạn hết hạn ngay bây giờ để vô hiệu hóa token
    const now = new Date();
    await db
      .update(tokens)
      .set({ expired_at: now })
      .where(eq(tokens.value, token));

    return { message: "Logout successful" };
  } catch (error: any) {
    console.error("Logout error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Logout failed",
    });
  }
});
