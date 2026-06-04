import { SellerOrderStatus } from "@/lib/types";

const FLOW: Record<SellerOrderStatus, SellerOrderStatus[]> = {
  PENDING_PAYMENT: [SellerOrderStatus.CANCELLED],
  PAYMENT_SUBMITTED: [SellerOrderStatus.CANCELLED],
  PAID: [SellerOrderStatus.PROCESSING, SellerOrderStatus.CANCELLED],
  PROCESSING: [SellerOrderStatus.READY, SellerOrderStatus.CANCELLED],
  READY: [SellerOrderStatus.DELIVERED, SellerOrderStatus.CANCELLED],
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
