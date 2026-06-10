"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { notifyCartUpdated } from "@/components/layout/cart-badge";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/ui/star-rating";
import {
  ChevronLeft,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  MessageSquare,
} from "lucide-react";

type ProductDetail = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: { name: string } | null;
  store: { id: string; name: string } | null;
  seller: { name: string };
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: { name: string };
};

export function ProductDetailView({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { toast } = useToast();
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.());
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadReviews() {
    try {
      const data = await apiFetch<{ reviews: Review[]; averageRating: number; reviewCount: number }>(
        `/api/reviews?productId=${product.id}`
      );
      setReviews(data.reviews);
      setAverageRating(data.averageRating || 0);
      setReviewCount(data.reviewCount || 0);
    } catch (e) {
      // Failed to load reviews
    }
  }

  async function submitReview() {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment is required",
        variant: "error",
      });
      return;
    }
    setSubmittingReview(true);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          comment: newComment,
        }),
      });
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
        variant: "success",
      });
      setNewComment("");
      loadReviews();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to submit review";
      toast({
        title: "Error",
        description: message,
        variant: "error",
      });
    } finally {
      setSubmittingReview(false);
    }
  }

  async function addToCart() {
    setLoading(true);
    try {
      await apiFetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      notifyCartUpdated();
      toast({
        title: "Added to cart",
        description: `${product.name} added to your cart`,
        variant: "success",
      });
      if (isNative) {
        window.location.href = "/cart";
      } else {
        router.push("/cart");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Please login as a customer";
      toast({
        title: "Error",
        description: message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-5xl px-3.5 md:px-4 lg:px-6 py-4 md:py-6 pb-24 md:pb-8">
      <Link
        href="/"
        className="mb-4 md:mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors min-h-[40px]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </Link>

      <div className="grid gap-5 md:gap-8 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] md:aspect-square overflow-hidden rounded-2xl bg-muted shadow-sm">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <svg className="h-12 w-12 md:h-16 md:w-16 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span className="text-xs md:text-sm">No image available</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20 space-y-4 md:space-y-5">
            {product.category && (
              <Badge variant="secondary" className="text-xs">{product.category.name}</Badge>
            )}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">{product.name}</h1>

            {product.store && (
              <Link
                href={`/stores/${product.store.id}`}
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Store className="h-4 w-4" />
                {product.store.name}
              </Link>
            )}

            <p className="text-2xl md:text-3xl font-bold text-primary">{formatCurrency(product.price)}</p>

            <div className="flex flex-wrap gap-2 text-xs md:text-sm">
              <Badge variant={inStock ? "success" : "destructive"}>
                {inStock ? `${product.stock} in stock` : "Out of stock"}
              </Badge>
              <span className="text-muted-foreground">Sold by {product.seller.name}</span>
            </div>

            {averageRating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} readOnly />
                <span className="text-xs md:text-sm text-muted-foreground">
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {product.description && (
              <div className="rounded-xl border bg-muted/30 p-3 md:p-4">
                <h2 className="mb-2 text-xs md:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base text-foreground/90">{product.description}</p>
              </div>
            )}

            {inStock && (
              <div className="rounded-xl border bg-card p-3 md:p-4 shadow-sm">
                <p className="mb-2.5 text-xs md:text-sm font-medium">Quantity</p>
                <div className="mb-3 flex items-center gap-2.5 md:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="h-9 w-9 min-[375px]:h-10 min-[375px]:w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-sm md:text-base">{qty}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    disabled={qty >= product.stock}
                    className="h-9 w-9 min-[375px]:h-10 min-[375px]:w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="w-full gap-2 h-12 mobile-btn-lg"
                  size="lg"
                  onClick={addToCart}
                  loading={loading}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to cart — {formatCurrency(product.price * qty)}
                </Button>
                <p className="mt-2 text-center text-[11px] md:text-xs text-muted-foreground">
                  Subtotal: {formatCurrency(product.price * qty)}
                </p>
              </div>
            )}

            {product.store && (
              <Button asChild variant="outline" className="w-full gap-2 h-11 mobile-btn">
                <Link href="/map">
                  <MapPin className="h-4 w-4" />
                  Find store on map
                </Link>
              </Button>
            )}

            <div className="border-t pt-5 md:pt-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <MessageSquare className="h-5 w-5" />
                Reviews
              </h2>

              <div className="mb-4 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Your Rating</p>
                  <StarRating rating={newRating} onRatingChange={setNewRating} />
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your review..."
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm md:text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  rows={3}
                />
                <Button
                  size="sm"
                  onClick={submitReview}
                  loading={submittingReview}
                  disabled={!newComment.trim()}
                  className="h-10 mobile-btn-sm"
                >
                  Submit Review
                </Button>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} readOnly size="sm" />
                        <span className="text-sm font-medium">
                          {review.user?.name || "Anonymous"}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}