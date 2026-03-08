
/**
 * Careingo Service Worker
 * يساعد في استقرار التطبيق عند العمل كـ PWA وتوفير تجربة سريعة.
 */

const CACHE_NAME = 'careingo-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // يكتفي بالتمرير للمتصفح لضمان عدم حدوث تعارض مع API الفايربيس
  event.respondWith(fetch(event.request));
});
