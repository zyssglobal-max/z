// Service Worker para Z-NOS Portal
const CACHE_NAME = 'z-nos-v1';
const urlsToCache = [
    '/',
    '/pwa.html',
    '/favicon.png'
];

// Instalación
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

// Activación
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

// Fetch (offline support)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone request para fetch
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone para cache
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                try {
                                    cache.put(event.request, responseToCache);
                                } catch (e) {
                                    // Ignorar errores de cache
                                }
                            });

                        return response;
                    })
                    .catch(() => {
                        // Offline fallback
                        return new Response('🔴 Sin conexión\n\nPero Z-NOS sigue disponible', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});
