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
import { Minus, Plus, Trash2 } from "lucide-react";

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
      alert(`Only ${item.product.stock} available`);
      return;
    }
    setUpdatingId(item.id);
    try {
      await apiFetch(`/api/cart/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      await loadCart();
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(itemId: string) {
    setUpdatingId(itemId);
    await apiFetch(`/api/cart/${itemId}`, { method: "DELETE" });
    await loadCart();
  }

  async function checkout() {
    setCheckingOut(true);
    try {
      const data = await apiFetch<{ order: { id: string } }>("/api/checkout", {
        method: "POST",
      });
      notifyCartUpdated();
      router.push(`/orders/${data.order.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading) return <p className="p-8 text-center">Loading cart...</p>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your cart</h1>
          <p className="text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"} from{" "}
            {Object.keys(grouped).length}{" "}
            {Object.keys(grouped).length === 1 ? "seller" : "sellers"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">
          Cart is empty.{" "}
          <Link href="/" className="text-primary underline">
            Browse marketplace
          </Link>
        </p>
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
                            onClick={() =>
                              updateQuantity(item, item.quantity - 1)
                            }
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
                            onClick={() =>
                              updateQuantity(item, item.quantity + 1)
                            }
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
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
              <Button size="lg" onClick={checkout} disabled={checkingOut}>
                {checkingOut ? "Processing..." : "Checkout"}
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
