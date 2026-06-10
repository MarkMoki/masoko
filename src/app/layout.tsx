import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PWAInstallPrompt } from "@/components/layout/pwa-install-prompt";
import { OnboardingTour } from "@/components/ui/onboarding-tour";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#14532d",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "maSoKo — Multi-vendor Marketplace",
  description: "Browse products from multiple sellers across Kenya",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "maSoKo",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "maSoKo",
    "theme-color": "#14532d",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const userAgent = (await headers()).get("user-agent") ?? "";

  return (
    <html lang="en" className="safe-top">
      <body className={`${inter.className} safe-bottom antialiased`}>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
          <Footer userAgent={userAgent} />
          <MobileBottomNav />
          <PWAInstallPrompt />
          <OnboardingTour />
        </Providers>
      </body>
    </html>
  );
}