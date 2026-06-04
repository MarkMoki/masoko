import { getCurrentUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/api-route";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse("Unauthorized", 401);
  return json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      store: user.store,
    },
  });
}
