import { listDocuments, Query, COLLECTIONS } from "@/lib/db/helpers";
import type { Category } from "@/lib/types";

export async function GET() {
  const result = await listDocuments<Category>(COLLECTIONS.categories, [
    Query.limit(100),
    Query.orderAsc("name"),
  ]);
  return Response.json({ categories: result.documents });
}