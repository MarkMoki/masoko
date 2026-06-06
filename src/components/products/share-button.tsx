"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  productId: string;
  productName: string;
  className?: string;
}

export function ShareButton({ productId, productName, className }: ShareButtonProps) {
  const { toast } = useToast();

  async function handleShare() {
    const url = `${window.location.origin}/products/${productId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} on Masoko!`,
          url,
        });
      } catch (e) {
        // User cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard",
          variant: "success",
        });
      } catch (e) {
        toast({
          title: "Share failed",
          description: "Could not copy link",
          variant: "error",
        });
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      className={className}
      aria-label="Share product"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}