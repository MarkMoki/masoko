"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

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

export function AppDownloadBanner({
  userAgent = "",
  downloadUrl = "/downloads/maSoKo.apk",
}: {
  userAgent?: string;
  downloadUrl?: string;
}) {
  const [isApp, setIsApp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const ua =
      typeof navigator !== "undefined"
        ? navigator.userAgent
        : userAgent;
    setIsApp(detectAppMode(ua));
  }, [userAgent]);

  if (isApp) return null;

  const handleDownload = () => {
    toast({
      title: "Downloading APK",
      description: "The download will start shortly. Check your downloads folder.",
      variant: "success",
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-5 md:p-6 shadow-sm">
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Android App
          </p>
          <h3 className="mt-1 text-xl font-bold">
            Get the maSoKo Android App
          </h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Faster checkout, order tracking, and push notifications — download
            the APK now.
          </p>
        </div>
        <a
          href={downloadUrl}
          download
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 active:scale-95 transition-all min-h-[44px] justify-center"
        >
          <Store className="h-4 w-4" />
          Download APK
        </a>
      </div>
    </div>
  );
}

export function Footer({
  userAgent = "",
}: {
  userAgent?: string;
}) {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    const ua =
      typeof navigator !== "undefined"
        ? navigator.userAgent
        : userAgent;
    setIsApp(detectAppMode(ua));
  }, [userAgent]);

  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto px-3.5 md:px-4 lg:px-6 py-8 md:py-10">
        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-primary text-lg select-none">
              <Store className="h-5 w-5" />
              maSoKo
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Shop from multiple local sellers in one cart. Fast delivery across
              Kenya.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="mt-3.5 space-y-1">
              <li>
                <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 min-h-[36px]">
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/map" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 min-h-[36px]">
                  <MapPin className="h-3.5 w-3.5" />
                  Nearby Stores
                </Link>
              </li>
              <li>
                <Link href="/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 min-h-[36px]">
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                  Orders
                </Link>
              </li>
              <li>
                <Link href="/merchant" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 min-h-[36px]">
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                  Merchant
                </Link>
              </li>
              <li>
                <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 min-h-[36px]">
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-3.5 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <a href="mailto:support@masoko.local" className="flex items-center gap-2 hover:text-primary transition-colors py-1.5 min-h-[36px]">
                  <Mail className="h-3.5 w-3.5" />
                  support@masoko.local
                </a>
              </li>
              <li>
                <a href="tel:+254700000000" className="flex items-center gap-2 hover:text-primary transition-colors py-1.5 min-h-[36px]">
                  <Phone className="h-3.5 w-3.5" />
                  +254 700 000 000
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2 py-1.5 min-h-[36px]">
                  <MapPin className="h-3.5 w-3.5" />
                  Nairobi, Kenya
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="my-8">
          <AppDownloadBanner userAgent={userAgent} downloadUrl="/api/download-apk" />
        </div>

        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} maSoKo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
