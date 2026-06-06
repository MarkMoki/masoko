import { getSiteConfig, listMarketplacePromos, aggregateMostSoldProducts } from "./db/config-promos";
import { enrichProduct, getProductById } from "./db/products";
import type { MarketplacePromo, Product } from "./types";

export async function getMarketplacePromos() {
  const config = await getSiteConfig();
  if (!config.marketplacePromoEnabled) {
    return { enabled: false, banners: [], offers: [], mostSold: [] };
  }

  const promos = await listMarketplacePromos(true); // activeOnly = true

  // Enrich promos with product data
  const enrichedPromos = await Promise.all(
    promos.map(async (promo) => {
      if (!promo.productId) return { ...promo, product: null };
      try {
        const product = await enrichProduct(
          await getProductById(promo.productId, false)
        );
        return { ...promo, product };
      } catch {
        return { ...promo, product: null };
      }
    })
  );

  const manualMostSold = enrichedPromos
    .filter((p) => p.type === "MOST_SOLD" && p.product)
    .map((p) => p.product!);

  let computedMostSold = manualMostSold;
  if (manualMostSold.length === 0) {
    computedMostSold = await aggregateMostSoldProducts(8);
  }

  return {
    enabled: true,
    banners: enrichedPromos.filter((p) => p.type === "BANNER"),
    offers: enrichedPromos.filter((p) => p.type === "OFFER"),
    mostSold: computedMostSold,
  };
}