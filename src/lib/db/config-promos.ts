import { Query } from "node-appwrite";
import {
  COLLECTIONS,
  createDocument,
  findOne,
  getDocument,
  listAllDocuments,
  listDocuments,
  updateDocument,
  deleteDocument,
} from "./helpers";
import { enrichProduct, getProductsByIds } from "./products";
import {
  PricingModel,
  PromoType,
  type MarketplacePromo,
  type Notification,
  type SellerPlan,
  type SellerPricingConfig,
  type SiteConfig,
} from "../types";
import { getUserById } from "./users-stores";

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
}) {
  return createDocument<Notification>(COLLECTIONS.notifications, {
    ...data,
    read: false,
  });
}

export async function listNotifications(userId: string, limit = 50) {
  const { documents } = await listDocuments<Notification>(
    COLLECTIONS.notifications,
    [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ]
  );
  return documents;
}

export async function getSiteConfig() {
  try {
    return await getDocument<SiteConfig>(COLLECTIONS.siteConfig, "default");
  } catch {
    return createDocument<SiteConfig>(
      COLLECTIONS.siteConfig,
      { marketplacePromoEnabled: true },
      "default"
    );
  }
}

export async function upsertSiteConfig(
  data: Partial<Pick<SiteConfig, "marketplacePromoEnabled">>
) {
  try {
    return await updateDocument<SiteConfig>(
      COLLECTIONS.siteConfig,
      "default",
      data
    );
  } catch {
    return createDocument<SiteConfig>(
      COLLECTIONS.siteConfig,
      { marketplacePromoEnabled: true, ...data },
      "default"
    );
  }
}

export async function getSellerPricingConfig() {
  try {
    return await getDocument<SellerPricingConfig>(
      COLLECTIONS.sellerPricingConfig,
      "default"
    );
  } catch {
    return createDocument<SellerPricingConfig>(
      COLLECTIONS.sellerPricingConfig,
      {
        defaultModel: PricingModel.SUBSCRIPTION,
        subscriptionMonthly: 2500,
        payAsYouGoFlatFee: 50,
        payAsYouGoPercent: 3,
      },
      "default"
    );
  }
}

export async function upsertSellerPricingConfig(
  data: Partial<Omit<SellerPricingConfig, "id" | "updatedAt">>
) {
  try {
    return await updateDocument<SellerPricingConfig>(
      COLLECTIONS.sellerPricingConfig,
      "default",
      data
    );
  } catch {
    return createDocument<SellerPricingConfig>(
      COLLECTIONS.sellerPricingConfig,
      data,
      "default"
    );
  }
}

export async function listSellerPlans() {
  const plans = await listAllDocuments<SellerPlan>(COLLECTIONS.sellerPlans, [
    Query.orderDesc("$updatedAt"),
  ]);
  return Promise.all(
    plans.map(async (plan) => {
      const seller = await getUserById(plan.sellerId, true);
      return {
        ...plan,
        seller: {
          id: seller.id,
          name: seller.name,
          email: seller.email,
          store: seller.store ?? null,
        },
      };
    })
  );
}

export async function upsertSellerPlan(data: {
  sellerId: string;
  model: PricingModel;
  monthlyFee?: number;
  perOrderFee?: number;
  feePercent?: number;
  notes?: string;
  active?: boolean;
}) {
  const existing = await findOne<SellerPlan>(COLLECTIONS.sellerPlans, [
    Query.equal("sellerId", data.sellerId),
  ]);
  const payload = {
    model: data.model,
    monthlyFee: data.monthlyFee ?? null,
    perOrderFee: data.perOrderFee ?? null,
    feePercent: data.feePercent ?? null,
    notes: data.notes ?? null,
    active: data.active ?? true,
  };
  if (existing) {
    return updateDocument<SellerPlan>(
      COLLECTIONS.sellerPlans,
      existing.id,
      payload
    );
  }
  return createDocument<SellerPlan>(COLLECTIONS.sellerPlans, {
    sellerId: data.sellerId,
    ...payload,
  });
}

export async function listMarketplacePromos(activeOnly = false) {
  const queries = [Query.orderAsc("sortOrder"), Query.orderDesc("$createdAt")];
  if (activeOnly) queries.push(Query.equal("active", true));
  return listAllDocuments<MarketplacePromo>(
    COLLECTIONS.marketplacePromos,
    queries
  );
}

export async function createMarketplacePromo(
  data: Omit<MarketplacePromo, "id" | "createdAt" | "updatedAt" | "product">
) {
  return createDocument<MarketplacePromo>(COLLECTIONS.marketplacePromos, data);
}

export async function updateMarketplacePromo(
  id: string,
  data: Partial<Omit<MarketplacePromo, "id" | "createdAt" | "updatedAt">>
) {
  return updateDocument<MarketplacePromo>(
    COLLECTIONS.marketplacePromos,
    id,
    data
  );
}

export async function deleteMarketplacePromo(id: string) {
  await deleteDocument(COLLECTIONS.marketplacePromos, id);
}

export async function enrichPromo(promo: MarketplacePromo) {
  if (!promo.productId) return { ...promo, product: null };
  try {
    const product = await enrichProduct(
      await getDocument(COLLECTIONS.products, promo.productId)
    );
    return { ...promo, product };
  } catch {
    return { ...promo, product: null };
  }
}

export async function enrichPromos(promos: MarketplacePromo[]) {
  return Promise.all(promos.map(enrichPromo));
}

export async function aggregateMostSoldProducts(limit = 8) {
   const items = await listAllDocuments<{ productId: string; quantity: number }>(
     COLLECTIONS.sellerOrderItems,
     []
   );
   const totals = new Map<string, number>();
   for (const item of items) {
     totals.set(
       item.productId,
       (totals.get(item.productId) ?? 0) + item.quantity
     );
   }
   const sorted = [...totals.entries()]
     .sort((a, b) => b[1] - a[1])
     .slice(0, limit)
     .map(([productId]) => productId);
   const products = await getProductsByIds(sorted);
   const byId = new Map(products.map((p) => [p.id, p]));
   return await Promise.all(
     sorted
       .map((id) => byId.get(id))
       .filter(Boolean)
       .map((p) => enrichProduct(p!))
   );
 }

export { PromoType };
