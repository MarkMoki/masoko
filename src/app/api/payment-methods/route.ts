import { z } from "zod";
import { Role } from "@/lib/types";
import { listPaymentMethods, clearDefaultPaymentMethods, createPaymentMethod } from "@/lib/db/orders";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

export async function GET() {
  try {
    const session = await requireAuth(Role.SELLER);
    const methods = await listPaymentMethods(session.sub);
    return json({ methods });
  } catch (err) {
    return handleApiError(err);
  }
}

const schema = z.object({
  type: z.string().min(2),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth(Role.SELLER);
    const body = schema.parse(await req.json());

    if (body.isDefault) {
      await clearDefaultPaymentMethods(session.sub);
    }

    const method = await createPaymentMethod({ ...body, sellerId: session.sub });
    return json({ method }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}