const CACHE_NAME = "masoko-cache-v1";
const OFFLINE_URL = "/offline.html";

const URLs_TO_CACHE = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLs_TO_CACHE))
  );
});

self.addEventListener("fetch", (event: any) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL) || caches.match("/"))
    );
    return;
  }

  if (event.request.destination === "image") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((response) =>
          response || new Response("", { status: 404 })
        )
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) =>
      response || fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    )
  );
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});