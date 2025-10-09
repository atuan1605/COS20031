import { db } from "../db";
import { tokens, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../utils/jwt";

export default defineEventHandler(async (event) => {
  if (
    event.path.startsWith("/api/auth/login") ||
    event.path.startsWith("/api/auth/register") ||
    !event.path.startsWith("/api/")
  ) {
    return;
  }

  try {
    const authHeader = getRequestHeader(event, "Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const token = authHeader.substring(7);

    const payload = verifyToken(token);

    const now = new Date();
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

    if (new Date(tokenRecord[0].expired_at) <= now) {
      throw createError({
        statusCode: 401,
        message: "Token expired",
      });
    }
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (user.length === 0 || user[0].deleted_at !== null) {
      throw createError({
        statusCode: 401,
        message: "User not found",
      });
    }
    event.context.user = {
      id: user[0].id,
      username: user[0].username,
      role: user[0].role,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 401,
      message: error.message || "Authentication failed",
    });
  }
});
