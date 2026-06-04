import { z } from "zod";
import { Role } from "@/lib/types";
import { getOrCreateCart } from "@/lib/db/carts";
import { requireAuth, handleApiError, json } from "@/lib/api-route";
import { listProducts, createProduct, getProductById, updateProduct, deleteProduct, enrichProducts } from "@/lib/db/products";
import { getStoreBySellerId } from "@/lib/db/users-stores";

export async function GET(req: Request) {
  try:
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const q = searchParams.get("q") ?? "";
    const categoryId = searchParams.get("categoryId");
    const limit = 24;
    const skip = (page - 1) * limit;

    const { products, total } = await listProducts({
      active: true,
      q,
      categoryId,
      skip,
      limit,
    });

    // Enrich products with seller, store, and category information
    const enrichedProducts = await enrichProducts(products);

    return json({ products: enrichedProducts, total, page, limit });
  } catch (err) {
    return handleApiError(err);
  }
}

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().optional(),
  imageUrl: z.string().optional(),
  active: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth(Role.SELLER, Role.ADMIN);
    const body = createSchema.parse(await req.json());

    let sellerId = session.sub;
    let storeId: string | undefined;

    if (session.role === Role.SELLER) {
      const store = await getStoreBySellerId(sellerId);
      if (!store) throw new Error("Create a store first");
      storeId = store.id;
    } else if (body && "sellerId" in body) {
      sellerId = (body as { sellerId?: string }).sellerId ?? session.sub;
    }

    const product = await createProduct({
      sellerId,
      storeId,
      ...body,
    });

    return json({ product }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

// Add PUT and DELETE handlers for individual products
export async function PUT(req: Request) {
  try {
    const session = await requireAuth(Role.SELLER, Role.ADMIN);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return json({ error: "Product ID is required" }, 400);
    }

    const body = await req.json();
    // Only allow updating certain fields
    const updateData = {
      name: body.name,
      description: body.description,
      price: body.price,
      stock: body.stock,
      categoryId: body.categoryId,
      imageUrl: body.imageUrl,
      active: body.active,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const product = await updateProduct(id, updateData);
    return json({ product });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireAuth(Role.SELLER, Role.ADMIN);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return json({ error: "Product ID is required" }, 400);
    }

    await deleteProduct(id);
    return json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}