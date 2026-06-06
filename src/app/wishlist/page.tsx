"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import { ProductCard } from "@/components/products/product-card";
import { EmptyWishlistState } from "@/components/ui/empty-state";
import { Role } from "@/lib/types";
import { useSession } from "@/hooks/use-session";

export default function WishlistPage() {
  const { wishlist, isSyncing, removeFromWishlist } = useWishlist();
  const session = useSession();

  if (isSyncing) {
    return (
      <div className="container mx-auto px-4 py-8 pb-16 md:pb-0">
        <p className="text-center">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-16 md:pb-0">
      <h1 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold">Your Wishlist</h1>

      {wishlist.length === 0 ? (
        <EmptyWishlistState />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-4">
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
                sessionRole={session?.role as Role}
                currentUserId={session?.userId}
              />
              <button
                onClick={() => removeFromWishlist(productId)}
                className="absolute top-1.5 right-1.5 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                aria-label="Remove from wishlist"
              >
                <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}