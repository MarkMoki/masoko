"use client";

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

  // Hide on admin/merchant pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/merchant")) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex h-14 md:h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 md:px-3 py-1.5 md:py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1.5 -right-1.5 h-3.5 min-w-3.5 md:h-4 md:min-w-4 px-0.5 md:px-1 text-[8px] md:text-[10px]"
                  >
                    0
                  </Badge>
                )}
              </div>
              <span className="text-[9px] md:text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}