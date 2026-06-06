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
  Package,
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
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
        <div className="lg:col-span-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted shadow-sm">
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
                <Package className="h-16 w-16 opacity-40" />
                <span>No image available</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-20 space-y-5">
            {product.category && (
              <Badge variant="secondary">{product.category.name}</Badge>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>

            {product.store && (
              <Link
                href={`/stores/${product.store.id}`}
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Store className="h-4 w-4" />
                {product.store.name}
              </Link>
            )}

            <p className="text-3xl font-bold text-primary">
              {formatCurrency(product.price)}
            </p>

            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant={inStock ? "success" : "destructive"}>
                {inStock ? `${product.stock} in stock` : "Out of stock"}
              </Badge>
              <span className="text-muted-foreground">Sold by {product.seller.name}</span>
            </div>

            {averageRating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} readOnly />
                <span className="text-sm text-muted-foreground">
                  ({reviewCount} reviews)
                </span>
              </div>
            )}

            {product.description && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {product.description}
                </p>
              </div>
            )}

            {inStock && (
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="mb-3 text-sm font-medium">Quantity</p>
                <div className="mb-4 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    disabled={qty >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={addToCart}
                  loading={loading}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to cart
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Subtotal: {formatCurrency(product.price * qty)}
                </p>
              </div>
            )}

            {product.store && (
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/map">
                  <MapPin className="h-4 w-4" />
                  Find store on map
                </Link>
              </Button>
            )}

            <div className="border-t pt-6">
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
                  placeholder="Write a review..."
                  className="w-full rounded-md border p-2 text-sm"
                  rows={3}
                />
                <Button
                  size="sm"
                  onClick={submitReview}
                  loading={submittingReview}
                  disabled={!newComment.trim()}
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