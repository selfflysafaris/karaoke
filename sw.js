// Sonic Karaoke — Service Worker
// Caches the song list and app shell for offline use

const CACHE = 'sonic-karaoke-v1';
const PRECACHE = [
  './',
  './index.html',
  './songs.json'
];

// Install: cache everything immediately
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      console.log('[SW] Pre-caching app shell and song list…');
      return cache.addAll(PRECACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
//   songs.json → Cache first (it never changes mid-evening; huge file)
//   index.html → Network first, cache fallback
//   Firebase requests → Network only (never cache live queue data)
//   Everything else → Cache first, network fallback
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Never intercept Firebase or Google Fonts
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com')) {
    return;
  }

  // songs.json: cache-first (massive file, doesn't change during an event)
  if (url.pathname.endsWith('songs.json')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // HTML pages: network-first so updates are picked up, fall back to cache
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Default: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      });
    })
  );
});
