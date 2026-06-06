import { createDocument, listDocuments, updateDocument, Query, getDocument, deleteDocument } from "@/lib/db/helpers";
import { COLLECTIONS } from "@/lib/appwrite/config";
import type { SiteConfig, SellerPricingConfig, SellerPlan, MarketplacePromo, Product } from "@/lib/types";

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
}) {
  return createDocument(COLLECTIONS.notifications, {
    userId: data.userId,
    title: data.title,
    message: data.message,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export async function listNotifications(userId: string, limit = 50) {
  const result = await listDocuments(COLLECTIONS.notifications, [
    Query.equal("userId", userId),
    Query.limit(limit),
    Query.orderDesc("createdAt"),
  ]);
  return result.documents as any[];
}

export async function markAllAsRead(userId: string) {
  const result = await listDocuments(COLLECTIONS.notifications, [
    Query.equal("userId", userId),
    Query.equal("read", false),
  ]);

  await Promise.all(
    result.documents.map((n) =>
      updateDocument(COLLECTIONS.notifications, n.id, { read: true })
    )
  );
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const configs = await listDocuments<SiteConfig>(COLLECTIONS.siteConfig, [
    Query.limit(1),
  ]);
  if (configs.documents.length > 0) {
    return configs.documents[0];
  }
  return {
    id: "default",
    marketplacePromoEnabled: false,
    updatedAt: new Date().toISOString(),
  };
}

export async function upsertSiteConfig(data: Partial<SiteConfig>) {
  const existing = await getSiteConfig();
  if (existing.id === "default" || existing.id) {
    return updateDocument(COLLECTIONS.siteConfig, existing.id, data);
  }
  return createDocument(COLLECTIONS.siteConfig, {
    marketplacePromoEnabled: true,
    ...data,
  });
}

export async function getSellerPricingConfig(): Promise<SellerPricingConfig> {
  const configs = await listDocuments<SellerPricingConfig>(COLLECTIONS.sellerPricingConfig, [
    Query.limit(1),
  ]);
  if (configs.documents.length > 0) {
    return configs.documents[0];
  }
  return {
    id: "default",
    defaultModel: "PAY_AS_YOU_GO" as any,
    subscriptionMonthly: 0,
    payAsYouGoFlatFee: 0,
    payAsYouGoPercent: 5,
    description: null,
    updatedAt: new Date().toISOString(),
  } as SellerPricingConfig;
}

export async function upsertSellerPricingConfig(data: Partial<SellerPricingConfig>) {
  const existing = await getSellerPricingConfig();
  return updateDocument(COLLECTIONS.sellerPricingConfig, existing.id, data);
}

export async function listSellerPlans() {
  const result = await listDocuments<SellerPlan>(COLLECTIONS.sellerPlans, []);
  return result.documents;
}

export async function upsertSellerPlan(data: {
  sellerId: string;
  model: string;
  monthlyFee?: number;
  perOrderFee?: number;
  feePercent?: number;
  notes?: string;
}) {
  const existing = await listDocuments<SellerPlan>(COLLECTIONS.sellerPlans, [
    Query.equal("sellerId", data.sellerId),
    Query.equal("active", true),
    Query.limit(1),
  ]);

  if (existing.documents.length > 0) {
    return updateDocument(COLLECTIONS.sellerPlans, existing.documents[0].id, data);
  }

  return createDocument(COLLECTIONS.sellerPlans, {
    ...data,
    active: true,
  });
}

export async function listMarketplacePromos(activeOnly = false) {
  const result = await listDocuments<MarketplacePromo>(COLLECTIONS.marketplacePromos, activeOnly ? [Query.equal("active", true)] : []);
  return result.documents;
}

export async function createMarketplacePromo(data: Omit<MarketplacePromo, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
  return createDocument(COLLECTIONS.marketplacePromos, data);
}

export async function updateMarketplacePromo(id: string, data: Partial<MarketplacePromo>) {
  return updateDocument(COLLECTIONS.marketplacePromos, id, data);
}

export async function deleteMarketplacePromo(id: string) {
  return deleteDocument(COLLECTIONS.marketplacePromos, id);
}

export async function enrichPromos(promos: MarketplacePromo[]) {
  return promos;
}

export async function aggregateMostSoldProducts(limit: number): Promise<Product[]> {
  return [];
}