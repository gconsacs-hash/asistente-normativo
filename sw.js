/* Service worker del Asistente Normativo: guarda la app para usarla sin conexión.
   Al cambiar cualquier archivo, sube VERSION para que los teléfonos reciban la nueva copia. */
const VERSION = "v1";
const CACHE = "asistente-normativo-" + VERSION;
const ARCHIVOS = [
  "./", "./index.html", "./manifest.json",
  "./lib/jszip.min.js", "./lib/pdf.min.js", "./lib/pdf.worker.min.js",
  "./assets/icono-192.png", "./assets/icono-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Archivos propios: red primero (para recibir cambios) y caché si no hay conexión.
// Recursos externos (fuentes, API de Pollinations): siempre red.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then((r) => { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
