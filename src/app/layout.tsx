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
  maximumScale: 1,
  userScalable: false,
  themeColor: "#14532d",
};

export const metadata: Metadata = {
  title: "maSoKo — Multi-vendor Marketplace",
  description: "Browse products from multiple sellers across Kenya",
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const userAgent = (await headers()).get("user-agent") ?? "";

  return (
    <html lang="en">
      <body className={inter.className}>
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