"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
      <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-8" />
    </div>
  );
}