export type GeoPosition = { latitude: number; longitude: number };

export async function getDevicePosition(): Promise<GeoPosition> {
  if (typeof window === "undefined") {
    throw new Error("Geolocation is only available in the browser");
  }

  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor;

  if (cap?.isNativePlatform?.()) {
    const { Geolocation } = await import("@capacitor/geolocation");
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== "granted") {
      const req = await Geolocation.requestPermissions();
      if (req.location !== "granted") {
        throw new Error("Location permission denied");
      }
    }
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
  }

  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported on this device");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(new Error(err.message || "Could not get location")),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}
