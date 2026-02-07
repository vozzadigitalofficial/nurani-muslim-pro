const CACHE_NAME = 'nurani-sovereign-v4.1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.jpg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Strategi Khusus API (Prioritas Internet agar Jadwal Akurat)
  if (url.hostname.includes('api.myquran.com')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request)) // Jika offline, ambil data lama
    );
    return;
  }

  // Strategi Aset Statis (Prioritas Cache agar Loading Cepat)
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});