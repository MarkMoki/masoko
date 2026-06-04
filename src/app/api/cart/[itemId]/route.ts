import { z } from "zod";
import { Role } from "@/lib/types";
import { findCartItem, updateCartItemQuantity, deleteCartItem } from "@/lib/db/carts";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

const patchSchema = z.object({
  quantity: z.number().int().min(1),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await requireAuth(Role.CUSTOMER);
    const { itemId } = await params;
    const body = patchSchema.parse(await req.json());

    const item = await findCartItem(itemId, session.sub);
    if (!item) throw new Error("Item not found");

    await updateCartItemQuantity(itemId, body.quantity);

    return json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await requireAuth(Role.CUSTOMER);
    const { itemId } = await params;

    const item = await findCartItem(itemId, session.sub);
    if (!item) throw new Error("Item not found");

    await deleteCartItem(itemId);
    return json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}