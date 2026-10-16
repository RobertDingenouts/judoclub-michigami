/* PWA Service Worker — Judoclub Michigami */
const CACHE_NAME = "michigami-v107-20261015";

// Assets to pre-cache on install (critical for offline)
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
];

// Max aantal entries in de cache — daarboven worden de oudste opgeruimd.
// Voorkomt dat de Cache-API de storage-quota volpropt (media-bloat),
// wat elke cache.put liet falen en de hele site onbruikbaar maakte (okt 2026).
const MAX_ENTRIES = 250;

// Media NOOIT in de SW-cache: audio-cursusbestanden + fotoalbums/video's
// zijn te groot en offline niet kritiek.
const NEVER_CACHE_RE =
  /^\/data\/|\.(mp3|wav|m4a|ogg|mp4|webm|mov|pdf)$/i;

// Install: cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {}) // quota-fout mag install niet laten falen
  );
  self.skipWaiting();
});

// Activate: clean old caches (incl. een volgelopen oude cache)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network First for pages, Cache First for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API routes: NEVER cache — they carry per-user session data
  // (profieldata, login-status). Caching these would show stale data
  // after a save.
  if (url.pathname.startsWith("/api/")) {
    return; // passthrough: browser handles the request normally
  }

  // Media (audio/video/pdf): gewoon netjes doorladen, nooit cachen
  if (NEVER_CACHE_RE.test(url.pathname)) {
    return;
  }

  // Static assets: Cache First
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/uploads/") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif|woff2?)$/)
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Pages: Network First (always try fresh, fall back to cache)
  if (event.request.destination === "document" || url.pathname === "/") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Default: network first
  event.respondWith(networkFirst(event.request));
});

// Veilig in de cache zetten: quota-fouten mogen NOOIT een request laten falen.
async function safePut(request, response) {
  if (request.method !== "GET") return;
  if (NEVER_CACHE_RE.test(new URL(request.url).pathname)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
    // Groei begrenzen: oudste entries opruimen.
    const keys = await cache.keys();
    if (keys.length > MAX_ENTRIES) {
      await Promise.all(
        keys.slice(0, keys.length - MAX_ENTRIES).map((k) => cache.delete(k))
      );
    }
  } catch {
    // QuotaExceeded / andere cache-fout: negeren, het response gaat door.
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      await safePut(request, response);
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      await safePut(request, response);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response("Offline", { status: 503 });
  }
}
