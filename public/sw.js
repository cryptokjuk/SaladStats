// Salad Stats Service Worker - network-first for API, cache for statics
const CACHE_NAME = 'salad-stats-v5';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = [OFFLINE_URL, '/salad-stats-logo-icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Never cache auth routes
  if (url.pathname.startsWith('/api/auth')) return;
  // Network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  // Network-first for navigations
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))
      )
    );
    return;
  }
  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// Clear caches on message (used during sign-in/sign-out)
self.addEventListener('message', (event) => {
  if (event.data === 'CLEAR_CACHES') {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }
});
