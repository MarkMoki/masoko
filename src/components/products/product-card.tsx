"use client";

import Image from "next/image";
import Link from "next/link";
import { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { notifyCartUpdated } from "@/components/layout/cart-badge";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/hooks/use-wishlist";
import { WishlistButton } from "@/components/products/wishlist-button";
import { ShareButton } from "@/components/products/share-button";
import { StarRating } from "@/components/ui/star-rating";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    sellerId: string;
    store?: { name: string } | null;
    seller?: { name: string } | null;
    averageRating?: number;
    reviewCount?: number;
  };
  sessionRole?: Role | null;
  currentUserId?: string | null;
};

export function ProductCard({
  product,
  sessionRole,
  currentUserId,
}: ProductCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isOwner = currentUserId === product.sellerId;
  const canEdit =
    sessionRole === Role.ADMIN || (sessionRole === Role.SELLER && isOwner);
  const canAddToCart = sessionRole === Role.CUSTOMER || !sessionRole;

  async function addToCart() {
    setLoading(true);
    try {
      await apiFetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      notifyCartUpdated();
      toast({
        title: "Added to cart",
        description: `${product.name} added to your cart`,
        variant: "success",
      });
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to add to cart";
      toast({
        title: "Error",
        description: message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct() {
    if (!confirm("Delete this product?")) return;
    await apiFetch(`/api/products/${product.id}`, { method: "DELETE" });
    toast({
      title: "Product deleted",
      description: `${product.name} has been deleted`,
      variant: "success",
    });
    router.refresh();
  }

  return (
    <Card className="group overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center gap-1">
                <svg className="h-8 w-8 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span className="text-xs">No image</span>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <WishlistButton
              productId={product.id}
              isInWishlist={isInWishlist(product.id)}
              onToggle={toggleWishlist}
            />
          </div>
        </div>
      </Link>
      <CardContent className="p-3 md:p-4">
        <Link href={`/products/${product.id}`} className="group/title">
          <h3 className="font-semibold line-clamp-1 text-sm md:text-base group-hover/title:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">{product.store?.name ?? product.seller?.name}</p>
        {product.averageRating !== undefined && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <StarRating rating={product.averageRating} readOnly size="sm" />
            <span className="text-[11px] md:text-xs text-muted-foreground">
              ({product.reviewCount ?? 0})
            </span>
          </div>
        )}
        <p className="mt-2 font-bold text-primary text-sm md:text-base">
          {formatCurrency(product.price)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {canAddToCart && (
            <Button
              size="sm"
              onClick={addToCart}
              loading={loading}
              className="flex-1 h-10 md:h-9 text-sm min-[375px]:text-xs rounded-lg"
            >
              Add to cart
            </Button>
          )}
          {!canAddToCart && (
            <ShareButton productId={product.id} productName={product.name} />
          )}
          {canEdit && (
            <>
              <Button asChild size="sm" variant="outline" className="h-10 md:h-9 rounded-lg">
                <Link href={`/products/${product.id}/edit`}>Edit</Link>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={deleteProduct}
                className="h-10 md:h-9 rounded-lg"
                aria-label="Delete product"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
