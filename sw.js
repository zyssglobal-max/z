const CACHE_NAME = 'z-main-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.png'
];
self.addEventListener('install', event => {
    console.log('⚙️ SW instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cacheando recursos...');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});
self.addEventListener('activate', event => {
    console.log('✅ SW activado');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        console.log('🗑️ Eliminando cache viejo:', name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                const fetchRequest = event.request.clone();
                return fetch(fetchRequest)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                try {
                                    cache.put(event.request, responseToCache);
                                } catch (e) {
                                }
                            });
                        return response;
                    })
                    .catch(() => {
                        return new Response('🔴 Sin conexión\n\nPero Z-MAiN sigue disponible', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});
