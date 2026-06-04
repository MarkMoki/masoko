import { z } from "zod";
import { Role } from "@/lib/types";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/lib/db/products";
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
    const product = await getProductById(id); // Already enriched by default
    if (!product) return errorResponse("Product not found", 404);
    return json({ product });
  } catch (err) {
    return handleApiError(err);
  }
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(Role.SELLER, Role.ADMIN);
    const { id } = await params;
    const body = updateSchema.parse(await req.json());

    const product = await getProductById(id, false); // Don't enrich for update check
    if (!product) return errorResponse("Product not found", 404);

    if (
      session.role === Role.SELLER &&
      product.sellerId !== session.sub
    ) {
      return errorResponse("Forbidden", 403);
    }

    const updated = await updateProduct(id, body);
    return json({ product: updated }); // Will be enriched by default
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(Role.SELLER, Role.ADMIN);
    const { id } = await params;

    const product = await getProductById(id, false); // Don't enrich for delete check
    if (!product) return errorResponse("Product not found", 404);

    if (
      session.role === Role.SELLER &&
      product.sellerId !== session.sub
    ) {
      return errorResponse("Forbidden", 403);
    }

    await deleteProduct(id);
    return json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}