const RELEASE_ID = "2026-07-19-operation-black-vault";
const CACHE_NAME = `archaios-os-${RELEASE_ID}`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.json",
  "./icons/archaios-icon.svg",
  "./apple-touch-icon.svg"
];
const AUTH_QUERY_KEYS = new Set(["access_token", "code", "error", "error_code", "refresh_token", "token_hash", "type"]);

function isAuthNavigation(url) {
  return Array.from(AUTH_QUERY_KEYS).some((key) => url.searchParams.has(key));
}

function shouldBypassCache(request, url) {
  if (url.origin !== self.location.origin) {
    return true;
  }
  if (url.pathname.startsWith("/api/")) {
    return true;
  }
  if (request.headers.has("Authorization")) {
    return true;
  }
  return isAuthNavigation(url);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: "ARCHAIOS_SW_ACTIVATED", releaseId: RELEASE_ID });
        }
      })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "ARCHAIOS_SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (shouldBypassCache(request, url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && !isAuthNavigation(url)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("./", copy));
          }
          return response;
        })
        .catch(() => caches.match("./") || caches.match("./offline.html"))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
          if (response.ok && url.origin === self.location.origin) {
            const copy = response.clone();
            cache.put(request, copy);
          }
          return response;
        });
        return cached || network;
      })
    )
  );
});
