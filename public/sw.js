const CACHE = "punto-medio-v2";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/abridorruleta.png",
  "./assets/aguja.png",
  "./assets/puntomedioabierto.png",
  "./assets/puntomedioabiertosinnada.png",
  "./assets/puntomediocerrado.png",
  "./assets/puntomediocerradosinagujaniabridor.png",
  "./assets/puntuaciones.png",
  "./assets/wheel/parts/background-white.png",
  "./assets/wheel/parts/gear-ring.png",
  "./assets/wheel/parts/needle.png",
  "./assets/wheel/parts/opener.png",
  "./assets/wheel/parts/score-fan.png",
  "./assets/wheel/parts/screen-mint.png",
  "./assets/wheel/parts/shell-blue.png",
];

async function precacheShell() {
  const cache = await caches.open(CACHE);
  await cache.addAll(SHELL);

  // Vite hashes JS/CSS names. Discover them from the built HTML so each
  // production build can be installed offline without hand-maintaining hashes.
  const indexResponse = await fetch("./index.html", { cache: "no-store" });
  const index = await indexResponse.text();
  const assets = [...index.matchAll(/(?:src|href)=["'](\.\/)?(assets\/[^"']+)["']/g)]
    .map((match) => `./${match[2]}`);
  await cache.addAll([...new Set(assets)]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => undefined);
      }
      return response;
    })).catch((error) => {
      if (event.request.mode === "navigate") return caches.match("./index.html");
      throw error;
    }),
  );
});
