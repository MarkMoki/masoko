"use client";

import { useEffect, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

type Seller = {
  id: string;
  name: string;
  email: string;
  store: { name: string } | null;
  _count: { products: number };
};

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const data = await apiFetch<{ sellers: Seller[] }>("/api/admin/sellers");
    setSellers(data.sellers);
  }

  useEffect(() => {
    load();
  }, []);

  async function createSeller(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await apiFetch("/api/admin/sellers", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        phone: form.get("phone"),
      }),
    });
    setShowForm(false);
    load();
  }

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-xl font-semibold">Sellers</h2>
        <Button onClick={() => setShowForm(!showForm)}>Create seller</Button>
      </div>

      {showForm && (
        <Card className="mb-6 max-w-md">
          <CardHeader>
            <CardTitle>New seller account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createSeller} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input name="name" required />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" required />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" />
              </div>
              <div>
                <Label>Password</Label>
                <Input name="password" type="password" minLength={6} required />
              </div>
              <Button type="submit">Create seller</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          {sellers.length === 0 ? (
            <p className="text-muted-foreground">No sellers yet</p>
          ) : (
            <ul className="space-y-3">
              {sellers.map((s) => (
                <li key={s.id} className="border-b pb-2 text-sm last:border-0">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-muted-foreground">{s.email}</p>
                  <p>
                    {s.store?.name ?? "No store"} · {s._count.products} products
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
