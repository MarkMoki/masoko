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

const schema = z.object({
  status: z.nativeEnum(SellerOrderStatus),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Prisma removed - database operations no longer available
    return errorResponse("Database functionality removed", 503);
    
    // Original code commented out:
    // const session = await requireAuth(Role.SELLER, Role.ADMIN);
    // const { id } = await params;
    // const body = schema.parse(await req.json());
    // 
    // const order = await prisma.sellerOrder.findUnique({
    //   where: { id },
    //   include: { masterOrder: true },
    // });
    // if (!order) return errorResponse("Order not found", 404);
    // 
    // if (session.role === Role.SELLER && order.sellerId !== session.sub) {
    //   return errorResponse("Forbidden", 403);
    // }
    // 
    // if (!canTransitionSellerOrder(order.status, body.status)) {
    //   return errorResponse(
    //     `Cannot change status from ${order.status} to ${body.status}`,
    //     400
    //   );
    // }
    // 
    // const updated = await prisma.sellerOrder.update({
    //   where: { id },
    //   data: { status: body.status },
    // });
    // 
    // if (body.status === SellerOrderStatus.DELIVERED) {
    //   await prisma.notification.create({
    //     data: {
    //       userId: order.masterOrder.customerId,
    //       title: "Order delivered",
    //       message: `Seller order ${id.slice(-6).toUpperCase()} has been delivered.`,
    //     },
    //   });
    // }
    // 
    // await recalculateMasterOrderStatus(order.masterOrderId);
    // return json({ order: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
