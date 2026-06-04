"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export function PaymentVerifyActions({ paymentId }: { paymentId: string }) {
  const router = useRouter();

  async function verify(approved: boolean) {
    await apiFetch(`/api/payments/${paymentId}/verify`, {
      method: "POST",
      body: JSON.stringify({ approved }),
    });
    router.refresh();
  }

  return (
    <div className="mt-2 flex gap-2">
      <Button size="sm" onClick={() => verify(true)}>
        Approve
      </Button>
      <Button size="sm" variant="destructive" onClick={() => verify(false)}>
        Reject
      </Button>
    </div>
  );
}
