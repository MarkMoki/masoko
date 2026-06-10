"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import { ProductCard } from "@/components/products/product-card";
import { EmptyWishlistState } from "@/components/ui/empty-state";
import { Role } from "@/lib/types";
import { useSession } from "@/hooks/use-session";

function toRole(r: string | undefined): Role | null {
  if (!r) return null;
  return r === "admin"
    ? Role.ADMIN
    : r === "seller"
    ? Role.SELLER
    : Role.CUSTOMER;
}

export default function WishlistPage() {
  const { wishlist, isSyncing, removeFromWishlist } = useWishlist();
  const session = useSession();

  if (isSyncing) {
    return (
      <div className="mx-auto max-w-2xl px-3.5 md:px-4 lg:px-6 py-6 md:py-8 pb-24 md:pb-8">
        <p className="text-center text-sm md:text-base">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-3.5 md:px-4 lg:px-6 py-5 md:py-8 pb-24 md:pb-8">
      <h1 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold tracking-tight">Your Wishlist</h1>

      {wishlist.length === 0 ? (
        <EmptyWishlistState />
      ) : (
        <div className="grid grid-cols-2 gap-2.5 md:gap-4">
          {wishlist.map((productId) => (
            <div key={productId} className="relative">
              <ProductCard
                product={{
                  id: productId,
                  name: "Loading...",
                  price: 0,
                  imageUrl: null,
                  sellerId: "",
                }}
                sessionRole={toRole(session?.role)}
                currentUserId={session?.userId}
              />
              <button
                onClick={() => removeFromWishlist(productId)}
                className="absolute top-2 right-2 h-9 w-9 flex items-center justify-center rounded-full bg-destructive text-white shadow-lg active:scale-90 transition-transform"
                aria-label="Remove from wishlist"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}