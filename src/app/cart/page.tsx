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
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
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
      <div className="mx-auto max-w-3xl px-3.5 md:px-4 lg:px-6 py-6 md:py-8 pb-24 md:pb-8">
        <div className="mb-5 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your cart</h1>
          <p className="text-muted-foreground text-sm md:text-base">Loading your cart...</p>
        </div>
        <CartSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-3.5 md:px-4 lg:px-6 py-5 md:py-8 pb-24 md:pb-8">
      <div className="mb-5 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your cart</h1>
        {items.length > 0 && (
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"} from{" "}
            {Object.keys(grouped).length} {Object.keys(grouped).length === 1 ? "seller" : "sellers"}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <div className="flex justify-center mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-7 w-7 text-muted-foreground" />
            </div>
          </div>
          <p className="text-base md:text-lg text-muted-foreground mb-5">Your cart is empty</p>
          <Link href="/">
            <Button className="mobile-btn">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:space-y-4">
            {Object.entries(grouped).map(([sellerId, sellerItems]) => (
              <Card key={sellerId} className="rounded-xl shadow-sm overflow-hidden">
                <CardHeader className="pb-2 pt-3 px-4 md:px-5">
                  <CardTitle className="text-sm md:text-base font-semibold">
                    {(sellerItems as CartItem[])[0].product.seller.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-5 pb-3 md:pb-4">
                  {(sellerItems as CartItem[]).map((item) => (
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
          </div>

          <Card className="mt-5 md:mt-6 rounded-xl shadow-sm overflow-hidden sticky top-20 md:top-24 z-30">
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"} total
                </p>
                <p className="text-2xl md:text-3xl font-bold">{formatCurrency(total)}</p>
              </div>
              <Button
                size="lg"
                onClick={checkout}
                loading={checkingOut}
                className="w-full sm:w-auto h-12 mobile-btn-lg"
              >
                Checkout
              </Button>
            </CardContent>
          </Card>
          <p className="mt-2.5 text-xs md:text-sm text-muted-foreground">
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
      className="flex gap-3 md:gap-4 border-b pb-3 md:pb-4 last:border-0 last:pb-0"
    >
      <Link
        href={`/products/${item.product.id}`}
        className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-muted"
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
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <Link
            href={`/products/${item.product.id}`}
            className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
          >
            {item.product.name}
          </Link>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            {formatCurrency(item.product.price)} each
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 min-[375px]:h-9 min-[375px]:w-9"
              disabled={updatingId === item.id || item.quantity <= 1}
              onClick={() => onUpdate(item, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-7 min-[375px]:w-8 text-center text-sm font-semibold">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 min-[375px]:h-9 min-[375px]:w-9"
              disabled={updatingId === item.id || item.quantity >= item.product.stock}
              onClick={() => onUpdate(item, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="font-bold text-sm md:text-base">{formatCurrency(item.product.price * item.quantity)}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-destructive hover:bg-destructive/10 h-8 w-8 sm:h-9 sm:w-9"
        disabled={updatingId === item.id}
        onClick={() => onRemove(item.id)}
        aria-label="Remove item"
      >
        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="space-y-3 md:space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="rounded-xl">
          <CardHeader className="pb-2 pt-3 px-4 md:px-5">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent className="px-4 md:px-5 pb-3 md:pb-4">
            <CartItemSkeleton />
            <CartItemSkeleton />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
