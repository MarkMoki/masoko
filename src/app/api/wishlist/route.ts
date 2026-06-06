import { getSession } from "@/lib/auth";
import { createDocument, listDocuments, deleteDocument, findOne, Query } from "@/lib/db/helpers";
import { COLLECTIONS } from "@/lib/appwrite/config";
import { WishlistItem } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await listDocuments<WishlistItem>(COLLECTIONS.wishlistItems, [
    Query.equal("userId", session.sub),
    Query.limit(100),
  ]);

  return Response.json({ items: result.documents });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await request.json();

  const existing = await findOne<WishlistItem>(COLLECTIONS.wishlistItems, [
    Query.equal("userId", session.sub),
    Query.equal("productId", productId),
  ]);

  if (existing) {
    return Response.json({ item: existing });
  }

  const item = await createDocument<WishlistItem>(COLLECTIONS.wishlistItems, {
    userId: session.sub,
    productId,
  });

  return Response.json({ item });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return Response.json({ error: "Product ID required" }, { status: 400 });
  }

  const item = await findOne<WishlistItem>(COLLECTIONS.wishlistItems, [
    Query.equal("userId", session.sub),
    Query.equal("productId", productId),
  ]);

  if (item) {
    await deleteDocument(COLLECTIONS.wishlistItems, item.id);
  }

  return Response.json({ success: true });
}