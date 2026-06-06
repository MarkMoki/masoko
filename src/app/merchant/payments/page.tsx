"use client";

import { useEffect, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Method = {
  id: string;
  type: string;
  accountName: string | null;
  accountNumber: string | null;
  instructions: string | null;
  isDefault: boolean;
};

export default function MerchantPaymentsPage() {
  const [methods, setMethods] = useState<Method[]>([]);
  const { toast } = useToast();

  async function load() {
    const data = await apiFetch<{ methods: Method[] }>("/api/payment-methods");
    setMethods(data.methods);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiFetch("/api/payment-methods", {
        method: "POST",
        body: JSON.stringify({
          type: form.get("type"),
          accountName: form.get("accountName"),
          accountNumber: form.get("accountNumber"),
          instructions: form.get("instructions"),
          isDefault: true,
        }),
      });
      e.currentTarget.reset();
      load();
      toast({
        title: "Payment method added",
        description: "Your payment method has been saved.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Failed to save",
        description: err instanceof Error ? err.message : "Could not save payment method",
        variant: "error",
      });
    }
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Payment methods</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add method</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Type (e.g. M-Pesa Till)</Label>
              <Input name="type" placeholder="M-Pesa Till" required />
            </div>
            <div>
              <Label>Account number / Till</Label>
              <Input name="accountNumber" required />
            </div>
            <div>
              <Label>Account name</Label>
              <Input name="accountName" />
            </div>
            <div>
              <Label>Instructions</Label>
              <Input name="instructions" placeholder="Pay then enter code on order page" />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {methods.map((m) => (
          <div key={m.id} className="rounded border p-4 text-sm">
            <p className="font-medium">{m.type}</p>
            <p>{m.accountNumber}</p>
            {m.isDefault && (
              <span className="text-xs text-primary">Default</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
