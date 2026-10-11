const CACHE_NAME = 'bma-fat-v2';

// Alle statischen Ressourcen für den Offline-Betrieb
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './style.css',
    './default.json',
    './js/util.js',
    './js/app.js',
    './js/bmz.js',
    './js/fat.js',
    './js/fbf.js',
    './js/admin.js',
    './js/layout.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png',
    './icons/apple-touch-icon.png'
];

// 1. Installation: Kerndateien vorab in den Cache legen
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Vercache App-Shell Assets');
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// 2. Aktivierung: Alte Caches aufräumen
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Lösche alten Cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Fetch (Network First, Fallback to Cache)
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (new URL(event.request.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(async () => {
                console.log('[Service Worker] Offline-Fallback für:', event.request.url);
                // Seitenaufrufe mit Parametern (z. B. ?scenario=...) auf die gecachte Seite abbilden
                const ignoreSearch = event.request.mode === 'navigate';
                const cached = await caches.match(event.request, { ignoreSearch });
                return cached || Response.error();
            })
    );
});
