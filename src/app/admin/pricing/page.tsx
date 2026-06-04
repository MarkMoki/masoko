"use client";

import { useEffect, useState, FormEvent } from "react";
import { PricingModel } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

type PricingConfig = {
  defaultModel: PricingModel;
  subscriptionMonthly: number;
  payAsYouGoFlatFee: number;
  payAsYouGoPercent: number;
  description: string | null;
};

type SellerPlan = {
  id: string;
  sellerId: string;
  model: PricingModel;
  monthlyFee: number | null;
  perOrderFee: number | null;
  feePercent: number | null;
  notes: string | null;
  seller: { id: string; name: string; email: string };
};

type Seller = { id: string; name: string; email: string };

export default function AdminPricingPage() {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [plans, setPlans] = useState<SellerPlan[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  async function load() {
    const [pricing, sellersData] = await Promise.all([
      apiFetch<{ config: PricingConfig; plans: SellerPlan[] }>("/api/admin/pricing"),
      apiFetch<{ sellers: Seller[] }>("/api/admin/sellers"),
    ]);
    setConfig(pricing.config);
    setPlans(pricing.plans);
    setSellers(sellersData.sellers);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveConfig(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await apiFetch("/api/admin/pricing", {
      method: "PATCH",
      body: JSON.stringify({
        config: {
          defaultModel: form.get("defaultModel"),
          subscriptionMonthly: parseFloat(form.get("subscriptionMonthly") as string),
          payAsYouGoFlatFee: parseFloat(form.get("payAsYouGoFlatFee") as string),
          payAsYouGoPercent: parseFloat(form.get("payAsYouGoPercent") as string),
          description: form.get("description"),
        },
      }),
    });
    load();
  }

  async function savePlan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await apiFetch("/api/admin/pricing", {
      method: "PATCH",
      body: JSON.stringify({
        plan: {
          sellerId: form.get("sellerId"),
          model: form.get("model"),
          monthlyFee: parseFloat(form.get("monthlyFee") as string) || undefined,
          perOrderFee: parseFloat(form.get("perOrderFee") as string) || undefined,
          feePercent: parseFloat(form.get("feePercent") as string) || undefined,
          notes: form.get("notes"),
        },
      }),
    });
    load();
  }

  if (!config) return <p>Loading...</p>;

  return (
    <div className="space-y-8">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Default seller pricing model</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveConfig} className="space-y-4">
            <div>
              <Label>Default model</Label>
              <select
                name="defaultModel"
                defaultValue={config.defaultModel}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="SUBSCRIPTION">Subscription (monthly)</option>
                <option value="PAY_AS_YOU_GO">Pay as you go (per order)</option>
              </select>
            </div>
            <div>
              <Label>Subscription monthly fee (KES)</Label>
              <Input
                name="subscriptionMonthly"
                type="number"
                defaultValue={config.subscriptionMonthly}
              />
            </div>
            <div>
              <Label>Pay-as-you-go flat fee per order (KES)</Label>
              <Input
                name="payAsYouGoFlatFee"
                type="number"
                defaultValue={config.payAsYouGoFlatFee}
              />
            </div>
            <div>
              <Label>Pay-as-you-go % of order value</Label>
              <Input
                name="payAsYouGoPercent"
                type="number"
                step="0.1"
                defaultValue={config.payAsYouGoPercent}
              />
            </div>
            <div>
              <Label>Description (shown to sellers)</Label>
              <Input name="description" defaultValue={config.description ?? ""} />
            </div>
            <Button type="submit">Save defaults</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Assign plan to seller</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePlan} className="space-y-4">
            <div>
              <Label>Seller</Label>
              <select
                name="sellerId"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select seller</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Model</Label>
              <select
                name="model"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="SUBSCRIPTION">Subscription</option>
                <option value="PAY_AS_YOU_GO">Pay as you go</option>
              </select>
            </div>
            <div>
              <Label>Custom monthly fee (optional)</Label>
              <Input name="monthlyFee" type="number" />
            </div>
            <div>
              <Label>Custom per-order fee (optional)</Label>
              <Input name="perOrderFee" type="number" />
            </div>
            <div>
              <Label>Custom fee % (optional)</Label>
              <Input name="feePercent" type="number" step="0.1" />
            </div>
            <div>
              <Label>Notes</Label>
              <Input name="notes" />
            </div>
            <Button type="submit">Save seller plan</Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 font-semibold">Seller plans</h3>
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom plans yet — defaults apply.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {plans.map((p) => (
              <li key={p.id} className="rounded border p-3">
                <p className="font-medium">{p.seller.name}</p>
                <p className="text-muted-foreground">
                  {p.model.replace(/_/g, " ")}
                  {p.monthlyFee != null && ` · KES ${p.monthlyFee}/mo`}
                  {p.perOrderFee != null && ` · KES ${p.perOrderFee}/order`}
                  {p.feePercent != null && ` · ${p.feePercent}%`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
