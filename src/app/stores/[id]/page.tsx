import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/products/product-card";
import { getCurrentUser, getSession } from "@/lib/auth";
import { getStoreWithProducts } from "@/lib/db/users-stores";
import { enrichProducts } from "@/lib/db/products";
import type { Product } from "@/lib/types";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storeData = await getStoreWithProducts(id).catch(() => null);

  if (!storeData) notFound();

  const store = storeData;
  const enrichedProducts = await enrichProducts(storeData.products as any[]);

  const [user, session] = await Promise.all([getCurrentUser(), getSession()]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{store.name}</h1>
      {store.description && (
        <p className="mt-2 text-muted-foreground">{store.description}</p>
      )}
      {store.address && (
        <p className="text-sm text-muted-foreground">{store.address}</p>
      )}
      <Link href="/map" className="mt-2 inline-block text-sm text-primary underline">
        View on map
      </Link>

      <h2 className="mb-4 mt-8 text-xl font-semibold">Products</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {enrichedProducts.map((product: Product) => (
          <ProductCard
            key={product.id}
            product={product}
            sessionRole={session?.role}
            currentUserId={user?.id}
          />
        ))}
      </div>
    </div>
  );
}
