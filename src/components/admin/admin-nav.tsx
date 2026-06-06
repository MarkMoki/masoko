"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Sellers" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/pricing", label: "Seller pricing" },
  { href: "/admin/promos", label: "Offers & promos" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b pb-4" aria-label="Admin navigation">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition",
            pathname === link.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          aria-current={pathname === link.href ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
      <Link
        href="/"
        className="ml-auto rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
      >
        Marketplace
      </Link>
    </nav>
  );
}
