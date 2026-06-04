import { z } from "zod";
import { PricingModel, Role } from "@/lib/types";
import { getSellerPricingConfig, upsertSellerPricingConfig, listSellerPlans, upsertSellerPlan } from "@/lib/db/config-promos";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

export async function GET() {
  try {
    await requireAuth(Role.ADMIN);
    const config = await getSellerPricingConfig();
    const plans = await listSellerPlans();
    return json({ config, plans });
  } catch (err) {
    return handleApiError(err);
  }
}

const configSchema = z.object({
  defaultModel: z.nativeEnum(PricingModel).optional(),
  subscriptionMonthly: z.number().min(0).optional(),
  payAsYouGoFlatFee: z.number().min(0).optional(),
  payAsYouGoPercent: z.number().min(0).optional(),
  description: z.string().optional(),
});

const planSchema = z.object({
  sellerId: z.string(),
  model: z.nativeEnum(PricingModel),
  monthlyFee: z.number().optional(),
  perOrderFee: z.number().optional(),
  feePercent: z.number().optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  try {
    await requireAuth(Role.ADMIN);
    const body = await req.json();

    if (body.config) {
      const config = configSchema.parse(body.config);
      await upsertSellerPricingConfig(config);
    }

    if (body.plan) {
      const plan = planSchema.parse(body.plan);
      await upsertSellerPlan(plan);
    }

    const config = await getSellerPricingConfig();
    const plans = await listSellerPlans();
    return json({ config, plans });
  } catch (err) {
    return handleApiError(err);
  }
}