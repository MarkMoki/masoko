import { Role } from "@/lib/types";
import { getMasterOrderById } from "@/lib/db/orders";
import { getMasterOrderFull, enrichSellerOrder } from "@/lib/db/orders";
import { requireAuth, handleApiError, json, errorResponse } from "@/lib/api-route";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(
      Role.CUSTOMER,
      Role.SELLER,
      Role.ADMIN
    );
    const { id } = await params;

    // Get the full order with all enrichments
    const order = await getMasterOrderFull(id);
    if (!order) return errorResponse("Order not found", 404);

    // Check permissions
    let isAuthorized = false;
    if (session.role === Role.ADMIN) {
      isAuthorized = true;
    } else if (session.role === Role.CUSTOMER) {
      isAuthorized = order.customerId === session.sub;
    } else if (session.role === Role.SELLER) {
      isAuthorized = order.sellerOrders?.some(
        (so) => so.sellerId === session.sub
      ) ?? false;
    }

    if (!isAuthorized) {
      return errorResponse("Forbidden", 403);
    }

    // If seller, filter to only show their seller orders
    if (session.role === Role.SELLER) {
      // Filter seller orders to only include the current seller's
      const mySellerOrders = await Promise.all(
        (order.sellerOrders ?? [])
          .filter((so) => so.sellerId === session.sub)
          .map(async (sellerOrder) => {
            // Ensure the seller order is enriched with items (it should already be from getMasterOrderFull)
            // But let's double-check by re-enriching with items if needed
            return await enrichSellerOrder(
              {
                id: sellerOrder.id,
                masterOrderId: sellerOrder.masterOrderId,
                sellerId: sellerOrder.sellerId,
                subtotal: sellerOrder.subtotal,
                status: sellerOrder.status,
                createdAt: sellerOrder.createdAt,
                updatedAt: sellerOrder.updatedAt,
              } as any,
              { includeItems: true, includeMaster: false }
            );
          })
      );
      
      return json({ ...order, sellerOrders: mySellerOrders });
    }

    // For customer and admin, return the order as-is
    return json({ order });
  } catch (err) {
    return handleApiError(err);
  }
}