import { z } from "zod";
import { getUserByEmail } from "@/lib/db/users-stores";
import {
  createToken,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";
import { errorResponse, handleApiError, json } from "@/lib/api-route";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const user = await getUserByEmail(body.email);
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return errorResponse("Invalid email or password", 401);
    }
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    await setAuthCookie(token);
    return json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}