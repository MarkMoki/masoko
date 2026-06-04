import { Role } from "@/lib/types";
import { getCartItemCount } from "@/lib/db/carts";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

export async function GET() {
  try {
    const session = await requireAuth(Role.CUSTOMER);
    const count = await getCartItemCount(session.sub);
    return json({ count });
  } catch {
    return json({ count: 0 });
  }
}