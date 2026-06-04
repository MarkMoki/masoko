import { z } from "zod";
import { Role } from "@/lib/types";
import { getSiteConfig, upsertSiteConfig } from "@/lib/db/config-promos";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

export async function GET() {
  try {
    await requireAuth(Role.ADMIN);
    const config = await getSiteConfig();
    return json({ config });
  } catch (err) {
    return handleApiError(err);
  }
}

const patchSchema = z.object({
  marketplacePromoEnabled: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  try {
    await requireAuth(Role.ADMIN);
    const body = patchSchema.parse(await req.json());
    const config = await upsertSiteConfig(body);
    return json({ config });
  } catch (err) {
    return handleApiError(err);
  }
}