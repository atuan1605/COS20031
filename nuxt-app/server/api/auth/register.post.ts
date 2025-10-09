import { db } from "../../db";
import { users } from "../../db/schema";
import { hashPassword } from "../../utils/password";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.username || !body.password) {
      throw createError({
        statusCode: 400,
        message: "Username and password are required",
      });
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, body.username))
      .limit(1);

    if (existingUser.length > 0) {
      throw createError({
        statusCode: 409,
        message: "Username already exists",
      });
    }

    const passwordHash = await hashPassword(body.password);

    const role = body.role || "worker";

    const newUser = await db
      .insert(users)
      .values({
        username: body.username,
        password_hash: passwordHash,
        role: role,
      })
      .returning({
        id: users.id,
        username: users.username,
        role: users.role,
        created_at: users.created_at,
      });

    return {
      message: "Registration successful",
      user: newUser[0],
    };
  } catch (error: any) {
    console.error("Error registering user:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to register user",
    });
  }
});
