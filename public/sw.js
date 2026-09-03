// CardCompass India — PWA-lite service worker.
// Small, dependency-free. Network-first for navigations (with offline
// fallback), cache-first for hashed static assets. No API/mutation caching.

const CACHE_VERSION = "cc-v5";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const MAX_STATIC_ENTRIES = 80;
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [OFFLINE_URL, "/favicon-white.png", "/findyourcclogo2.png", "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("cc-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isMutationOrApi(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/settings") ||
    url.search.includes("mutate")
  );
}

function isHashedStaticAsset(url) {
  // Vite emits hashed filenames like /assets/index-abc123.js
  return url.pathname.startsWith("/assets/");
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isMutationOrApi(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached || Response.error()),
      ),
    );
    return;
  }

  if (isHashedStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || !response.ok || response.type === "opaque") return response;
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(async (cache) => {
            await cache.put(request, clone);
            const keys = await cache.keys();
            const overflow = keys.length - MAX_STATIC_ENTRIES;
            for (let i = 0; i < overflow; i += 1) {
              const key = keys[i];
              if (!PRECACHE_URLS.includes(new URL(key.url).pathname)) await cache.delete(key);
            }
          });
          return response;
        });
      }),
    );
  }
});
