import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/products/product-detail-view";
import { getProductWithReviews } from "@/lib/db/products";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductWithReviews(id).catch(() => null);

  if (!product || !product.active) notFound();

  return <ProductDetailView product={product as any} />;
}
