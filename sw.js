// A minimalist service worker to enable PWA installability.
self.addEventListener('install', (event) => {
  // The service worker is being installed.
  console.log('Service Worker installing.');
});

self.addEventListener('fetch', (event) => {
  // This service worker doesn't intercept any fetches.
  // It's just here to make the app installable.
});
