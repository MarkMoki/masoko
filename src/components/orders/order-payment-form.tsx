"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

export function OrderPaymentForm({
  sellerOrderId,
  amount,
}: {
  sellerOrderId: string;
  amount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await apiFetch("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          sellerOrderId,
          transactionCode: form.get("code"),
          amount,
        }),
      });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="flex-1">
        <Label htmlFor={`code-${sellerOrderId}`} className="sr-only">
          M-Pesa / payment code
        </Label>
        <Input
          id={`code-${sellerOrderId}`}
          name="code"
          placeholder="Enter payment reference code"
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        Submit
      </Button>
    </form>
  );
}
