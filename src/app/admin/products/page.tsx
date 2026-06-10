"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BulkActionsBar } from "@/components/admin/bulk-actions-bar";
import { Upload, Power, Trash2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  imageUrl: string | null;
  categoryId?: string | null;
  sellerId: string;
  seller?: { name: string };
};

type Category = { id: string; name: string };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
  const { toast } = useToast();

  const loadProducts = useCallback(
    async (q?: string) => {
      const url = q
        ? `/api/products?q=${encodeURIComponent(q)}&limit=500`
        : "/api/products?limit=500";
      const data = await apiFetch<{ products: Product[] }>(url);
      setProducts(data.products);
    },
    []
  );

  const loadCategories = useCallback(async () => {
    try {
      const data = await apiFetch<{ categories: Category[] }>(
        "/api/categories?limit=200"
      );
      setCategories(data.categories);
    } catch {
      // optional
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

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
        active: (form.get("active") as string) === "on",
        imageUrl,
        categoryId: form.get("categoryId") || undefined,
      }),
    });
    setEditing(null);
    setImageUrl(null);
    loadProducts(search);
    toast({
      title: "Product updated",
      description: `${editing.name} has been updated`,
      variant: "success",
    });
  }

  async function toggleActive(id: string) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    await apiFetch(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !product.active }),
    });
    loadProducts(search);
    toast({
      title: product.active ? "Product deactivated" : "Product activated",
      variant: "success",
    });
  }

  async function bulkCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const count = parseInt(form.get("count") as string, 10) || 1;
    const price = parseFloat(form.get("price") as string) || 0;
    const stock = parseInt(form.get("stock") as string, 10) || 0;
    const namePrefix = (form.get("namePrefix") as string) || "New Product";
    const active = (form.get("active") as string) === "on";
    const categoryId = form.get("categoryId") as string | null;

    const items = Array.from({ length: count }, (_, i) => ({
      name: `${namePrefix} ${i + 1}`,
      price,
      stock,
      active,
      categoryId: categoryId || undefined,
      sellerId: "",
      storeId: "",
    }));

    const res = await apiFetch<{ success: number; failed: number }>(
      "/api/admin/bulk",
      {
        method: "PATCH",
        body: JSON.stringify({
          entity: "products",
          action: "create",
          items,
        }),
      }
    );

    toast({
      title: res.success > 0 ? "Products created" : "Creation failed",
      description: `${res.success} created${res.failed > 0 ? `, ${res.failed} failed` : ""}`,
      variant: res.failed > 0 ? "error" : "success",
    });

    setBulkCreateOpen(false);
    (e.target as HTMLFormElement).reset();
    loadProducts(search);
  }

  function toggleSelection(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Products ({products.length})</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-40 md:w-56"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBulkCreateOpen(!bulkCreateOpen)}
            className="h-10"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Bulk Create
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditing({
                id: "",
                name: "",
                price: 0,
                stock: 0,
                active: true,
                imageUrl: null,
                sellerId: "",
                seller: undefined,
              });
              setImageUrl(null);
            }}
            className="h-10"
          >
            + Add
          </Button>
        </div>
      </div>

      {bulkCreateOpen && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Bulk Create Products</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={bulkCreate} className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs font-medium">Name Prefix</Label>
                  <Input name="namePrefix" placeholder="e.g. Premium" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Count</Label>
                  <Input name="count" type="number" min={1} max={50} defaultValue={1} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Price (KES)</Label>
                  <Input name="price" type="number" step="0.01" defaultValue={0} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Stock</Label>
                  <Input name="stock" type="number" defaultValue={0} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Category</Label>
                  <Select name="categoryId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="active" defaultChecked /> Active
                </label>
                <Button type="submit" size="sm">Create</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setBulkCreateOpen(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {editing && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">
              {editing.id ? `Edit: ${editing.name}` : "New Product"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveEdit} className="space-y-4">
              <ImageUpload
                folder="products"
                value={imageUrl ?? editing.imageUrl}
                onChange={setImageUrl}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input name="name" defaultValue={editing.name} required />
                </div>
                <div>
                  <Label>Price (KES)</Label>
                  <Input name="price" type="number" step="0.01" defaultValue={editing.price} />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input name="stock" type="number" defaultValue={editing.stock} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select name="categoryId" defaultValue={editing.categoryId ?? ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="active" defaultChecked={editing.active} />
                    Active (visible)
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <BulkActionsBar<Product>
        items={products}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        entity="products"
        onActionComplete={() => loadProducts(search)}
        actions={["delete", "toggle_active"]}
      />

      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
          >
            <input
              type="checkbox"
              checked={selectedIds.has(p.id)}
              onChange={() => toggleSelection(p.id)}
              className="h-4 w-4 rounded border-primary"
            />
            <div className="flex-1 min-w-[160px]">
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.seller?.name ?? "Unknown"} · {formatCurrency(p.price)} · Stock: {p.stock}
              </p>
            </div>
            <Badge variant={p.active ? "success" : "destructive"} className="text-[11px]">
              {p.active ? "Active" : "Inactive"}
            </Badge>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(p);
                  setImageUrl(p.imageUrl);
                }}
                className="h-8 text-xs"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleActive(p.id)}
                className="h-8 text-xs"
                aria-label="Toggle active"
              >
                <Power className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
                  await apiFetch(`/api/products/${p.id}`, { method: "DELETE" });
                  loadProducts(search);
                  toast({
                    title: "Deleted",
                    description: `${p.name} removed`,
                    variant: "success",
                  });
                }}
                className="h-8 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
