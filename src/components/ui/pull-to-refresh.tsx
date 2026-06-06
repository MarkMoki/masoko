"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const triggered = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleTouchStart(e: TouchEvent) {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (window.scrollY === 0 && startY.current) {
        const distance = e.touches[0].clientY - startY.current;
        if (distance > 0 && distance < threshold * 1.5) {
          e.preventDefault();
          setPullDistance(distance);
        }
      }
    }

    function handleTouchEnd() {
      if (pullDistance >= threshold && !triggered.current) {
        triggered.current = true;
        setIsRefreshing(true);
        onRefresh().finally(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          triggered.current = false;
        });
      } else {
        setPullDistance(0);
      }
      startY.current = 0;
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, threshold, onRefresh]);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex items-center justify-center transition-transform",
          isRefreshing && "animate-spin"
        )}
        style={{
          height: Math.min(pullDistance, threshold),
          opacity: Math.min(pullDistance / threshold, 1),
        }}
      >
        {(pullDistance >= threshold || isRefreshing) && <Spinner className="h-6 w-6 text-primary" />}
      </div>
      <div style={{ transform: `translateY(${Math.min(pullDistance * 0.5, threshold * 0.5)}px)` }}>
        {children}
      </div>
    </div>
  );
}