import { z } from "zod";
import { Role } from "@/lib/types";
import {
  getStoreById,
  updateStore,
  listDocuments,
  countDocuments,
} from "@/lib/db/users-stores";
import { Query } from "node-appwrite";
import { COLLECTIONS } from "@/lib/appwrite/config";
import {
  requireAuth,
  handleApiError,
  json,
  errorResponse,
} from "@/lib/api-route";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const store = await getStoreById(id);
    if (!store) return errorResponse("Store not found", 404);
    
    // Get products for this store
    const { documents: products } = await listDocuments(
      COLLECTIONS.products,
      [Query.equal("storeId", id), Query.equal("active", true)]
    );
    
    return json({ 
      store: {
        ...store,
        products
      }
    });
  } catch (err) {
    return handleApiError(err);
  }
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(Role.SELLER, Role.ADMIN);
    const { id } = await params;
    const body = updateSchema.parse(await req.json());

    const store = await getStoreById(id);
    if (!store) return errorResponse("Store not found", 404);

    if (session.role === Role.SELLER && store.sellerId !== session.sub) {
      return errorResponse("Forbidden", 403);
    }

    const updated = await updateStore(id, body);
    return json({ store: updated });
  } catch (err) {
    return handleApiError(err);
  }
}