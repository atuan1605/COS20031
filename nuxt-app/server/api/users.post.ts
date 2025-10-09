import { db } from "../db";
import { users } from "../db/schema";
import { hashPassword } from "../utils/password";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.username || !body.password) {
      throw createError({
        statusCode: 400,
        message: "Username and password are required",
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

    return { user: newUser[0] };
  } catch (error) {
    console.error("Error creating user:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to create user",
    });
  }
});
