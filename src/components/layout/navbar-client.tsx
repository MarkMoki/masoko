"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/layout/logout-button";
import { CartBadge } from "@/components/layout/cart-badge";
import { MapPin, Store, Heart, ShoppingCart, Bell, Menu, X as XIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavbarClient({ user }: { user: { name: string; role: string; email?: string } | null }) {
  const pathname = usePathname();
  const session = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = user?.role || session?.role;
  const isAdmin = userRole === "admin";
  const isSeller = userRole === "seller";
  const isCustomer = userRole === "customer" || !userRole;
  const isLoggedIn = !!session || !!user;

  const displayName = user?.name || "User";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const activeNav = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navLinkClass = (href: string) => {
    const active = activeNav(href);
    return cn(
      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px]",
      active
        ? "bg-primary/10 text-primary"
        : "text-foreground/70 hover:text-foreground hover:bg-accent active:scale-[0.98]"
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 md:h-16 items-center justify-between px-3.5 md:px-4 lg:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-primary text-base md:text-lg select-none"
        >
          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-primary/10">
            <Store className="h-4.5 w-4.5 md:h-[18px] md:w-[18px]" />
          </div>
          <span>maSoKo</span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-1 text-sm"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className={cn(
              "px-3 py-2 rounded-lg transition-colors",
              pathname === "/" ? "text-primary bg-primary/5" : "hover:text-primary hover:bg-accent"
            )}
          >
            Marketplace
          </Link>
          <Link
            href="/map"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-primary hover:bg-accent transition-colors"
            data-tour="map"
          >
            <MapPin className="h-4 w-4" />
            Map
          </Link>

          {isCustomer && (
            <>
              <Link
                href="/wishlist"
                className="px-3 py-2 rounded-lg hover:text-primary hover:bg-accent transition-colors"
                data-tour="wishlist"
              >
                Wishlist
              </Link>
              <span data-tour="cart">
                <CartBadge />
              </span>
              <Link
                href="/orders"
                className="px-3 py-2 rounded-lg hover:text-primary hover:bg-accent transition-colors"
                data-tour="orders-customer"
              >
                Orders
              </Link>
            </>
          )}

          {isSeller && (
            <Link
              href="/merchant"
              className="px-3 py-2 rounded-lg hover:text-primary hover:bg-accent transition-colors"
              data-tour="merchant"
            >
              Merchant
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-2 rounded-lg hover:text-primary hover:bg-accent transition-colors"
              data-tour="admin"
            >
              Admin
            </Link>
          )}

          {isLoggedIn ? (
            <div className="ml-2 flex items-center gap-2">
              <span className="hidden text-muted-foreground lg:inline">
                {displayName}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="ml-2 flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>

        <div className="flex md:hidden items-center gap-1">
          {isCustomer && (
            <Link
              href="/cart"
              className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent transition-colors relative"
              data-tour="cart-mobile"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent active:scale-95 transition-all"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <XIcon className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="fixed inset-x-0 top-14 z-50 md:hidden bg-background/95 backdrop-blur-md border-b shadow-lg animate-slide-down-mobile max-h-[calc(100dvh-3.5rem-5rem)] overflow-y-auto safe-top"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col p-3 space-y-1 safe-bottom">
              <Link href="/" className={navLinkClass("/")}>
                <Store className="h-5 w-5" />
                <span>Marketplace</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
              </Link>
              <Link href="/map" className={navLinkClass("/map")}>
                <MapPin className="h-5 w-5" />
                <span>Nearby Stores</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
              </Link>

              {isCustomer && (
                <>
                  <Link href="/wishlist" className={navLinkClass("/wishlist")} data-tour="wishlist">
                    <Heart className="h-5 w-5" />
                    <span>Wishlist</span>
                    <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                  </Link>
                  <Link href="/cart" className={navLinkClass("/cart")} data-tour="cart-mobile">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Cart</span>
                    <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                  </Link>
                  <Link href="/orders" className={navLinkClass("/orders")} data-tour="orders-customer">
                    <Bell className="h-5 w-5" />
                    <span>Orders</span>
                    <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                  </Link>
                </>
              )}

              {isSeller && (
                <Link href="/merchant" className={navLinkClass("/merchant")} data-tour="merchant">
                  <Store className="h-5 w-5" />
                  <span>Merchant Dashboard</span>
                  <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin" className={navLinkClass("/admin")} data-tour="admin">
                  <Store className="h-5 w-5" />
                  <span>Admin Dashboard</span>
                  <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                </Link>
              )}

              <div className="border-t my-2" />

              {isLoggedIn ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground text-sm">
                        {displayName}
                      </span>
                    </div>
                  </div>
                  <LogoutButton />
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-11 justify-center rounded-xl"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full h-11 justify-center rounded-xl"
                  >
                    <Link href="/register">Create Account</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}