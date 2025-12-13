const CACHE = "scoutpro-ai-v1";
const ASSETS = [
  "./",
  "./scoutpro_pwa.html",
  "./scoutpro_manifest.json",
  "./scoutpro_sw.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE) ? caches.delete(k) : Promise.resolve()));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.url.includes("api.keepa.com") || req.url.includes("corsproxy.io")) {
    event.respondWith(fetch(req).catch(() => caches.match("./scoutpro_pwa.html")));
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const res = await fetch(req);
    const cache = await caches.open(CACHE);
    cache.put(req, res.clone());
    return res;
  })());
});
