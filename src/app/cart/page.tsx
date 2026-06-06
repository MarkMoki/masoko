"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, groupBy } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { notifyCartUpdated } from "@/components/layout/cart-badge";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { CartItemSkeleton } from "@/components/cart/cart-item-skeleton";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    sellerId: string;
    seller: { name: string };
  };
};

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function loadCart() {
    const data = await apiFetch<{ cart: { items: CartItem[] } }>("/api/cart");
    setItems(data.cart.items);
    setLoading(false);
    notifyCartUpdated();
  }

  useEffect(() => {
    loadCart().catch(() => setLoading(false));
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const grouped = groupBy(items, (i) => i.product.sellerId);

  async function updateQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) return;
    if (quantity > item.product.stock) {
      toast({
        title: "Stock limit",
        description: `Only ${item.product.stock} available`,
        variant: "error",
      });
      return;
    }
    setUpdatingId(item.id);
    try {
      await apiFetch(`/api/cart/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      await loadCart();
      toast({
        title: "Cart updated",
        description: "Item quantity updated",
        variant: "success",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(itemId: string) {
    setUpdatingId(itemId);
    await apiFetch(`/api/cart/${itemId}`, { method: "DELETE" });
    await loadCart();
    toast({
      title: "Item removed",
      description: "Item removed from cart",
      variant: "success",
    });
  }

  async function checkout() {
    setCheckingOut(true);
    try {
      const data = await apiFetch<{ order: { id: string } }>("/api/checkout", {
        method: "POST",
      });
      notifyCartUpdated();
      toast({
        title: "Order created",
        description: "Redirecting to order details...",
        variant: "success",
      });
      router.push(`/orders/${data.order.id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Checkout failed";
      toast({
        title: "Checkout failed",
        description: message,
        variant: "error",
      });
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6 md:py-8 pb-16 md:pb-0">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Your cart</h1>
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
        <CartSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 md:py-8 pb-16 md:pb-0">
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Your cart</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {itemCount} {itemCount === 1 ? "item" : "items"} from{" "}
            {Object.keys(grouped).length}{" "}
            {Object.keys(grouped).length === 1 ? "seller" : "sellers"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground mb-4">
            Cart is empty.{" "}
            <Link href="/" className="text-primary underline">
              Browse marketplace
            </Link>
          </p>
          <Link href="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([sellerId, sellerItems]) => (
            <Card key={sellerId} className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {sellerItems[0].product.seller.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sellerItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    updatingId={updatingId}
                    onUpdate={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="mt-6">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {itemCount} items total
                </p>
                <p className="text-2xl font-bold">{formatCurrency(total)}</p>
              </div>
              <Button size="lg" onClick={checkout} loading={checkingOut}>
                Checkout
              </Button>
            </CardContent>
          </Card>
          <p className="mt-2 text-sm text-muted-foreground">
            One master order is split per seller. You pay each seller separately.
          </p>
        </>
      )}
    </div>
  );
}

function CartItemRow({
  item,
  updatingId,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  updatingId: string | null;
  onUpdate: (item: CartItem, quantity: number) => void;
  onRemove: (itemId: string) => void;
}) {
  return (
    <div
      key={item.id}
      className="flex gap-4 border-b pb-4 last:border-0 last:pb-0"
    >
      <Link
        href={`/products/${item.product.id}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${item.product.id}`}
            className="font-medium hover:text-primary"
          >
            {item.product.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(item.product.price)} each
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={updatingId === item.id || item.quantity <= 1}
              onClick={() => onUpdate(item, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-semibold">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={
                updatingId === item.id ||
                item.quantity >= item.product.stock
              }
              onClick={() => onUpdate(item, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="font-semibold">
            {formatCurrency(item.product.price * item.quantity)}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-destructive"
        disabled={updatingId === item.id}
        onClick={() => onRemove(item.id)}
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <CartItemSkeleton />
            <CartItemSkeleton />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
