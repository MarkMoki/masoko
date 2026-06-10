"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { BulkActionsBar } from "@/components/admin/bulk-actions-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const load = useCallback(async () => {
    const data = await apiFetch<{ sellers: Seller[] }>("/api/admin/sellers");
    setSellers(data.sellers);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    toast({
      title: "Seller created",
      description: "New seller account has been created.",
      variant: "success",
    });
  }

  async function bulkDelete() {
    const res = await apiFetch<{ success: number; failed: number }>(
      "/api/admin/bulk",
      {
        method: "PATCH",
        body: JSON.stringify({
          entity: "sellers",
          action: "delete",
          ids: Array.from(selectedIds),
        }),
      }
    );
    setSelectedIds(new Set());
    load();
    toast({
      title: `${res.success} sellers deleted`,
      variant: "success",
    });
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
        <h2 className="text-xl font-semibold">Sellers ({sellers.length})</h2>
        <Button onClick={() => setShowForm(!showForm)} className="h-10">
          {showForm ? "Cancel" : "+ Create Seller"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 max-w-md">
          <CardContent>
            <form onSubmit={createSeller} className="space-y-4 pt-4">
              <div>
                <Label>Name</Label>
                <Input name="name" required className="mt-1.5" />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" required className="mt-1.5" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" className="mt-1.5" />
              </div>
              <div>
                <Label>Password</Label>
                <Input name="password" type="password" minLength={6} required className="mt-1.5" />
              </div>
              <Button type="submit" className="w-full h-11">Create Seller</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <BulkActionsBar<Seller>
        items={sellers}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        entity="sellers"
        onActionComplete={load}
        actions={["delete"]}
      />

      <Card>
        <CardContent className="p-4">
          {sellers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No sellers yet</p>
          ) : (
            <div className="space-y-2">
              {sellers.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(s.id)}
                    onChange={() => toggleSelection(s.id)}
                    className="h-4 w-4 rounded border-primary"
                  />
                  <div className="flex-1 min-w-[160px]">
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.store?.name ?? "No store"} · {s._count.products} products
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm(`Delete seller "${s.name}"? This will also delete their store and products.`)) return;
                      await apiFetch(`/api/admin/bulk`, {
                        method: "PATCH",
                        body: JSON.stringify({
                          entity: "sellers",
                          action: "delete",
                          ids: [s.id],
                        }),
                      });
                      load();
                      toast({
                        title: "Seller deleted",
                        description: `${s.name} and their data have been removed.`,
                        variant: "success",
                      });
                    }}
                    className="h-8 text-xs"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
