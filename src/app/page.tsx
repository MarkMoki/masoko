import { getCurrentUser, getSession } from "@/lib/auth";
import { getMarketplacePromos } from "@/lib/marketplace";
import { ProductCard } from "@/components/products/product-card";
import { PromoSection } from "@/components/marketplace/promo-section";
import { Suspense } from "react";
import { MarketplaceSearch } from "@/components/products/marketplace-search";
import { FilterSidebar } from "@/components/products/filter-sidebar";
import { EmptyProductsState } from "@/components/ui/empty-state";
import { headers } from "next/headers";
import { listDocuments, Query, COLLECTIONS } from "@/lib/db/helpers";
import { enrichProducts } from "@/lib/db/products";
import type { Product, Category } from "@/lib/types";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string; minPrice?: string; maxPrice?: string; sortBy?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 24;
  const skip = (page - 1) * limit;

  const userAgent = (await headers()).get("user-agent") ?? "";

  // Fetch categories for filter sidebar
  const categoriesResult = await listDocuments<Category>(COLLECTIONS.categories, [
    Query.limit(100),
    Query.orderAsc("name"),
  ]);
  const categories = categoriesResult.documents;

  // Fetch products
  const queries: string[] = [Query.orderDesc("$createdAt")];
  if (q) queries.push(Query.search("name", q));
  queries.push(Query.limit(limit));
  queries.push(Query.offset(skip));
  if (!q) queries.push(Query.equal("active", true));

  const productsResult = await listDocuments<{
    sellerId: string;
    storeId?: string;
    categoryId?: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    active: boolean;
  }>(COLLECTIONS.products, queries);
  const products = await enrichProducts(productsResult.documents);
  const total = productsResult.total;

  const [user, session, promos] = await Promise.all([
    getCurrentUser(),
    getSession(),
    getMarketplacePromos(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-16 md:pb-0">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Shop from multiple sellers in one cart
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <FilterSidebar categories={categories} />

        <div className="flex-1">
          <Suspense fallback={<div className="mb-4 md:mb-6 h-9 md:h-10 max-w-md animate-pulse rounded bg-muted" />}>
            <MarketplaceSearch defaultQuery={q} />
          </Suspense>

          {!q && page === 1 && (
            <PromoSection
              promos={promos}
              sessionRole={session?.role}
              currentUserId={user?.id}
              initialUserAgent={userAgent}
              apkDownloadUrl="/api/download-apk"
            />
          )}

          <h2 className="mb-3 md:mb-4 text-lg font-semibold">All products</h2>

          {products.length === 0 ? (
            <EmptyProductsState searchQuery={q} />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  sessionRole={session?.role}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 md:mt-8 flex justify-center gap-2">
              {page > 1 && (
                <a
                  href={`/?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="rounded border px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm hover:bg-muted"
                >
                  Previous
                </a>
              )}
              <span className="flex items-center px-3 md:px-4 text-xs md:text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="rounded border px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm hover:bg-muted"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}