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
    imageUrl: string | null;
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
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
            <WishlistButton
              productId={product.id}
              isInWishlist={isInWishlist(product.id)}
              onToggle={toggleWishlist}
            />
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">
          {product.store?.name ?? product.seller?.name}
        </p>
        {product.averageRating !== undefined && (
          <div className="mt-1">
            <StarRating rating={product.averageRating} readOnly size="sm" />
            <span className="ml-1 text-xs text-muted-foreground">
              ({product.reviewCount ?? 0})
            </span>
          </div>
        )}
        <p className="mt-1 font-bold text-primary">{formatCurrency(product.price)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {canAddToCart && (
            <Button size="sm" onClick={addToCart} loading={loading} className="flex-1">
              Add to cart
            </Button>
          )}
          {!canAddToCart && (
            <ShareButton productId={product.id} productName={product.name} />
          )}
          {canEdit && (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href={`/products/${product.id}/edit`}>Edit</Link>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={deleteProduct}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
