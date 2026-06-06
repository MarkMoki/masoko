"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/cart/count", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d) => setCount(d.count ?? 0))
      .catch(() => setCount(0));

    const onCartUpdate = () => {
      fetch("/api/cart/count", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : { count: 0 }))
        .then((d) => setCount(d.count ?? 0));
    };

    window.addEventListener("cart-updated", onCartUpdate);
    return () => window.removeEventListener("cart-updated", onCartUpdate);
  }, []);

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1 px-2 py-1 hover:text-primary"
      data-tour="cart"
      aria-label={`Cart with ${count} items`}
    >
      <ShoppingCart className="h-4 w-4" />
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
          aria-live="polite"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }
}
