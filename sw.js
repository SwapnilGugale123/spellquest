// sw.js — offline cache for standalone/installed use (PWA).
// Bump CACHE_VERSION whenever any cached file changes so installed devices
// pick up the update instead of serving a stale copy forever.
const CACHE_VERSION = 'spellquest-v3';
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
  'assets/words/cat.mp3',
  'assets/words/dog.mp3',
  'assets/words/sun.mp3',
  'assets/words/red.mp3',
  'assets/words/box.mp3',
  'assets/words/egg.mp3',
  'assets/words/ball.mp3',
  'assets/words/fish.mp3',
  'assets/words/milk.mp3',
  'assets/words/star.mp3',
  'assets/words/rain.mp3',
  'assets/words/tree.mp3',
  'assets/words/ring.mp3',
  'assets/words/pink.mp3',
  'assets/words/gift.mp3',
  'assets/words/corn.mp3',
  'assets/words/long.mp3',
  'assets/words/pond.mp3',
  'assets/words/circle.mp3',
  'assets/words/fifteen.mp3',
  'assets/words/eighteen.mp3',
  'assets/words/twenty.mp3',
  'assets/words/nose.mp3',
  'assets/words/tongue.mp3',
  'assets/words/blue.mp3',
  'assets/words/green.mp3',
  'assets/words/white.mp3',
  'assets/words/thirty.mp3',
  'assets/words/oval.mp3',
  'assets/words/curd.mp3',
  'assets/words/drum.mp3',
  'assets/words/girl.mp3',
  'assets/words/pune.mp3',
  'assets/words/black.mp3',
  'assets/words/bulb.mp3',
  'assets/words/under.mp3',
  'assets/words/apple.mp3',
  'assets/words/river.mp3',
  'assets/words/bridge.mp3',
  'assets/words/inside.mp3',
  'assets/words/outside.mp3',
  'assets/words/car.mp3',
  'assets/words/van.mp3',
  'assets/words/bike.mp3',
  'assets/words/cycle.mp3',
  'assets/words/bird.mp3',
  'assets/words/garden.mp3',
  'assets/words/cloud.mp3',
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
