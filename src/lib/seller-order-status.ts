import { SellerOrderStatus } from "@/lib/types";

const FLOW: Record<SellerOrderStatus, SellerOrderStatus[]> = {
  PENDING_PAYMENT: ["CANCELLED"],
  PAYMENT_SUBMITTED: ["CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["READY", "CANCELLED"],
  READY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransitionSellerOrder(
  from: SellerOrderStatus,
  to: SellerOrderStatus
) {
  return FLOW[from]?.includes(to) ?? false;
}

export const SELLER_STATUS_ACTIONS: {
  status: SellerOrderStatus;
  label: string;
}[] = [
  { status: SellerOrderStatus.PROCESSING, label: "Mark processing" },
  { status: SellerOrderStatus.READY, label: "Mark ready" },
  { status: SellerOrderStatus.DELIVERED, label: "Mark delivered" },
  { status: SellerOrderStatus.CANCELLED, label: "Cancel order" },
];
