/* Edwards Presentation Library: offline support for /library/ only.
   Network first, so you always get the latest version when online; the saved copy is used
   only when the network is unavailable. */
const V = 'efa-lib-66fb6c322a';
const FILES = ["./", "apple-touch-icon.png", "css/app.css", "css/fonts.css", "favicon-32.png", "fonts/cormorant-garamond-latin-400-normal.woff2", "fonts/cormorant-garamond-latin-500-italic.woff2", "fonts/cormorant-garamond-latin-500-normal.woff2", "fonts/cormorant-garamond-latin-600-normal.woff2", "fonts/cormorant-garamond-latin-700-normal.woff2", "fonts/dm-sans-latin-400-normal.woff2", "fonts/dm-sans-latin-500-normal.woff2", "fonts/dm-sans-latin-600-normal.woff2", "fonts/dm-sans-latin-700-normal.woff2", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "js/art.js", "js/catalog.js", "js/core.js", "js/data-history.js", "js/data-rules.js", "js/fmt.js", "js/icons.js", "js/lib/bullets.js", "js/lib/life.js", "js/lib/overlays.js", "js/lib/pem.js", "js/lib/worksheet.js", "js/screens/b01.js", "js/screens/b02.js", "js/screens/b03.js", "js/screens/b04.js", "js/screens/b05.js", "js/screens/b06.js", "js/screens/b07.js", "js/screens/b08.js", "js/screens/b09.js", "js/screens/b10.js", "js/screens/b11.js", "js/screens/b12.js", "js/screens/b13.js", "js/screens/b14.js", "js/screens/b15.js", "js/screens/b16.js", "js/screens/circle-talk.js", "js/screens/ha.js", "js/screens/nextgen.js", "js/screens/nextgen2.js", "js/screens/pem.js", "js/sync-supabase.js", "manifest.webmanifest"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('efa-lib-') && k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const mine = url.origin === location.origin && url.pathname.startsWith('/library/');
  const cdn = url.hostname === 'cdn.jsdelivr.net';
  if (!mine && !cdn) return;
  e.respondWith(fetch(req).then((res) => {
    if (res && res.ok && !res.redirected) { const copy = res.clone(); caches.open(V).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./') : undefined))));
});
