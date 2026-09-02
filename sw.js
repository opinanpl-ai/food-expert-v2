const CACHE_NAME = "food-expert-v5-fe010";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Always prefer the latest base recipe database when online, then merge
  // approved recipe add-ons maintained separately to avoid risky rewrites.
  if (url.pathname.endsWith("/data/recipes.json")) {
    event.respondWith((async () => {
      try {
        const baseResponse = await fetch(event.request, {cache:"no-store"});
        if (!baseResponse.ok) throw new Error("Recipe database unavailable");

        const baseRecipes = await baseResponse.json();
        let extraRecipes = [];

        try {
          const extraResponse = await fetch("./data/recipes-fe-010.json", {cache:"no-store"});
          if (extraResponse.ok) extraRecipes = await extraResponse.json();
        } catch (_) {}

        const merged = [
          ...(Array.isArray(baseRecipes) ? baseRecipes : []),
          ...(Array.isArray(extraRecipes) ? extraRecipes : [])
        ];

        const response = new Response(JSON.stringify(merged), {
          headers: {"Content-Type":"application/json", "Cache-Control":"no-store"}
        });

        caches.open(CACHE_NAME).then(c => c.put(event.request, response.clone()));
        return response;
      } catch (_) {
        return caches.match(event.request);
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
