"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getDevicePosition } from "@/lib/geolocation";
import { useToast } from "@/hooks/use-toast";
import { Crosshair, Loader2, MapPin } from "lucide-react";

const StoreMap = dynamic(
  () => import("@/components/map/store-map").then((m) => m.StoreMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);

export default function MerchantMapPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [position, setPosition] = useState<[number, number] | null>([
    -1.2921, 36.8219,
  ]);
  const [saved, setSaved] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      apiFetch<{ user: { id: string } }>("/api/auth/me"),
      fetch("/api/stores").then((r) => r.json()),
    ]).then(([{ user }, storesData]) => {
      const store = storesData.stores?.find(
        (s: {
          seller: { id: string };
          id: string;
          latitude: number | null;
          longitude: number | null;
        }) => s.seller.id === user.id
      );
      if (store) {
        setStoreId(store.id);
        if (store.latitude != null && store.longitude != null) {
          setPosition([store.latitude, store.longitude]);
        }
      }
    });
  }, []);

  async function useGps() {
    setGpsLoading(true);
    setGpsError("");
    try {
      const pos = await getDevicePosition();
      setPosition([pos.latitude, pos.longitude]);
      setSaved(false);
      toast({
        title: "Location found",
        description: "GPS coordinates captured successfully.",
        variant: "success",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not get GPS location";
      setGpsError(message);
      toast({
        title: "GPS error",
        description: message,
        variant: "error",
      });
    } finally {
      setGpsLoading(false);
    }
  }

  async function saveLocation() {
    if (!storeId || !position) return;
    try {
      await apiFetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        body: JSON.stringify({
          latitude: position[0],
          longitude: position[1],
        }),
      });
      setSaved(true);
      toast({
        title: "Location saved",
        description: "Your store location has been updated.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not save location",
        variant: "error",
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Store location</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Tap the map, drag the marker, or use your device GPS to set where
        customers find you.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="default"
          className="gap-2"
          onClick={useGps}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
          Use my location (GPS)
        </Button>
        {position && (
          <span className="flex items-center gap-1 self-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </span>
        )}
      </div>

      {gpsError && (
        <p className="mb-3 text-sm text-destructive">{gpsError}</p>
      )}

      {position && (
        <StoreMap
          stores={[]}
          center={position}
          zoom={15}
          editable
          markerPosition={position}
          onLocationPick={(lat, lng) => {
            setPosition([lat, lng]);
            setSaved(false);
          }}
        />
      )}

      <Button className="mt-4" onClick={saveLocation} disabled={!storeId}>
        Save location
      </Button>
      {!storeId && (
        <p className="mt-2 text-sm text-amber-600">
          Create your store first under Merchant → Store.
        </p>
      )}
      {saved && (
        <p className="mt-2 text-sm text-green-600">Location saved!</p>
      )}
    </div>
  );
}
