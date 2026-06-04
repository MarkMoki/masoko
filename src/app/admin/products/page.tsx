"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  imageUrl: string | null;
  seller?: { name: string };
  sellerId?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function load() {
    const data = await apiFetch<{ products: Product[] }>(
      "/api/products?limit=200"
    );
    setProducts(data.products);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = new FormData(e.currentTarget);
    await apiFetch(`/api/products/${editing.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: form.get("name"),
        price: parseFloat(form.get("price") as string),
        stock: parseInt(form.get("stock") as string, 10),
        active: form.get("active") === "on",
        imageUrl,
      }),
    });
    setEditing(null);
    load();
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">All products</h2>

      {editing && (
        <Card className="mb-6 max-w-lg">
          <CardHeader>
            <CardTitle>Edit {editing.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveEdit} className="space-y-4">
              <ImageUpload
                folder="products"
                value={imageUrl ?? editing.imageUrl}
                onChange={setImageUrl}
              />
              <div>
                <Label>Name</Label>
                <Input name="name" defaultValue={editing.name} required />
              </div>
              <div>
                <Label>Price</Label>
                <Input name="price" type="number" step="0.01" defaultValue={editing.price} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input name="stock" type="number" defaultValue={editing.stock} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={editing.active} />
                Active
              </label>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm"
          >
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-muted-foreground">
                {p.seller?.name ?? "Unknown"} · {formatCurrency(p.price)} · Stock {p.stock}
                {!p.active && " · Inactive"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(p);
                  setImageUrl(p.imageUrl);
                }}
              >
                Edit
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/products/${p.id}`}>View</Link>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  if (!confirm("Delete product?")) return;
                  await apiFetch(`/api/products/${p.id}`, { method: "DELETE" });
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
  );
}
