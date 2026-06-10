"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };

export function MobileFilterDrawer({
  categories,
  minPrice = 0,
  maxPrice = 100000,
}: {
  categories: Category[];
  minPrice?: number;
  maxPrice?: number;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);
  const [sortBy, setSortBy] = useState("relevance");

  function toggleCategory(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function apply() {
  const params = new URLSearchParams();
  selected.forEach((c) => params.append("category", c));
  params.set("minPrice", String(priceMin));
  params.set("maxPrice", String(priceMax));
  params.set("sortBy", sortBy);
  params.delete("page");
  window.location.search = params.toString();
}

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent active:scale-95 transition-all min-h-[40px]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-background shadow-2xl animate-slide-up-mobile safe-bottom">
            <div className="sticky top-0 bg-background/95 backdrop-blur-md z-10 flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              <div>
                <h3 className="text-sm font-semibold mb-2.5">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        "px-3.5 py-2 text-sm rounded-xl border transition-all min-h-[40px]",
                        selected.includes(cat.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-input hover:border-primary/50 hover:bg-accent"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2.5">Price Range</h3>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    className="flex-1 h-11 rounded-xl border bg-background px-3 text-sm text-center"
                    min={minPrice}
                  />
                  <span className="text-muted-foreground">—</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="flex-1 h-11 rounded-xl border bg-background px-3 text-sm text-center"
                    min={minPrice}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2.5">Sort By</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "relevance", label: "Default" },
                    { value: "price-asc", label: "Price Low→High" },
                    { value: "price-desc", label: "Price High→Low" },
                    { value: "newest", label: "Newest" },
                    { value: "popular", label: "Most Popular" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={cn(
                        "px-4 py-2.5 text-sm rounded-xl border transition-all min-h-[40px]",
                        sortBy === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-input hover:border-primary/50 hover:bg-accent"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 pb-4">
                <button
                  onClick={() => {
                    setSelected([]);
                    setPriceMin(minPrice);
                    setPriceMax(maxPrice);
                    setSortBy("relevance");
                  }}
                  className="flex-1 h-12 rounded-xl border text-sm font-medium hover:bg-accent transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    apply();
                    setOpen(false);
                  }}
                  className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
