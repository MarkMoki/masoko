"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm">
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Android App
          </p>
          <h3 className="mt-1 text-xl font-bold">
            Get the maSoKo Android App
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Faster checkout, order tracking, and push notifications — download
            the APK now.
          </p>
        </div>
        <a
          href={downloadUrl}
          download
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-primary">
              <Store className="h-5 w-5" />
              maSoKo
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Shop from multiple local sellers in one cart. Fast delivery across
              Kenya.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-sm text-muted-foreground hover:text-primary">
                  Map
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm text-muted-foreground hover:text-primary">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="/merchant" className="text-sm text-muted-foreground hover:text-primary">
                  Merchant
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-muted-foreground">
                  Email: support@masoko.local
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Phone: +254 700 000 000
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
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
