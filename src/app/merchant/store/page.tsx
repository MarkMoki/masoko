"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Store = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function MerchantStorePage() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data) => {
        const mine = data.stores?.find?.(
          (s: Store & { sellerId?: string }) => true
        );
        // Seller sees all stores from GET - filter via me endpoint pattern
        fetch("/api/auth/me")
          .then((r) => r.json())
          .then(async (me) => {
            const all = await fetch("/api/stores").then((r) => r.json());
            const myStore = all.stores?.find(
              (s: { seller: { id: string } }) => s.seller?.id === me.user?.id
            );
            setStore(myStore ?? null);
            setLoading(false);
          });
      })
      .catch(() => setLoading(false));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      address: (form.get("address") as string) || undefined,
    };

    try {
      if (store) {
        await apiFetch(`/api/stores/${store.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Store updated",
          description: "Your store information has been saved.",
          variant: "success",
        });
      } else {
        await apiFetch("/api/stores", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Store created",
          description: "Your store has been created successfully.",
          variant: "success",
        });
      }
      router.refresh();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not save store",
        variant: "error",
      });
    }
  }

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{store ? "Edit store" : "Create store"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Store name</Label>
              <Input id="name" name="name" defaultValue={store?.name} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={store?.description ?? ""} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={store?.address ?? ""} />
            </div>
            <Button type="submit">Save</Button>
            {store && (
              <Button type="button" variant="outline" asChild className="ml-2">
                <a href="/merchant/map">Set location on map</a>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
