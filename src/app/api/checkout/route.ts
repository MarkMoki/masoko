import { Role } from "@prisma/client";
import { checkoutCart } from "@/lib/checkout";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

export async function POST() {
  try {
    const session = await requireAuth(Role.CUSTOMER);
    const order = await checkoutCart(session.sub);
    return json({ order }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
