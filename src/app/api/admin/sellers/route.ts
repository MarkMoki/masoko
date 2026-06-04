import { z } from "zod";
import { Role } from "@/lib/types";
import { listUsersByRole, getUserByEmail, createUser } from "@/lib/db/users-stores";
import { getStoreBySellerId, countProductsByStore } from "@/lib/db/users-stores";
import { hashPassword } from "@/lib/auth";
import { requireAuth, handleApiError, json } from "@/lib/api-route";

export async function GET() {
  try {
    await requireAuth(Role.ADMIN);
    const users = await listUsersByRole(Role.SELLER);
    
    // Enrich each user with store and product count
    const sellers = await Promise.all(
      users.map(async (user) => {
        const store = await getStoreBySellerId(user.id);
        const productCount = store ? await countProductsByStore(store.id) : 0;
        return {
          ...user,
          store: store ?? null,
          _count: {
            products: productCount
          }
        };
      })
    );
    
    return json({ sellers });
  } catch (err) {
    return handleApiError(err);
  }
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAuth(Role.ADMIN);
    const body = createSchema.parse(await req.json());

    const exists = await getUserByEmail(body.email);
    if (exists) throw new Error("Email already in use");

    const seller = await createUser({
      name: body.name,
      email: body.email,
      phone: body.phone,
      passwordHash: await hashPassword(body.password),
      role: Role.SELLER,
    });

    return json(
      {
        seller: {
          id: seller.id,
          name: seller.name,
          email: seller.email,
        },
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}