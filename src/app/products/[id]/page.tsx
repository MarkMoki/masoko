import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailView } from "@/components/products/product-detail-view";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { seller: true, store: true, category: true },
  });

  if (!product || !product.active) notFound();

  return <ProductDetailView product={product} />;
}
