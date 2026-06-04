"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";

export function MarketplaceSearch({ defaultQuery }: { defaultQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(defaultQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 flex max-w-md gap-2">
      <Input
        placeholder="Search products..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Button type="submit">Search</Button>
    </form>
  );
}
