"use client";

import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  imageUrl: string | null;
  sellerId: string;
};

export default function MerchantProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  async function load() {
    const [data, me] = await Promise.all([
      apiFetch<{ products: Product[] }>("/api/products?limit=100"),
      apiFetch<{ user: { id: string } }>("/api/auth/me"),
    ]);
    setProducts(data.products.filter((p) => p.sellerId === me.user.id));
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description"),
          price: parseFloat(form.get("price") as string),
          stock: parseInt(form.get("stock") as string, 10),
          imageUrl: imageUrl || undefined,
        }),
      });
      setShowForm(false);
      setImageUrl(null);
      load();
      toast({
        title: "Product created",
        description: "Your product has been added to the marketplace.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Creation failed",
        description: err instanceof Error ? err.message : "Could not create product",
        variant: "error",
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">My products</h1>
        <Button onClick={() => setShowForm(!showForm)}>Add product</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>New product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="space-y-4">
              <ImageUpload
                folder="products"
                value={imageUrl}
                onChange={setImageUrl}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input name="name" required />
                </div>
                <div>
                  <Label>Price (KES)</Label>
                  <Input name="price" type="number" step="0.01" required />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input name="stock" type="number" required />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Input name="description" />
                </div>
              </div>
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded border p-4">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(p.price)} · Stock: {p.stock}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/products/${p.id}/edit`}>Edit</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
