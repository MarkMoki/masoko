import { z } from "zod";
import { Role } from "@/lib/types";
import { createUser, getUserByEmail } from "@/lib/db/users-stores";
import {
  createToken,
  hashPassword,
  setAuthCookie,
} from "@/lib/auth";
import { errorResponse, handleApiError, json } from "@/lib/api-route";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER"]).default("CUSTOMER"),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const exists = await getUserByEmail(body.email);
    if (exists) return errorResponse("Email already registered", 409);

    const user = await createUser({
      name: body.name,
      email: body.email,
      phone: body.phone,
      passwordHash: await hashPassword(body.password),
      role: Role.CUSTOMER,
    });

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    await setAuthCookie(token);
    return json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}