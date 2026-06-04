import { getCurrentUser, getSession } from "@/lib/auth";
import { getMarketplacePromos } from "@/lib/marketplace";
import { ProductCard } from "@/components/products/product-card";
import { PromoSection } from "@/components/marketplace/promo-section";
import { Suspense } from "react";
import { MarketplaceSearch } from "@/components/products/marketplace-search";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 24;
  const skip = (page - 1) * limit;

  const [products, total, user, session, promos] = await Promise.all([
    Promise.resolve([] as any[]), // Prisma removed
    Promise.resolve(0 as number), // Prisma removed - product count
    getCurrentUser(),
    getSession(),
    getMarketplacePromos(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground">
          Shop from multiple sellers in one place
        </p>
      </div>

      <Suspense fallback={<div className="mb-6 h-10 max-w-md animate-pulse rounded bg-muted" />}>
        <MarketplaceSearch defaultQuery={q} />
      </Suspense>

      {!q && page === 1 && (
        <PromoSection
          promos={promos}
          sessionRole={session?.role}
          currentUserId={user?.id}
        />
      )}

      <h2 className="mb-4 text-lg font-semibold">All products</h2>

      {products.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No products found.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`/?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="rounded border px-4 py-2 text-sm hover:bg-muted"
            >
              Previous
            </a>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="rounded border px-4 py-2 text-sm hover:bg-muted"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
