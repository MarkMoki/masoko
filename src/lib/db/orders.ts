import { Query } from "node-appwrite";
import {
  COLLECTIONS,
  createDocument,
  findOne,
  getDocument,
  listAllDocuments,
  listDocuments,
  updateDocument,
} from "./helpers";
import { getUserById } from "./users-stores";
import { enrichProduct, getProductById } from "./products";
import {
  MasterOrderStatus,
  PaymentStatus,
  SellerOrderStatus,
  type MasterOrder,
  type Payment,
  type PaymentMethod,
  type SellerOrder,
  type SellerOrderItem,
} from "../types";

type MasterOrderDoc = Omit<MasterOrder, "customer" | "sellerOrders">;
type SellerOrderDoc = Omit<
  SellerOrder,
  "items" | "payments" | "seller" | "masterOrder"
>;
type SellerOrderItemDoc = Omit<SellerOrderItem, "product">;
type PaymentDoc = Omit<Payment, "sellerOrder">;

export async function createMasterOrder(data: {
  customerId: string;
  totalAmount: number;
  status: MasterOrderStatus;
}) {
  return createDocument<MasterOrderDoc>(COLLECTIONS.masterOrders, data);
}

export async function updateMasterOrder(
  id: string,
  data: Partial<Pick<MasterOrderDoc, "status" | "totalAmount">>
) {
  return updateDocument<MasterOrderDoc>(COLLECTIONS.masterOrders, id, data);
}

export async function getMasterOrderById(id: string) {
  return getDocument<MasterOrderDoc>(COLLECTIONS.masterOrders, id);
}

export async function listMasterOrders(options: {
  customerId?: string;
  skip?: number;
  limit?: number;
}) {
  const queries: string[] = [Query.orderDesc("$createdAt")];
  if (options.customerId)
    queries.push(Query.equal("customerId", options.customerId));
  if (options.limit) queries.push(Query.limit(options.limit));
  if (options.skip) queries.push(Query.offset(options.skip));
  return listDocuments<MasterOrderDoc>(COLLECTIONS.masterOrders, queries);
}

export async function createSellerOrder(data: {
  masterOrderId: string;
  sellerId: string;
  subtotal: number;
  status: SellerOrderStatus;
}) {
  return createDocument<SellerOrderDoc>(COLLECTIONS.sellerOrders, data);
}

export async function updateSellerOrder(
  id: string,
  data: Partial<Pick<SellerOrderDoc, "status" | "subtotal">>
) {
  return updateDocument<SellerOrderDoc>(COLLECTIONS.sellerOrders, id, data);
}

export async function getSellerOrderById(id: string) {
  return getDocument<SellerOrderDoc>(COLLECTIONS.sellerOrders, id);
}

export async function listSellerOrders(options: {
  sellerId?: string;
  masterOrderId?: string;
  skip?: number;
  limit?: number;
}) {
  const queries: string[] = [Query.orderDesc("$createdAt")];
  if (options.sellerId) queries.push(Query.equal("sellerId", options.sellerId));
  if (options.masterOrderId)
    queries.push(Query.equal("masterOrderId", options.masterOrderId));
  if (options.limit) queries.push(Query.limit(options.limit));
  if (options.skip) queries.push(Query.offset(options.skip));
  return listDocuments<SellerOrderDoc>(COLLECTIONS.sellerOrders, queries);
}

export async function createSellerOrderItem(data: {
  sellerOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}) {
  return createDocument<SellerOrderItemDoc>(
    COLLECTIONS.sellerOrderItems,
    data
  );
}

export async function listSellerOrderItems(sellerOrderId: string) {
  const { documents } = await listDocuments<SellerOrderItemDoc>(
    COLLECTIONS.sellerOrderItems,
    [Query.equal("sellerOrderId", sellerOrderId)]
  );
  return Promise.all(
    documents.map(async (item) => {
      const product = await getProductById(item.productId, false);
      return { ...item, product };
    })
  );
}

export async function listAllSellerOrderItems() {
  return listAllDocuments<SellerOrderItemDoc>(COLLECTIONS.sellerOrderItems, []);
}

export async function createPayment(data: {
  sellerOrderId: string;
  transactionCode: string;
  amount: number;
  status: PaymentStatus;
}) {
  return createDocument<PaymentDoc>(COLLECTIONS.payments, data);
}

