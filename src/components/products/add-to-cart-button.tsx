"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { notifyCartUpdated } from "@/components/layout/cart-badge";
import { useToast } from "@/hooks/use-toast";

export function AddToCartButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.());
  }, []);

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
          toast({
            title: "Added to cart",
            description: "Item added to your cart",
            variant: "success",
          });
          if (isNative) {
            window.location.href = "/cart";
          } else {
            router.push("/cart");
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : "Please login as customer";
          toast({
            title: "Error",
            description: message,
            variant: "error",
          });
        } finally {
          setLoading(false);
        }
      }}
    >
      Add to cart
    </Button>
  );
}
