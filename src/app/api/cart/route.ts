import { z } from "zod";
import { Role } from "@/lib/types";
import { getOrCreateCart, upsertCartItem } from "@/lib/db/carts";
import { getProductById } from "@/lib/db/products";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

export async function GET() {
  try {
    const session = await requireAuth(Role.CUSTOMER);
    const cart = await getOrCreateCart(session.sub);
    return json({ cart });
  } catch (err) {
    return handleApiError(err);
  }
}

const addSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).default(1),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth(Role.CUSTOMER);
    const body = addSchema.parse(await req.json());

    const product = await getProductById(body.productId, false);
    if (!product || !product.active) throw new Error("Product not found");

    await upsertCartItem(session.sub, body.productId, body.quantity);

    return json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}