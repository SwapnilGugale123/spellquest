// sw.js — offline cache for standalone/installed use (PWA).
// Bump CACHE_VERSION whenever any cached file changes so installed devices
// pick up the update instead of serving a stale copy forever.
const CACHE_VERSION = 'spellquest-v1';
const PRECACHE = [
  './',
  'index.html',
  'admin.html',
  'manifest.json',
  'css/styles.css',
  'js/app.js',
  'js/audio.js',
  'js/db.js',
  'js/engine.js',
  'js/illustrations.js',
  'js/rewards.js',
  'js/vehicles.js',
  'lib/sql-wasm.js',
  'lib/sql-wasm.wasm',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-192.png',
  'assets/icons/icon-maskable-512.png',
  'assets/icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first for everything precached (app shell); network-first for
// anything else (e.g. data/spellquest.sqlite, which changes as you play —
// always try the freshest copy, fall back to cache only if offline).
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isAppShell = PRECACHE.some(p => url.pathname.endsWith(p.replace('./', '')));
  if (isAppShell) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
