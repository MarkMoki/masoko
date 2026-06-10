import { MapPageClient } from "@/components/map/map-page-client";
import { listAllDocuments, Query, COLLECTIONS } from "@/lib/db/helpers";

type StoreLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  address: string | null;
};

export default async function MapPage() {
  const storesRaw = await listAllDocuments(COLLECTIONS.stores, [
    Query.limit(100),
  ]);

  const stores: StoreLocation[] = storesRaw
    .filter((s: any) => s.latitude != null && s.longitude != null)
    .map((s: any) => ({
      id: s.id,
      name: s.name,
      latitude: s.latitude as number,
      longitude: s.longitude as number,
      imageUrl: s.imageUrl ?? null,
      address: s.address ?? null,
    }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Store map</h1>
      <p className="mb-6 text-muted-foreground">
        Find sellers near you on OpenStreetMap
      </p>
      <MapPageClient stores={stores} />
    </div>
  );
}