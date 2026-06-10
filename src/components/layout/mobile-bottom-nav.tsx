"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Heart, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/use-session";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/cart", icon: ShoppingCart, label: "Cart", badge: true },
  { href: "/wishlist", icon: Heart, label: "Wishlist" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/account", icon: User, label: "Account" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const session = useSession();

  if (pathname.startsWith("/admin") || pathname.startsWith("/merchant")) {
    return null;
  }

  const activeHref = navItems.find((item) => {
    if (item.href === "/" || item.href === "/cart" || item.href === "/wishlist") {
      return pathname === item.href || pathname.startsWith(item.href + "/");
    }
    return pathname.startsWith(item.href);
  })?.href;

  function isActive(itemHref: string) {
    return pathname === itemHref || pathname.startsWith(itemHref + "/");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[40] border-t bg-background/95 backdrop-blur-md md:hidden safe-bottom" role="navigation" aria-label="Mobile navigation">
      <div className="flex h-14 md:h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-w-[56px] transition-all duration-200 min-h-[44px]",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
                {item.badge && session && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[8px] font-bold leading-none border-2 border-background"
                  >
                    0
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
