import { z } from "zod";
import { Role, SellerOrderStatus } from "@/lib/types";
import { canTransitionSellerOrder } from "@/lib/seller-order-status";
import { recalculateMasterOrderStatus } from "@/lib/order-status";
import {
  requireAuth,
  handleApiError,
  json,
  errorResponse,
} from "@/lib/api-route";
import {
  getSellerOrderById,
  updateSellerOrder,
  getMasterOrderById,
} from "@/lib/db/orders";
import { createNotification } from "@/lib/db/config-promos";

const schema = z.object({
  status: z.nativeEnum(SellerOrderStatus),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(Role.SELLER, Role.ADMIN);
    const { id } = await params;
    const body = schema.parse(await req.json());

    const order = await getSellerOrderById(id);
    if (!order) return errorResponse("Order not found", 404);

    if (session.role === Role.SELLER && order.sellerId !== session.sub) {
      return errorResponse("Forbidden", 403);
    }

    if (!canTransitionSellerOrder(order.status as SellerOrderStatus, body.status)) {
      return errorResponse(
        `Cannot change status from ${order.status} to ${body.status}`,
        400
      );
    }

    const updated = await updateSellerOrder(id, { status: body.status });

    if (body.status === SellerOrderStatus.DELIVERED) {
      const master = await getMasterOrderById(order.masterOrderId);
      await createNotification({
        userId: master.customerId,
        title: "Order delivered",
        message: `Seller order ${id.slice(-6).toUpperCase()} has been delivered.`,
      });
    }

    await recalculateMasterOrderStatus(order.masterOrderId);
    return json({ order: updated });
  } catch (err) {
    return handleApiError(err);
  }
}