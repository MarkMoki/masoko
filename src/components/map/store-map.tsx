"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";

// Fix default marker icons in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = icon;

type Store = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  address: string | null;
  _count?: { products: number };
};

function LocationPicker({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function StoreMap({
  stores,
  center = [-1.2921, 36.8219],
  zoom = 12,
  editable = false,
  markerPosition,
  onLocationPick,
}: {
  stores: Store[];
  center?: [number, number];
  zoom?: number;
  editable?: boolean;
  markerPosition?: [number, number] | null;
  onLocationPick?: (lat: number, lng: number) => void;
}) {
  useEffect(() => {
    // ensure map renders correctly in client
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-[500px] w-full rounded-lg z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {editable && onLocationPick && <LocationPicker onPick={onLocationPick} />}
      {markerPosition && (
        <Marker
          position={markerPosition}
          draggable={editable}
          eventHandlers={
            editable && onLocationPick
              ? {
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    onLocationPick(lat, lng);
                  },
                }
              : undefined
          }
        >
          <Popup>
            {editable ? "Drag or click map to set location" : "Store location"}
          </Popup>
        </Marker>
      )}
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={[store.latitude, store.longitude]}
        >
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-semibold">{store.name}</p>
              {store.address && (
                <p className="text-xs text-muted-foreground">{store.address}</p>
              )}
              <p className="text-xs">
                {store._count?.products ?? 0} products
              </p>
              <Link
                href={`/stores/${store.id}`}
                className="mt-2 inline-block text-sm text-primary underline"
              >
                View store
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
