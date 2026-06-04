import { z } from "zod";
import { Role } from "@/lib/types";
import { getPaymentWithOrder } from "@/lib/db/orders";
import { onPaymentVerified } from "@/lib/order-status";
import { requireAuth, handleApiError, json, errorResponse } from "@/lib/api-route";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(Role.SELLER, Role.ADMIN);
    const { id } = await params;
    const body = schema.parse(await req.json());

    const payment = await getPaymentWithOrder(id);
    if (!payment) return errorResponse("Payment not found", 404);

    if (
      session.role === Role.SELLER &&
      payment.sellerOrder.sellerId !== session.sub
    ) {
      return errorResponse("Forbidden", 403);
    }

    const result = await onPaymentVerified(id, body.approved);
    return json({ payment: result });
  } catch (err) {
    return handleApiError(err);
  }
}

const schema = z.object({
  approved: z.boolean(),
});