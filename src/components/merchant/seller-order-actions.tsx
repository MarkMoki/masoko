"use client";

import { SellerOrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { canTransitionSellerOrder } from "@/lib/seller-order-status";

const ACTIONS: { status: SellerOrderStatus; label: string; variant?: "default" | "outline" | "destructive" }[] = [
  { status: SellerOrderStatus.PROCESSING, label: "Processing", variant: "outline" },
  { status: SellerOrderStatus.READY, label: "Ready", variant: "outline" },
  { status: SellerOrderStatus.DELIVERED, label: "Delivered" },
  { status: SellerOrderStatus.CANCELLED, label: "Cancel", variant: "destructive" },
];

export function SellerOrderActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: SellerOrderStatus;
}) {
  const router = useRouter();

  async function updateStatus(status: SellerOrderStatus) {
    if (!confirm(`Update order to ${status.replace(/_/g, " ")}?`)) return;
    await apiFetch(`/api/seller-orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  const available = ACTIONS.filter((a) =>
    canTransitionSellerOrder(currentStatus, a.status)
  );

  if (available.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {available.map((a) => (
        <Button
          key={a.status}
          size="sm"
          variant={a.variant ?? "default"}
          onClick={() => updateStatus(a.status)}
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}
