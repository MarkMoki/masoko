"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  readOnly = true,
  onRatingChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className="flex items-center gap-0.5" role={readOnly ? undefined : "radiogroup"}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        const isHalfFilled = !isFilled && starValue - 0.5 <= rating;

        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onRatingChange?.(starValue)}
            className={cn(
              "transition-colors",
              !readOnly && "cursor-pointer hover:text-yellow-400 focus:outline-none"
            )}
            aria-label={!readOnly ? `${starValue} stars` : undefined}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled || isHalfFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              )}
              style={isHalfFilled ? { clipPath: "inset(0 50% 0 0)" } : undefined}
            />
          </button>
        );
      })}
    </div>
  );
}

interface RatingDisplayProps {
  rating: number;
  count: number;
  size?: "sm" | "md" | "lg";
}

export function RatingDisplay({ rating, count, size = "md" }: RatingDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={rating} size={size} />
      <span className="text-sm text-muted-foreground">
        ({count} {count === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}