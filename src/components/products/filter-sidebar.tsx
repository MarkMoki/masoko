"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

type Category = { id: string; name: string };

interface FilterSidebarProps {
  categories: Category[];
  minPrice?: number;
  maxPrice?: number;
}

export function FilterSidebar({
  categories,
  minPrice = 0,
  maxPrice = 100000,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll("category")
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get("minPrice") || String(minPrice)),
    parseInt(searchParams.get("maxPrice") || String(maxPrice)),
  ]);
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "relevance"
  );

  useEffect(() => {
    const cats = searchParams.getAll("category");
    setSelectedCategories(cats);
    setPriceRange([
      parseInt(searchParams.get("minPrice") || String(minPrice)),
      parseInt(searchParams.get("maxPrice") || String(maxPrice)),
    ]);
    setSortBy(searchParams.get("sortBy") || "relevance");
  }, [searchParams, minPrice, maxPrice]);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    selectedCategories.forEach((c) => params.append("category", c));
    params.set("minPrice", String(priceRange[0]));
    params.set("maxPrice", String(priceRange[1]));
    params.set("sortBy", sortBy);
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams();
    params.set("q", searchParams.get("q") || "");
    const query = searchParams.get("q");
    router.push(query ? `/?q=${encodeURIComponent(query)}` : "/");
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    priceRange[0] > minPrice ||
    priceRange[1] < maxPrice ||
    sortBy !== "relevance";

  return (
    <aside className="w-full space-y-4 md:w-64 md:space-y-6 hidden md:block">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div>
        <h3 className="mb-2 md:mb-3 text-sm font-medium">Categories</h3>
        <div className="space-y-1.5 md:space-y-2 max-h-48 md:max-h-60 overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`cat-${cat.id}`}
                checked={selectedCategories.includes(cat.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCategories([...selectedCategories, cat.id]);
                  } else {
                    setSelectedCategories(
                      selectedCategories.filter((c) => c !== cat.id)
                    );
                  }
                }}
                className="h-3.5 w-3.5 md:h-4 md:w-4 rounded border border-primary"
              />
              <Label htmlFor={`cat-${cat.id}`} className="text-xs md:text-sm cursor-pointer">
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="md:mt-6">
        <h3 className="mb-2 md:mb-3 text-sm font-medium">Price Range</h3>
        <div className="px-2 space-y-2">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={1000}
            value={priceRange[0]}
            onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
            className="w-full"
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={1000}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
          }).format(priceRange[0])}</span>
          <span>{new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
          }).format(priceRange[1])}</span>
        </div>
      </div>

      <div className="md:mt-6">
        <h3 className="mb-2 md:mb-3 text-sm font-medium">Sort By</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button className="mt-4 md:mt-6 w-full" onClick={applyFilters}>
        Apply Filters
      </Button>
    </aside>
  );
}