"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function PaymentVerifyActions({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const { toast } = useToast();

  async function verify(approved: boolean) {
    await apiFetch(`/api/payments/${paymentId}/verify`, {
      method: "POST",
      body: JSON.stringify({ approved }),
    });
    toast({
      title: approved ? "Payment approved" : "Payment rejected",
      description: "The customer has been notified.",
      variant: approved ? "success" : "error",
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
