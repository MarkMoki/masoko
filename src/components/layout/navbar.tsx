import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/layout/logout-button";
import { CartBadge } from "@/components/layout/cart-badge";
import { MapPin, Store, Heart } from "lucide-react";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <Store className="h-5 w-5" />
          maSoKo
        </Link>

        <nav className="flex items-center gap-2 text-sm" aria-label="Main navigation">
          <Link href="/" className="px-2 py-1 hover:text-primary" data-tour="search">
            Marketplace
          </Link>
          <Link href="/map" className="flex items-center gap-1 px-2 py-1 hover:text-primary">
            <MapPin className="h-4 w-4" />
            Map
          </Link>

          {user?.role === Role.CUSTOMER && (
            <>
              <Link href="/wishlist" className="px-2 py-1 hover:text-primary" data-tour="wishlist">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Wishlist</span>
              </Link>
              <CartBadge />
              <Link href="/orders" className="px-2 py-1 hover:text-primary">
                Orders
              </Link>
            </>
          )}

          {user?.role === Role.SELLER && (
            <Link href="/merchant" className="px-2 py-1 hover:text-primary">
              Merchant
            </Link>
          )}

          {user?.role === Role.ADMIN && (
            <Link href="/admin" className="px-2 py-1 hover:text-primary">
              Admin
            </Link>
          )}

          {user ? (
            <div className="ml-2 flex items-center gap-2" data-tour="account">
              <span className="hidden text-muted-foreground sm:inline">{user.name}</span>
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
      </div>
    </header>
  );
}
