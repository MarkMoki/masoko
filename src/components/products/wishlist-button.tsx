"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  isInWishlist: boolean;
  onToggle: (productId: string) => void;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({
  productId,
  isInWishlist,
  onToggle,
  size = "md",
}: WishlistButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(productId);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors",
        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
        isInWishlist
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-foreground",
        sizeClasses[size]
      )}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn("transition-all", isInWishlist && "fill-current")}
        style={{ width: size === "sm" ? 16 : size === "lg" ? 24 : 20, height: size === "sm" ? 16 : size === "lg" ? 24 : 20 }}
      />
    </button>
  );
}