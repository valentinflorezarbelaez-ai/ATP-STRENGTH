// Service Worker for NEURO//STRENGTH (PWA Standalone Engine)
// Cache Version v6: Complete App Shell, Offline Navigation & Lie-Fi Timeout Defense
const CACHE_NAME = "neuro-strength-v6";

const PRECACHE_ASSETS = [
  "/",
  "/calc",
  "/forge",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-192.svg",
  "/icon-512.svg",
  "/icon-maskable-192.png",
  "/icon-maskable-512.png",
];

// Helper: Fetch with timeout to defeat the "Lie-Fi" hanging connection problem in underground gyms
function fetchWithTimeout(request, timeoutMs = 2500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Network timeout (Lie-Fi detected)"));
    }, timeoutMs);

    fetch(request)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Install: Precache shell resiliently using Promise.allSettled
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_ASSETS.map((asset) => cache.add(asset))
      );
      results.forEach((res, index) => {
        if (res.status === "rejected") {
          console.warn("[SW] Warning: Precache skipped for asset:", PRECACHE_ASSETS[index]);
        }
      });
    })
  );
  self.skipWaiting();
});

// Activate: Purge obsolete cache generations and claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Evicting legacy cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: Smart caching with Lie-Fi protection
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Bypass backend API / external analytics / local uvicorn
  if (url.port === "8000" || url.pathname.startsWith("/api/")) {
    return;
  }

  // 1. Navigation (HTML pages): Network-first with 2.5s timeout, instant fallback to cache
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetchWithTimeout(request, 2500)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match("/");
          if (rootCached) return rootCached;
          return new Response("ATP-STRENGTH Offline", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        })
    );
    return;
  }

  // 2. Next.js static assets, chunks, icons, webmanifest: Stale-While-Revalidate
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".webp") ||
      url.pathname.endsWith(".ico") ||
      url.pathname.endsWith(".webmanifest"))
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 3. Audio files (on-demand cache): Cache-First
  if (url.origin === self.location.origin && url.pathname.startsWith("/audio/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: Network with fallback to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
