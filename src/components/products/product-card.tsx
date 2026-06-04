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

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    sellerId: string;
    store?: { name: string } | null;
    seller?: { name: string } | null;
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
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">
          {product.store?.name ?? product.seller?.name}
        </p>
        <p className="mt-1 font-bold text-primary">{formatCurrency(product.price)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {canAddToCart && (
            <Button size="sm" onClick={addToCart} disabled={loading}>
              Add to cart
            </Button>
          )}
          {canEdit && (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href={`/products/${product.id}/edit`}>Edit</Link>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  if (!confirm("Delete this product?")) return;
                  await apiFetch(`/api/products/${product.id}`, { method: "DELETE" });
                  router.refresh();
                }}
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
