import {
  MasterOrderStatus,
  SellerOrderStatus,
} from "./types";
import { groupBy } from "./utils";
import {
  clearCartItems,
  createMasterOrder,
  createNotification,
  createPayment,
  createSellerOrder,
  createSellerOrderItem,
  decrementProductStock,
  enrichMasterOrder,
  getCartByCustomerId,
  getMasterOrderFull,
  getSellerOrderById,
  updateSellerOrder,
} from "./db";
import { recalculateMasterOrderStatus } from "./order-status";

export async function checkoutCart(customerId: string) {
  const cart = await getCartByCustomerId(customerId);

  if (!cart || !cart.items?.length) {
    throw new Error("Cart is empty");
  }

  for (const item of cart.items) {
    if (!item.product?.active) {
      throw new Error(`Product "${item.product?.name}" is unavailable`);
    }
    if ((item.product?.stock ?? 0) < item.quantity) {
      throw new Error(`Insufficient stock for "${item.product?.name}"`);
    }
  }

  const grouped = groupBy(cart.items, (item) => item.product!.sellerId);
  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.product!.price * item.quantity,
    0
  );

  const master = await createMasterOrder({
    customerId,
    totalAmount,
    status: MasterOrderStatus.PENDING_PAYMENT,
  });

  for (const [sellerId, items] of Object.entries(grouped)) {
    const subtotal = items.reduce(
      (sum, item) => sum + item.product!.price * item.quantity,
      0
    );

    const sellerOrder = await createSellerOrder({
      masterOrderId: master.id,
      sellerId,
      subtotal,
      status: SellerOrderStatus.PENDING_PAYMENT,
    });

    for (const item of items) {
      await createSellerOrderItem({
        sellerOrderId: sellerOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product!.price,
      });
      await decrementProductStock(item.productId, item.quantity);
    }

    await createNotification({
      userId: sellerId,
      title: "New order",
      message: `You received order ${sellerOrder.id.slice(-6).toUpperCase()} — KES ${subtotal.toLocaleString()}`,
    });
  }

  await clearCartItems(cart.id);
  await recalculateMasterOrderStatus(master.id);

  return getMasterOrderFull(master.id);
}

export async function submitPayment(
  customerId: string,
  sellerOrderId: string,
  transactionCode: string,
  amount: number
) {
  const sellerOrder = await getSellerOrderById(sellerOrderId);
  const master = await enrichMasterOrder(
    await import("./db").then((m) =>
      m.getMasterOrderById(sellerOrder.masterOrderId)
    )
  );

  if (master.customerId !== customerId) {
    throw new Error("Unauthorized");
  }

  const payment = await createPayment({
    sellerOrderId,
    transactionCode: transactionCode.trim(),
    amount,
    status: "PENDING" as import("./types").PaymentStatus,
  });

  await updateSellerOrder(sellerOrderId, {
    status: SellerOrderStatus.PAYMENT_SUBMITTED,
  });

  await createNotification({
    userId: sellerOrder.sellerId,
    title: "Payment submitted",
    message: `Customer submitted code ${transactionCode} for KES ${amount}`,
  });

  await recalculateMasterOrderStatus(sellerOrder.masterOrderId);
  return payment;
}
