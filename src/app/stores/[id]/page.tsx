import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { getCurrentUser, getSession } from "@/lib/auth";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, name: true } },
      products: { where: { active: true } },
    },
  });

  if (!store) notFound();

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
        {store.products.map((product) => (
          <ProductCard
            key={product.id}
            product={{ ...product, seller: store.seller, store }}
            sessionRole={session?.role}
            currentUserId={user?.id}
          />
        ))}
      </div>
    </div>
  );
}
