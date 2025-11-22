import { db } from "../../db";
import { users, tokens } from "../../db/schema";
import { eq } from "drizzle-orm";
import { comparePassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.username || !body.password) {
      throw createError({
        statusCode: 400,
        message: "Username and password are required",
      });
    }

    // Tìm user theo username
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, body.username))
      .limit(1);

    if (user.length === 0) {
      throw createError({
        statusCode: 401,
        message: "Invalid username or password",
      });
    }

    // So sánh mật khẩu
    const isValidPassword = await comparePassword(
      body.password,
      user[0].password_hash
    );

    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: "Invalid username or password",
      });
    }

    // Xóa tất cả token cũ của user
    await db
      .delete(tokens)
      .where(eq(tokens.user_id, user[0].id));

    // Tạo JWT token
    const tokenPayload = {
      userId: user[0].id,
      username: user[0].username,
      role: user[0].role,
    };

    const jwtToken = generateToken(tokenPayload);

    // Tạo token mới trong database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // Token hết hạn sau 1 ngày

    await db.insert(tokens).values({
      value: jwtToken,
      user_id: user[0].id,
      expired_at: expiresAt,
    });

    return {
      token: jwtToken
    };
  } catch (error: any) {
    console.error("Login error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Authentication failed",
    });
  }
});
