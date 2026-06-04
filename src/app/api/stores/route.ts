import { z } from "zod";
import { Role } from "@/lib/types";
import {
  listStores,
  getStoreBySellerId,
  createStore,
  countProductsByStore,
  getUserById,
} from "@/lib/db/users-stores";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mapOnly = searchParams.get("map") === "true";

    let stores;
    if (mapOnly) {
      // Get all stores and filter for those with coordinates
      stores = await listStores({ mapOnly: true });
    } else {
      stores = await listStores();
    }

    // Enrich stores with seller and product count
    const storesWithDetails = await Promise.all(
      stores.map(async (store) => {
        const seller = await getUserById(store.sellerId, false); // Don't need store info for seller
        const productCount = await countProductsByStore(store.id);
        return {
          ...store,
          seller: { id: seller.id, name: seller.name },
          _count: { products: productCount },
        };
      })
    );

    // Sort by name ascending
    storesWithDetails.sort((a, b) => a.name.localeCompare(b.name));

    return json({ stores: storesWithDetails });
  } catch (err) {
    return handleApiError(err);
  }
}

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth(Role.SELLER);
    const body = createSchema.parse(await req.json());

    const existing = await getStoreBySellerId(session.sub);
    if (existing) throw new Error("Store already exists");

    const store = await createStore({
      ...body,
      sellerId: session.sub,
    });
    return json({ store }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}