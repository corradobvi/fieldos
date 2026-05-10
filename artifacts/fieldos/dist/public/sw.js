/* MyVivaio Service Worker — PWA + Push Notifications */
'use strict';

const CACHE_NAME = 'myvivaio-v1';
const CACHE_URLS = ['/'];

// ── Install: cache app shell
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: network-first, fallback to cache for navigation
self.addEventListener('fetch', (evt) => {
  if (evt.request.method !== 'GET') return;
  const url = new URL(evt.request.url);
  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;
  // API calls: always network
  if (url.pathname.startsWith('/api/')) return;

  evt.respondWith(
    fetch(evt.request)
      .then(res => {
        // Cache successful navigation responses
        if (res.ok && evt.request.mode === 'navigate') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(evt.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(evt.request).then(r => r || caches.match('/')))
  );
});

// ── Push: show notification
self.addEventListener('push', (evt) => {
  let data = { title: 'MyVivaio', body: 'Hai un nuovo aggiornamento', type: 'info', url: '/' };
  try { data = { ...data, ...evt.data.json() }; } catch (_) {}

  const icon = '/icons/icon-192.png';
  const badge = '/icons/icon-72.png';

  const options = {
    body: data.body || '',
    icon,
    badge,
    tag: data.tag || data.type || 'default',
    renotify: true,
    requireInteraction: data.type === 'urgente' || data.type === 'quota_scaduta',
    data: { url: data.url || '/', type: data.type },
    vibrate: data.type === 'urgente' ? [200, 100, 200, 100, 200] : [200],
    actions: data.url && data.url !== '/'
      ? [{ action: 'open', title: 'Apri' }]
      : []
  };

  evt.waitUntil(
    self.registration.showNotification(data.title || 'MyVivaio', options)
  );
});

// ── Notification click: focus or open the app
self.addEventListener('notificationclick', (evt) => {
  evt.notification.close();
  const targetUrl = (evt.notification.data && evt.notification.data.url) || '/';

  evt.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // If already open, focus and navigate
      for (const client of clients) {
        if ('focus' in client) {
          client.postMessage({ type: 'PUSH_NAVIGATE', url: targetUrl });
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(targetUrl);
    })
  );
});
