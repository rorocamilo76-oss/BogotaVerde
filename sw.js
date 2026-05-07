// KOAJ – Service Worker
const CACHE = 'koaj-v1';
const ARCHIVOS = [
  '/BogotaVerde/',
  '/BogotaVerde/index.html',
  '/BogotaVerde/style.css',
  '/BogotaVerde/script.js',
  '/BogotaVerde/icon.svg',
  '/BogotaVerde/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARCHIVOS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
