import { z } from "zod";
import { Role } from "@/lib/types";
import { submitPayment } from "@/lib/checkout";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

const schema = z.object({
  sellerOrderId: z.string(),
  transactionCode: z.string().min(3),
  amount: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth(Role.CUSTOMER);
    const body = schema.parse(await req.json());
    const payment = await submitPayment(
      session.sub,
      body.sellerOrderId,
      body.transactionCode,
      body.amount
    );
    return json({ payment }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}