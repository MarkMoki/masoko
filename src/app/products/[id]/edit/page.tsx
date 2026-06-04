"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { apiFetch } from "@/lib/api";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<{
    name: string;
    description: string | null;
    price: number;
    stock: number;
    active: boolean;
    imageUrl: string | null;
  } | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ product: NonNullable<typeof product> }>(`/api/products/${id}`).then(
      (d) => {
        setProduct(d.product);
        setImageUrl(d.product.imageUrl);
      }
    );
  }, [id]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await apiFetch(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description"),
        price: parseFloat(form.get("price") as string),
        stock: parseInt(form.get("stock") as string, 10),
        active: form.get("active") === "on",
        imageUrl,
      }),
    });
    router.push(`/products/${id}`);
    router.refresh();
  }

  if (!product) return <p className="p-8">Loading...</p>;

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <ImageUpload
              folder="products"
              value={imageUrl}
              onChange={setImageUrl}
            />
            <div>
              <Label>Name</Label>
              <Input name="name" defaultValue={product.name} required />
            </div>
            <div>
              <Label>Description</Label>
              <Input name="description" defaultValue={product.description ?? ""} />
            </div>
            <div>
              <Label>Price</Label>
              <Input
                name="price"
                type="number"
                step="0.01"
                defaultValue={product.price}
                required
              />
            </div>
            <div>
              <Label>Stock</Label>
              <Input name="stock" type="number" defaultValue={product.stock} required />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={product.active} />
              Active
            </label>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
