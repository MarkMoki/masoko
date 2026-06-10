import { z } from "zod";
import { Role, MasterOrderStatus, SellerOrderStatus, PricingModel, PromoType } from "@/lib/types";
import { requireAuth, handleApiError, json, errorResponse } from "@/lib/api-route";
import {
  deleteMany,
  bulkUpdateDocuments,
  bulkDeleteDocuments,
  bulkCreateDocuments,
  listDocuments,
  countDocuments,
  updateDocument,
  deleteDocument,
  createDocument,
  Query,
  COLLECTIONS,
} from "@/lib/db/helpers";

const BulkActionSchema = z.object({
  action: z.enum([
    "delete",
    "toggle_active",
    "update",
    "create",
    "mark_read",
    "update_status",
    "bulk_delete",
  ]),
  ids: z.array(z.string()).optional(),
  data: z.record(z.unknown()).optional(),
  items: z.array(z.record(z.unknown())).optional(),
  status: z.string().optional(),
});

const EntitySchema = z.enum([
  "products",
  "promos",
  "orders",
  "sellers",
  "categories",
  "notifications",
  "reviews",
  "plans",
]);

async function safeDelete(collectionId: string, ids: string[]) {
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];
  for (const id of ids) {
    try {
      await deleteDocument(collectionId, id);
      succeeded++;
    } catch {
      failed++;
      errors.push(id);
    }
  }
  return { success: succeeded, failed, errors };
}

async function safeUpdate(collectionId: string, ids: string[], data: Record<string, unknown>) {
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];
  for (const id of ids) {
    try {
      await updateDocument(collectionId, id, data);
      succeeded++;
    } catch {
      failed++;
      errors.push(id);
    }
  }
  return { success: succeeded, failed, errors };
}

