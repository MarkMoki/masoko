import { MapPageClient } from "@/components/map/map-page-client";

export default async function MapPage() {
  // const stores = await prisma.store.findMany({
  //   where: {
  //     latitude: { not: null },
  //     longitude: { not: null },
  //   },
  //   include: { _count: { select: { products: true } } },
  // });
  const stores: any[] = []; // Prisma removed

  const mapped = stores
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      id: s.id,
      name: s.name,
      latitude: s.latitude!,
      longitude: s.longitude!,
      imageUrl: s.imageUrl,
      address: s.address,
      _count: s._count,
    }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Store map</h1>
      <p className="mb-6 text-muted-foreground">
        Find sellers near you on OpenStreetMap
      </p>
      <MapPageClient stores={mapped} />
    </div>
  );
}
