import { Role } from "@prisma/client";
import { storage } from "@/lib/storage";
import { requireAuth, handleApiError, json, errorResponse } from "@/lib/api-route";

export async function POST(req: Request) {
  try {
    await requireAuth(Role.SELLER, Role.ADMIN);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "products";

    if (!file) return errorResponse("No file provided", 400);
    if (folder !== "products" && folder !== "stores") {
      return errorResponse("Invalid folder", 400);
    }

    const result = await storage.upload(file, folder);
    return json(result, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
