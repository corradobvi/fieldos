'use strict';
// MyVivaio Service Worker — skip-waiting update pattern
// Bump CACHE_VERSION on each deploy to trigger update detection
const CACHE_VERSION = 'myvivaio-v4';
const CACHE_NAME = 'myvivaio-' + CACHE_VERSION;

// Files to precache (app shell)
const PRECACHE = ['/'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE))
  );
  // Do NOT skipWaiting here — let the main app show the banner first
  // Auto skip after 60 s if the app hasn't responded
  setTimeout(() => self.skipWaiting(), 60000);
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Never intercept API calls or non-GET
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // Network-first strategy: try network, fall back to cache
  e.respondWith(
    fetch(request)
      .then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(request))
  );
});

// Message handler — main app can send SKIP_WAITING to apply update immediately
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