export async function PATCH(request: Request) {
  try {
    await requireAuth(Role.ADMIN);

    const body = await request.json();
    const entityResult = EntitySchema.safeParse(body.entity);
    if (!entityResult.success) {
      return errorResponse("Invalid entity type", 400);
    }

    const entity = entityResult.data;
    const actionResult = BulkActionSchema.safeParse(body);
    if (!actionResult.success) {
      return errorResponse("Invalid action or missing parameters", 400);
    }

    const { action, ids, data, items, status } = actionResult.data;
    if (!ids && !items) {
      return errorResponse("ids or items array required", 400);
    }

    let result;

    if (action === "delete" || action === "bulk_delete") {
      switch (entity) {
        case "products":
          result = await safeDelete(COLLECTIONS.products, ids!);
          break;
        case "promos":
          result = await safeDelete(COLLECTIONS.marketplacePromos, ids!);
          break;
        case "sellers": {
          result = { success: 0, failed: 0, errors: [] as string[] };
          for (const id of ids!) {
            try {
              const stores = await listDocuments(
                COLLECTIONS.stores,
                [Query.equal("sellerId", id)]
              );
              for (const store of stores.documents) {
                await deleteMany(COLLECTIONS.products, [Query.equal("storeId", store.id)]);
              }
              await deleteMany(COLLECTIONS.users, [Query.equal("$id", id)]);
              deleteMany(COLLECTIONS.stores, [Query.equal("sellerId", id)]);
              result.success++;
            } catch {
              result.failed++;
              result.errors!.push(id);
            }
          }
          break;
        }
        case "categories":
          result = await safeDelete(COLLECTIONS.categories, ids!);
          break;
        case "notifications":
          result = await safeDelete(COLLECTIONS.notifications, ids!);
          break;
        case "reviews":
          result = await safeDelete(COLLECTIONS.reviews, ids!);
          break;
        case "plans":
          result = await safeDelete(COLLECTIONS.sellerPlans, ids!);
          break;
        default:
          return errorResponse(`Delete not supported for ${entity}`, 400);
      }
    } else if (action === "toggle_active") {
      switch (entity) {
        case "products": {
          const docs = await listDocuments<{ active: boolean }>(
            COLLECTIONS.products,
            ids!.length > 0 ? [Query.equal("$id", ids!)] : []
          );
          const updates = docs.documents.map((d) => ({ id: d.id, active: !d.active }));
          result = { success: 0, failed: 0, errors: [] as string[] };
          for (const u of updates) {
            try {
              await updateDocument(COLLECTIONS.products, u.id, { active: u.active });
              result.success!++;
            } catch {
              result.failed!++;
            }
          }
          break;
        }
        case "promos": {
          const docs = await listDocuments<{ active: boolean }>(
            COLLECTIONS.marketplacePromos,
            ids!.length > 0 ? [Query.equal("$id", ids!)] : []
          );
          const updates = docs.documents.map((d) => ({ id: d.id, active: !d.active }));
          result = { success: 0, failed: 0, errors: [] as string[] };
          for (const u of updates) {
            try {
              await updateDocument(COLLECTIONS.marketplacePromos, u.id, { active: u.active });
              result.success!++;
            } catch {
              result.failed!++;
            }
          }
          break;
        }
        default:
          return errorResponse(`Toggle active not supported for ${entity}`, 400);
      }
    } else if (action === "update") {
      switch (entity) {
        case "products":
          result = await safeUpdate(COLLECTIONS.products, ids!, data!);
          break;
        case "plans":
          result = await safeUpdate(COLLECTIONS.sellerPlans, ids!, data!);
          break;
        case "orders":
          if (!status) return errorResponse("status required for order update", 400);
          const orderStatuses = [
            MasterOrderStatus.PENDING_PAYMENT,
            MasterOrderStatus.PARTIALLY_PAID,
            MasterOrderStatus.FULLY_PAID,
            MasterOrderStatus.PROCESSING,
            MasterOrderStatus.COMPLETED,
            MasterOrderStatus.CANCELLED,
            SellerOrderStatus.PENDING_PAYMENT,
            SellerOrderStatus.PAYMENT_SUBMITTED,
            SellerOrderStatus.PAID,
            SellerOrderStatus.PROCESSING,
            SellerOrderStatus.READY,
            SellerOrderStatus.DELIVERED,
            SellerOrderStatus.CANCELLED,
          ];
          if (!orderStatuses.includes(status as any)) {
            return errorResponse("Invalid order status", 400);
          }
          result = await safeUpdate(COLLECTIONS.masterOrders, ids!, { status });
          break;
        default:
          return errorResponse(`Update not supported for ${entity}`, 400);
      }
    } else if (action === "create") {
      switch (entity) {
        case "products":
          result = { success: 0, failed: 0, errors: [] as string[] };
          for (const item of items!) {
            try {
              await createDocument(COLLECTIONS.products, item);
              result.success!++;
            } catch {
              result.failed!++;
              result.errors!.push(item.name as string || "unknown");
            }
          }
          break;
        case "promos":
          result = { success: 0, failed: 0, errors: [] as string[] };
          for (const item of items!) {
            try {
              await createDocument(COLLECTIONS.marketplacePromos, item);
              result.success!++;
            } catch {
              result.failed!++;
              result.errors!.push(item.title as string || "unknown");
            }
          }
          break;
        case "categories":
          result = { success: 0, failed: 0, errors: [] as string[] };
          for (const item of items!) {
            try {
              await createDocument(COLLECTIONS.categories, item);
              result.success!++;
            } catch {
              result.failed!++;
              result.errors!.push(item.name as string || "unknown");
            }
          }
          break;
        default:
          return errorResponse(`Create not supported for ${entity}`, 400);
      }
    } else if (action === "mark_read") {
      if (entity !== "notifications") {
        return errorResponse("mark_read only supported for notifications", 400);
      }
      result = await safeUpdate(COLLECTIONS.notifications, ids!, { read: true });
    } else {
      return errorResponse(`Unsupported action: ${action}`, 400);
    }

    return json({ ...result, entity, action });
  } catch (err) {
    return handleApiError(err);
  }
}
