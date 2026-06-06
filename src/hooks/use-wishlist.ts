"use client";

import { useState, useEffect, useRef } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { apiFetch } from "@/lib/api";

const WISHLIST_KEY = "masoko-wishlist";

export function useWishlist() {
  const [wishlist, setWishlist] = useLocalStorage<string[]>(WISHLIST_KEY, []);
  const [isSyncing, setIsSyncing] = useState(false);
  const synced = useRef(false);

  useEffect(() => {
    if (!synced.current) {
      syncWishlist();
    }
    synced.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function syncWishlist() {
    setIsSyncing(true);
    try {
      const data = await apiFetch<{ items: { productId: string }[] }>("/api/wishlist");
      setWishlist(data.items.map((i) => i.productId));
    } catch (e) {
      // Not authenticated, use local storage
    } finally {
      setIsSyncing(false);
    }
  }

  async function addToWishlist(productId: string) {
    if (!wishlist.includes(productId)) {
      setWishlist([...wishlist, productId]);
      try {
        await apiFetch("/api/wishlist", {
          method: "POST",
          body: JSON.stringify({ productId }),
        });
      } catch (e) {
        // Offline or not authenticated
      }
    }
  }

  async function removeFromWishlist(productId: string) {
    setWishlist(wishlist.filter((id) => id !== productId));
    try {
      await apiFetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
    } catch (e) {
      // Offline or not authenticated
    }
  }

  async function toggleWishlist(productId: string) {
    if (wishlist.includes(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  }

  return {
    wishlist,
    isSyncing,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist: (productId: string) => wishlist.includes(productId),
  };
}