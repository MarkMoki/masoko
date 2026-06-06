"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, FileText, Search, Heart, Star } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 rounded-full bg-muted p-6">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mb-6 text-sm text-muted-foreground max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}

export function EmptyProductsState({ searchQuery }: { searchQuery?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-10 w-10 text-muted-foreground" />}
      title={searchQuery ? "No products found" : "No products available"}
      description={
        searchQuery
          ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search or filters.`
          : "There are no products in the marketplace yet. Check back later!"
      }
      actionLabel="Browse all products"
      actionHref="/"
    />
  );
}

export function EmptyCartState() {
  return (
    <EmptyState
      icon={<ShoppingCart className="h-10 w-10 text-muted-foreground" />}
      title="Your cart is empty"
      description="Looks like you haven't added anything to your cart yet. Start shopping to fill it up!"
      actionLabel="Browse marketplace"
      actionHref="/"
    />
  );
}

export function EmptyOrdersState() {
  return (
    <EmptyState
      icon={<FileText className="h-10 w-10 text-muted-foreground" />}
      title="No orders yet"
      description="You haven't placed any orders. Start shopping to see your order history here."
      actionLabel="Shop now"
      actionHref="/"
    />
  );
}

export function EmptyWishlistState() {
  return (
    <EmptyState
      icon={<Heart className="h-10 w-10 text-muted-foreground" />}
      title="Your wishlist is empty"
      description="Save items you love to your wishlist so you can find them easily later."
      actionLabel="Discover products"
      actionHref="/"
    />
  );
}

export function EmptyStoreState() {
  return (
    <EmptyState
      icon={<Package className="h-10 w-10 text-muted-foreground" />}
      title="No products from this store"
      description="This store hasn't added any products yet. Check back later!"
      actionLabel="Browse other stores"
      actionHref="/"
    />
  );
}