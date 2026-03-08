const CACHE_NAME = 'careingo-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // استراتيجية Network First لضمان عمل التطبيق بأحدث بيانات مع دعم بسيط للأوفلاين
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
