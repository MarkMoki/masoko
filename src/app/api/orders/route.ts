import { Role } from "@/lib/types";
import { Query } from "node-appwrite";
import {
  listMasterOrders,
  getMasterOrderFull,
} from "@/lib/db/orders";
import {
  listSellerOrders,
  enrichSellerOrder,
} from "@/lib/db/orders";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

export async function GET(req: Request) {
  try {
    const session = await requireAuth(
      Role.CUSTOMER,
      Role.SELLER,
      Role.ADMIN
    );
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 20;
    const skip = (page - 1) * limit;

    let orders, total;

    if (session.role === Role.CUSTOMER) {
      const result = await listMasterOrders({ customerId: session.sub, skip, limit });
      orders = result.documents;
      total = result.total;
      
      // Enrich orders with customer and seller details
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const enriched = await getMasterOrderFull(order.id);
          return enriched;
        })
      );
      orders = enrichedOrders;
    } 
    else if (session.role === Role.SELLER) {
      const result = await listSellerOrders({ sellerId: session.sub, skip, limit });
      orders = result.documents;
      total = result.total;
      
      // Enrich orders with seller, items, payments, and master order details
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const enriched = await enrichSellerOrder(order, { includeItems: true, includeMaster: true });
          return enriched;
        })
      );
      orders = enrichedOrders;
    }
    else { // ADMIN
      const result = await listMasterOrders({ skip, limit });
      orders = result.documents;
      total = result.total;
      
      // Enrich orders with customer and seller details
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const enriched = await getMasterOrderFull(order.id);
          return enriched;
        })
      );
      orders = enrichedOrders;
    }

    return json({ orders, total, page, limit });
  } catch (err) {
    return handleApiError(err);
  }
}