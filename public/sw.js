/**
 * Careingo Service Worker
 * يضمن استقرار التطبيق في وضع الـ PWA Standalone
 */

const CACHE_NAME = 'careingo-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // السماح بمرور كافة الطلبات للعمل مع Firebase بشكل طبيعي
  event.respondWith(fetch(event.request));
});
