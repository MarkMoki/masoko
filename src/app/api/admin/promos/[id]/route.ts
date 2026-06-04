import { z } from "zod";
import { PromoType, Role } from "@/lib/types";
import { updateMarketplacePromo, deleteMarketplacePromo } from "@/lib/db/config-promos";
import {
  requireAuth,
  handleApiError,
  json,
  errorResponse,
} from "@/lib/api-route";

const patchSchema = z.object({
  type: z.nativeEnum(PromoType).optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  linkUrl: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(Role.ADMIN);
    const { id } = await params;
    const body = patchSchema.parse(await req.json());
    const promo = await updateMarketplacePromo(id, body);
    return json({ promo });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(Role.ADMIN);
    const { id } = await params;
    await deleteMarketplacePromo(id);
    return json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}