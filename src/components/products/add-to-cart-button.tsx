"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { notifyCartUpdated } from "@/components/layout/cart-badge";

export function AddToCartButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
      await apiFetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      notifyCartUpdated();
      router.push("/cart");
        } catch (e) {
          alert(e instanceof Error ? e.message : "Please login as customer");
        } finally {
          setLoading(false);
        }
      }}
    >
      Add to cart
    </Button>
  );
}
