"use client";

import { useEffect, useState, FormEvent } from "react";
import { PromoType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { apiFetch } from "@/lib/api";

type Promo = {
  id: string;
  type: PromoType;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  productId: string | null;
  sortOrder: number;
  active: boolean;
  product?: { id: string; name: string } | null;
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [promoEnabled, setPromoEnabled] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function load() {
    const [promoData, settings] = await Promise.all([
      apiFetch<{ promos: Promo[] }>("/api/admin/promos"),
      apiFetch<{ config: { marketplacePromoEnabled: boolean } }>("/api/admin/settings"),
    ]);
    setPromos(promoData.promos);
    setPromoEnabled(settings.config.marketplacePromoEnabled);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleSection() {
    await apiFetch("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ marketplacePromoEnabled: !promoEnabled }),
    });
    setPromoEnabled(!promoEnabled);
  }

  async function createPromo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await apiFetch("/api/admin/promos", {
      method: "POST",
      body: JSON.stringify({
        type: form.get("type"),
        title: form.get("title"),
        subtitle: form.get("subtitle") || undefined,
        imageUrl: imageUrl || undefined,
        linkUrl: form.get("linkUrl") || undefined,
        productId: form.get("productId") || undefined,
        sortOrder: parseInt(form.get("sortOrder") as string, 10) || 0,
        active: true,
      }),
    });
    setImageUrl(null);
    e.currentTarget.reset();
    load();
  }

  return (
    <div className="space-y-8">
      <Card className="max-w-xl">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">Marketplace promo section</p>
            <p className="text-sm text-muted-foreground">
              Banners, offers & most-sold row above products
            </p>
          </div>
          <Button variant={promoEnabled ? "default" : "outline"} onClick={toggleSection}>
            {promoEnabled ? "ON" : "OFF"}
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Add promo item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createPromo} className="space-y-4">
            <div>
              <Label>Type</Label>
              <select
                name="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="BANNER">Banner (hero advert)</option>
                <option value="OFFER">Special offer card</option>
                <option value="MOST_SOLD">Most sold (pin product)</option>
              </select>
            </div>
            <ImageUpload folder="products" value={imageUrl} onChange={setImageUrl} />
            <div>
              <Label>Title</Label>
              <Input name="title" required />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input name="subtitle" />
            </div>
            <div>
              <Label>Link URL (banners/offers)</Label>
              <Input name="linkUrl" placeholder="/products/..." />
            </div>
            <div>
              <Label>Product ID (for MOST_SOLD or offer link)</Label>
              <Input name="productId" placeholder="cuid..." />
            </div>
            <div>
              <Label>Sort order</Label>
              <Input name="sortOrder" type="number" defaultValue={0} />
            </div>
            <Button type="submit">Add promo</Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 font-semibold">Current promos</h3>
        <div className="space-y-2">
          {promos.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  [{p.type}] {p.title}
                  {!p.active && " (inactive)"}
                </p>
                <p className="text-muted-foreground">
                  {p.subtitle}
                  {p.product && ` · Product: ${p.product.name}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await apiFetch(`/api/admin/promos/${p.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ active: !p.active }),
                    });
                    load();
                  }}
                >
                  {p.active ? "Disable" : "Enable"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm("Delete promo?")) return;
                    await apiFetch(`/api/admin/promos/${p.id}`, { method: "DELETE" });
                    load();
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
