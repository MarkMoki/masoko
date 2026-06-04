import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { Role } from "@/lib/types";
import type { getMarketplacePromos } from "@/lib/marketplace";

type PromoData = Awaited<ReturnType<typeof getMarketplacePromos>>;

export function PromoSection({
  promos,
  sessionRole,
  currentUserId,
}: {
  promos: PromoData;
  sessionRole?: Role | null;
  currentUserId?: string | null;
}) {
  if (!promos.enabled) return null;

  const hasContent =
    promos.banners.length > 0 ||
    promos.offers.length > 0 ||
    promos.mostSold.length > 0;

  if (!hasContent) return null;

  return (
    <section className="mb-10 space-y-8">
      {promos.banners.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {promos.banners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.linkUrl || "#"}
              className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm transition hover:shadow-md"
            >
              {banner.imageUrl && (
                <div className="absolute inset-0 opacity-20">
                  <Image
                    src={banner.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Featured
                </p>
                <h2 className="mt-1 text-xl font-bold">{banner.title}</h2>
                {banner.subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {promos.offers.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Special offers</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {promos.offers.map((offer) => (
              <Link
                key={offer.id}
                href={offer.linkUrl || offer.productId ? `/products/${offer.productId}` : "#"}
                className="min-w-[240px] shrink-0 rounded-lg border bg-card p-4 transition hover:border-primary"
              >
                {offer.imageUrl && (
                  <div className="relative mb-2 h-24 w-full overflow-hidden rounded">
                    <Image
                      src={offer.imageUrl}
                      alt={offer.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="font-medium">{offer.title}</p>
                {offer.subtitle && (
                  <p className="text-sm text-muted-foreground">{offer.subtitle}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {promos.mostSold.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Most sold</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {promos.mostSold.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                sessionRole={sessionRole}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
