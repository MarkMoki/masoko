"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function MarketplaceSearch({ defaultQuery }: { defaultQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(defaultQuery);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentQ = params.get("q") || "";
    if (currentQ !== q) {
      setQ(currentQ);
    }
  }, [searchParams, q]);

  function updateSearch(query: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("q", query);
    else params.delete("q");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const debouncedSearch = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    setQ(value);
    if (debouncedSearch.current) clearTimeout(debouncedSearch.current);
    debouncedSearch.current = setTimeout(() => updateSearch(value), 300);
  }

  function clearSearch() {
    setQ("");
    updateSearch("");
  }

  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search products..."
        value={q}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10 pr-10"
        aria-label="Search products"
      />
      {q && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
          aria-label="Clear search"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
