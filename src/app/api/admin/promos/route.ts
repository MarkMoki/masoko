import { z } from "zod";
import { PromoType, Role } from "@/lib/types";
import { listMarketplacePromos, createMarketplacePromo, enrichPromos } from "@/lib/db/config-promos";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

export async function GET() {
  try {
    await requireAuth(Role.ADMIN);
    const promos = await listMarketplacePromos(false); // Get all promos, not just active ones
    const enrichedPromos = await enrichPromos(promos);
    return json({ promos: enrichedPromos });
  } catch (err) {
    return handleApiError(err);
  }
}

const createSchema = z.object({
  type: z.nativeEnum(PromoType),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  productId: z.string().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAuth(Role.ADMIN);
    const body = createSchema.parse(await req.json());
    const promo = await createMarketplacePromo({
      ...body,
      active: body.active ?? true,
      sortOrder: body.sortOrder ?? 0,
    });
    return json({ promo }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}