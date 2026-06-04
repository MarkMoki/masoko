"use client";

import dynamic from "next/dynamic";

const StoreMap = dynamic(
  () => import("@/components/map/store-map").then((m) => m.StoreMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);

type Store = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  address: string | null;
  _count?: { products: number };
};

export function MapPageClient({ stores }: { stores: Store[] }) {
  return <StoreMap stores={stores} />;
}