export async function updatePayment(
  id: string,
  data: Partial<Pick<PaymentDoc, "status" | "verifiedAt">>
) {
  return updateDocument<PaymentDoc>(COLLECTIONS.payments, id, data);
}

export async function getPaymentById(id: string) {
  return getDocument<PaymentDoc>(COLLECTIONS.payments, id);
}

export async function listPayments(filters: {
  sellerOrderId?: string;
  status?: PaymentStatus;
  sellerId?: string;
  limit?: number;
}) {
  const queries: string[] = [Query.orderDesc("$createdAt")];
  if (filters.sellerOrderId)
    queries.push(Query.equal("sellerOrderId", filters.sellerOrderId));
  if (filters.status) queries.push(Query.equal("status", filters.status));
  if (filters.limit) queries.push(Query.limit(filters.limit));

  let { documents, total } = await listDocuments<PaymentDoc>(
    COLLECTIONS.payments,
    queries
  );

  if (filters.sellerId) {
    const sellerOrders = await listAllDocuments<SellerOrderDoc>(
      COLLECTIONS.sellerOrders,
      [Query.equal("sellerId", filters.sellerId)]
    );
    const orderIds = new Set(sellerOrders.map((o) => o.id));
    documents = documents.filter((p) => orderIds.has(p.sellerOrderId));
    total = documents.length;
  }

  return { documents, total };
}

export async function listPaymentMethods(sellerId: string) {
  const { documents } = await listDocuments<PaymentMethod>(
    COLLECTIONS.paymentMethods,
    [Query.equal("sellerId", sellerId), Query.orderDesc("isDefault")]
  );
  return documents;
}

export async function clearDefaultPaymentMethods(sellerId: string) {
  const methods = await listPaymentMethods(sellerId);
  await Promise.all(
    methods
      .filter((m) => m.isDefault)
      .map((m) =>
        updateDocument(COLLECTIONS.paymentMethods, m.id, { isDefault: false })
      )
  );
}

export async function createPaymentMethod(
  data: Omit<PaymentMethod, "id">
) {
  return createDocument<PaymentMethod>(COLLECTIONS.paymentMethods, data);
}

export async function enrichMasterOrder(
  order: MasterOrderDoc,
  options?: { sellerId?: string }
): Promise<MasterOrder> {
  const customer = await getUserById(order.customerId);
  const { documents: sellerOrders } = await listSellerOrders({
    masterOrderId: order.id,
  });

  const enrichedSellerOrders = await Promise.all(
    sellerOrders.map((so) => enrichSellerOrder(so, { includeMaster: false }))
  );

  const filtered = options?.sellerId
    ? enrichedSellerOrders.filter((so) => so.sellerId === options.sellerId)
    : enrichedSellerOrders;

  return {
    ...order,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    },
    sellerOrders: filtered,
  };
}

export async function enrichSellerOrder(
  order: SellerOrderDoc,
  options?: { includeMaster?: boolean; includeItems?: boolean }
): Promise<SellerOrder> {
  const includeItems = options?.includeItems !== false;
  const seller = await getUserById(order.sellerId, true);
  const methods = await listPaymentMethods(order.sellerId);
  const { documents: payments } = await listPayments({
    sellerOrderId: order.id,
  });
  const items = includeItems ? await listSellerOrderItems(order.id) : [];

  let masterOrder: MasterOrder | undefined;
  if (options?.includeMaster) {
    const master = await getMasterOrderById(order.masterOrderId);
    const cust = await getUserById(master.customerId);
    masterOrder = {
      ...master,
      customer: { id: cust.id, name: cust.name, email: cust.email },
    };
  }

  return {
    ...order,
    items,
    payments,
    seller: {
      ...seller,
      paymentMethods: methods.filter((m) => m.isDefault),
      store: seller.store ?? null,
    },
    masterOrder,
  };
}

export async function getMasterOrderFull(id: string) {
  const order = await getMasterOrderById(id);
  return enrichMasterOrder(order);
}

export async function getPaymentWithOrder(id: string) {
  const payment = await getPaymentById(id);
  const sellerOrder = await enrichSellerOrder(
    await getSellerOrderById(payment.sellerOrderId),
    { includeMaster: true }
  );
  return { ...payment, sellerOrder };
}
