"use client";

import { useEffect, useState, useCallback } from "react";
import { BulkActionsBar } from "@/components/admin/bulk-actions-bar";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

type Promo = {
  id: string;
  type: string;
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkFormOpen, setBulkFormOpen] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const [promoData, settings] = await Promise.all([
      apiFetch<{ promos: Promo[] }>("/api/admin/promos"),
      apiFetch<{ config: { marketplacePromoEnabled: boolean } }>("/api/admin/settings"),
    ]);
    setPromos(promoData.promos);
    setPromoEnabled(settings.config.marketplacePromoEnabled);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleSection() {
    await apiFetch("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ marketplacePromoEnabled: !promoEnabled }),
    });
    setPromoEnabled(!promoEnabled);
    toast({
      title: promoEnabled ? "Promo section disabled" : "Promo section enabled",
      variant: "success",
    });
  }

  async function bulkCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const count = parseInt(form.get("count") as string, 10) || 1;
    const type = form.get("type") as string;
    const items = Array.from({ length: count }, (_, i) => ({
      type,
      title: `${form.get("title") || "Promo"} ${i + 1}`,
      subtitle: (form.get("subtitle") as string) || null,
      linkUrl: (form.get("linkUrl") as string) || null,
      productId: (form.get("productId") as string) || null,
      sortOrder: i,
      active: true,
    }));

    const res = await apiFetch<{ success: number; failed: number }>(
      "/api/admin/bulk",
      {
        method: "PATCH",
        body: JSON.stringify({ entity: "promos", action: "create", items }),
      }
    );

    toast({
      title: res.success > 0 ? "Promos created" : "Failed",
      description: `${res.success} created${res.failed > 0 ? `, ${res.failed} failed` : ""}`,
      variant: res.failed > 0 ? "error" : "success",
    });

    setBulkFormOpen(false);
    (e.target as HTMLFormElement).reset();
    load();
  }

  async function bulkToggle() {
    const res = await apiFetch<{ success: number }>("/api/admin/bulk", {
      method: "PATCH",
      body: JSON.stringify({
        entity: "promos",
        action: "toggle_active",
        ids: Array.from(selectedIds),
      }),
    });
    setSelectedIds(new Set());
    load();
    toast({
      title: `${res.success} promos updated`,
      variant: "success",
    });
  }

  function toggleSelection(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function deletePromo(id: string) {
    return apiFetch(`/api/admin/promos/${id}`, { method: "DELETE" }).then(() => load());
  }

  return (
    <div className="space-y-6">
      <Card>
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

      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Promos ({promos.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setBulkFormOpen(!bulkFormOpen)} className="h-9">
          + Bulk Create
        </Button>
      </div>

      {bulkFormOpen && (
        <Card>
          <CardContent>
            <form onSubmit={bulkCreate} className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs font-medium">Type</Label>
                  <select name="type" className="flex h-10 w-full rounded-xl border bg-background px-3 text-sm">
                    <option value="BANNER">Banner</option>
                    <option value="OFFER">Offer</option>
                    <option value="MOST_SOLD">Most Sold</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Title Prefix</Label>
                  <Input name="title" placeholder="e.g. Summer Sale" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Count</Label>
                  <Input name="count" type="number" min={1} max={20} defaultValue={1} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Subtitle</Label>
                  <Input name="subtitle" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Link URL</Label>
                  <Input name="linkUrl" placeholder="/products/..." />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Create</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setBulkFormOpen(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <BulkActionsBar<Promo>
        items={promos}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        entity="promos"
        onActionComplete={load}
        actions={["delete", "toggle_active"]}
      />

      <div className="space-y-2">
        {promos.map((p) => (
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
            <div className="flex-1 min-w-[180px]">
              <p className="font-medium text-sm">
                [{p.type}] {p.title}
                {!p.active && " (inactive)"}
              </p>
              <p className="text-xs text-muted-foreground">
                {p.subtitle}
                {p.product && ` · Product: ${p.product.name}`}
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
                  apiFetch(`/api/admin/promos/${p.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ active: !p.active }),
                  }).then(() => {
                    load();
                    toast({
                      title: p.active ? "Promo disabled" : "Promo enabled",
                      variant: "success",
                    });
                  });
                }}
                className="h-8 text-xs"
              >
                {p.active ? "Disable" : "Enable"}
              </Button>
<Button
                 size="sm"
                 variant="destructive"
                 onClick={async () => {
                   if (!confirm("Delete promo?")) return;
                   await deletePromo(p.id);
                   toast({ title: "Promo deleted", variant: "success" });
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
