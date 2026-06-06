"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/products/product-card";
import { Role } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

function detectAppMode(ua: string): boolean {
  const looksLikeWebView =
    /wv/.test(ua) ||
    /WebView/.test(ua) ||
    (/Android/.test(ua) && /Chrome/.test(ua));

  let native = false;
  try {
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform) native = cap.isNativePlatform();
  } catch {}

  return looksLikeWebView || native;
}

export type PromoData = {
  enabled: boolean;
  banners: any[];
  offers: any[];
  mostSold: any[];
};

export function PromoSection({
  promos,
  sessionRole,
  currentUserId,
  initialUserAgent = "",
  apkDownloadUrl = "#",
}: {
  promos: PromoData;
  sessionRole?: Role | null;
  currentUserId?: string | null;
  initialUserAgent?: string;
  apkDownloadUrl?: string;
}) {
  const [isApp, setIsApp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const ua =
      typeof navigator !== "undefined"
        ? navigator.userAgent
        : initialUserAgent;

    const looksLikeWebView =
      /wv/.test(ua) ||
      /WebView/.test(ua) ||
      (/Android/.test(ua) && /Chrome/.test(ua));

    let native = false;
    try {
      const cap = (window as any).Capacitor;
      if (cap?.isNativePlatform) native = cap.isNativePlatform();
    } catch {}

    setIsApp(looksLikeWebView || native);
  }, [initialUserAgent]);

  const handleApkDownload = () => {
    toast({
      title: "Downloading APK",
      description: "The download will start shortly. Check your downloads folder.",
      variant: "success",
    });
  };

  if (!promos.enabled) return null;

  const visibleBanners = isApp
    ? promos.banners.filter((b) => b.type !== "APK")
    : promos.banners;
  const apkBanners = !isApp
    ? promos.banners.filter((b) => b.type === "APK")
    : [];

  const hasContent =
    visibleBanners.length > 0 ||
    promos.offers.length > 0 ||
    promos.mostSold.length > 0 ||
    apkBanners.length > 0;

  if (!hasContent) return null;

  return (
    <section className="mb-10 space-y-8">
      {visibleBanners.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleBanners.map((banner) => (
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

      {apkBanners.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {apkBanners.map((banner) => (
            <div
              key={banner.id}
              className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm"
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
                  Android App
                </p>
                <h2 className="mt-1 text-xl font-bold">{banner.title}</h2>
                {banner.subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {banner.subtitle}
                  </p>
                )}
                <a
                  href={apkDownloadUrl}
                  download
                  onClick={handleApkDownload}
                  className="mt-4 inline-block rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Download APK
                </a>
              </div>
            </div>
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
                href={
                  offer.linkUrl ||
                  (offer.productId ? `/products/${offer.productId}` : "#")
                }
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
                  <p className="text-sm text-muted-foreground">
                    {offer.subtitle}
                  </p>
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
            {promos.mostSold.map((product: any) => (
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
