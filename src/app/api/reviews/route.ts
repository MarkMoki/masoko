import { getSession } from "@/lib/auth";
import { createDocument, listDocuments, updateDocument, deleteDocument, Query, COLLECTIONS } from "@/lib/db/helpers";
import type { Review } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const userId = searchParams.get("userId");

  if (!productId) {
    return Response.json({ error: "Product ID required" }, { status: 400 });
  }

  const result = await listDocuments<Review>(COLLECTIONS.reviews, [
    Query.equal("productId", productId),
    ...(userId ? [Query.equal("userId", userId)] : []),
    Query.limit(100),
  ]);

  const reviews = result.documents;
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;
  const reviewCount = reviews.length;

  return Response.json({ reviews, averageRating, reviewCount });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, rating, comment } = await request.json();

  if (!productId || !rating || rating < 1 || rating > 5) {
    return Response.json({ error: "Invalid review data" }, { status: 400 });
  }

  const review = await createDocument<Review>(COLLECTIONS.reviews, {
    userId: session.sub,
    productId,
    rating,
    comment,
  });

  return Response.json({ review });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("id");

  if (!reviewId) {
    return Response.json({ error: "Review ID required" }, { status: 400 });
  }

  const { rating, comment } = await request.json();

  const review = await updateDocument(COLLECTIONS.reviews, reviewId, {
    rating,
    comment,
  });

  return Response.json({ review });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("id");

  if (!reviewId) {
    return Response.json({ error: "Review ID required" }, { status: 400 });
  }

  await deleteDocument(COLLECTIONS.reviews, reviewId);

  return Response.json({ success: true });
}