import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "maSoKo — Multi-vendor Marketplace",
  description: "Browse products from multiple sellers across Kenya",
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
        </Providers>
      </body>
    </html>
  );
}
