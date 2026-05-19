'use strict';
// MyVivaio Service Worker — skip-waiting update pattern
// Bump CACHE_NAME on each deploy to trigger update detection
const CACHE_NAME    = 'myvivaio-v9';
const RUNTIME_CACHE = 'myvivaio-runtime-v9';

// Files to precache (app shell)
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-96.png',
  '/icons/icon-144.png'
];

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
        keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE).map(k => caches.delete(k))
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

  const accept = request.headers.get('accept') || '';

  // ── Navigation / HTML: network-first → fallback to cached shell ──────────
  if (request.mode === 'navigate' || accept.includes('text/html')) {
    e.respondWith(
      fetch(request)
        .then(resp => {
          if (resp.status === 200 && (resp.type === 'basic' || resp.type === 'cors')) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return resp;
        })
        .catch(() =>
          caches.match(request)
            .then(r => r || caches.match('/'))
            .then(r => r || caches.match('/index.html'))
        )
    );
    return;
  }

  // ── Static assets with hash (Vite/esbuild bundles) or known extensions: cache-first ──
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    /\.(js|css|woff2?|png|jpe?g|svg|ico)(\?.*)?$/.test(url.pathname);

  if (isStaticAsset) {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(resp => {
          if (resp.status === 200 && (resp.type === 'basic' || resp.type === 'cors')) {
            const clone = resp.clone();
            caches.open(RUNTIME_CACHE).then(c => c.put(request, clone));
          }
          return resp;
        });
      })
    );
    return;
  }

  // ── Everything else: network-first → fallback to cache ───────────────────
  e.respondWith(
    fetch(request)
      .then(resp => {
        if (resp.status === 200 && (resp.type === 'basic' || resp.type === 'cors')) {
          const clone = resp.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(request))
  );
});

// ── Push notification handler ──────────────────────────────────────────────
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? JSON.parse(e.data.text()) : {}; } catch {}

  const title = data.title || 'MyVivaio';
  const body  = data.body  || '';
  const url   = data.url   || '/';
  const tag   = data.tag   || 'myvivaio';

  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:              '/icons/icon-192.png',
      badge:             '/icons/icon-96.png',
      tag,
      data:              { url },
      requireInteraction: false,
      vibrate:           [200, 100, 200],
    }).then(() => {
      if ('setAppBadge' in navigator) navigator.setAppBadge(1).catch(() => {});
    })
  );
});

// ── Notification click → open/focus app and navigate ──────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if ('clearAppBadge' in navigator) navigator.clearAppBadge().catch(() => {});
  const url = (e.notification.data && e.notification.data.url) || '/';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // If the app is already open, focus it and send a navigate message
      for (const c of list) {
        if (c.url && c.url.startsWith(self.registration.scope) && 'focus' in c) {
          c.postMessage({ type: 'PUSH_NAVIGATE', url });
          return c.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── Message handler — main app can send SKIP_WAITING to apply update ───────
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
