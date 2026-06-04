import {
  MasterOrderStatus,
  PaymentStatus,
  SellerOrderStatus,
} from "./types";
import {
  createNotification,
  getMasterOrderById,
  getPaymentById,
  getSellerOrderById,
  listSellerOrders,
  updateMasterOrder,
  updatePayment,
  updateSellerOrder,
} from "./db";

export async function recalculateMasterOrderStatus(masterOrderId: string) {
  const master = await getMasterOrderById(masterOrderId);
  const { documents: sellerOrders } = await listSellerOrders({
    masterOrderId,
  });

  if (sellerOrders.length === 0) return;

  const allCancelled = sellerOrders.every(
    (o) => o.status === SellerOrderStatus.CANCELLED
  );
  if (allCancelled) {
    await updateMasterOrder(masterOrderId, {
      status: MasterOrderStatus.CANCELLED,
    });
    return;
  }

  const active = sellerOrders.filter(
    (o) => o.status !== SellerOrderStatus.CANCELLED
  );

  const paidStatuses: SellerOrderStatus[] = [
    SellerOrderStatus.PAID,
    SellerOrderStatus.PROCESSING,
    SellerOrderStatus.READY,
    SellerOrderStatus.DELIVERED,
  ];
  const anyPaidStatuses: SellerOrderStatus[] = [
    ...paidStatuses,
    SellerOrderStatus.PAYMENT_SUBMITTED,
  ];
  const processingStatuses: SellerOrderStatus[] = [
    SellerOrderStatus.PROCESSING,
    SellerOrderStatus.READY,
  ];

  const allPaid = active.every((o) => paidStatuses.includes(o.status));
  const allDelivered = active.every(
    (o) => o.status === SellerOrderStatus.DELIVERED
  );
  const anyPaid = active.some((o) => anyPaidStatuses.includes(o.status));
  const anyProcessing = active.some((o) =>
    processingStatuses.includes(o.status)
  );

  let status: MasterOrderStatus = MasterOrderStatus.PENDING_PAYMENT;

  if (allDelivered) {
    status = MasterOrderStatus.COMPLETED;
  } else if (allPaid && anyProcessing) {
    status = MasterOrderStatus.PROCESSING;
  } else if (allPaid) {
    status = MasterOrderStatus.FULLY_PAID;
  } else if (anyPaid) {
    status = MasterOrderStatus.PARTIALLY_PAID;
  }

  await updateMasterOrder(masterOrderId, { status });
}

export async function onPaymentVerified(
  paymentId: string,
  approved: boolean
) {
  const payment = await getPaymentById(paymentId);
  const sellerOrder = await getSellerOrderById(payment.sellerOrderId);
  const master = await getMasterOrderById(sellerOrder.masterOrderId);

  if (approved) {
    await updatePayment(paymentId, {
      status: PaymentStatus.APPROVED,
      verifiedAt: new Date().toISOString(),
    });
    await updateSellerOrder(payment.sellerOrderId, {
      status: SellerOrderStatus.PAID,
    });
    await createNotification({
      userId: master.customerId,
      title: "Payment approved",
      message: `Your payment for order ${payment.sellerOrderId.slice(-6).toUpperCase()} was verified.`,
    });
  } else {
    await updatePayment(paymentId, { status: PaymentStatus.REJECTED });
    await updateSellerOrder(payment.sellerOrderId, {
      status: SellerOrderStatus.PENDING_PAYMENT,
    });
    await createNotification({
      userId: master.customerId,
      title: "Payment rejected",
      message: `Payment code was rejected. Please resubmit for seller order ${payment.sellerOrderId.slice(-6).toUpperCase()}.`,
    });
  }

  await recalculateMasterOrderStatus(sellerOrder.masterOrderId);
  return getPaymentById(paymentId);
}