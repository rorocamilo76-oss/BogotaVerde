// KOAJ – Service Worker Corregido
const CACHE_NAME = 'koaj-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './icon.svg',
  './manifest.json'
];

// Instalación: Guardar archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache KOAJ abierto');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting()) // Fuerza al SW a activarse de inmediato
  );
});

// Activación: Limpiar versiones antiguas de caché e iconos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

// Estrategia de respuesta
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
                 
