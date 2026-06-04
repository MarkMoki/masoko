import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/products/product-detail-view";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // const product = await prisma.product.findUnique({
  //   where: { id },
  //   include: { seller: true, store: true, category: true },
  // });
  const product: any = null; // Prisma removed

  if (!product || !product.active) notFound();

  return <ProductDetailView product={product} />;
}
