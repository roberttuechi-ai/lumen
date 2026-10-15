// Minimaler Service Worker: macht die App installierbar (PWA/Android-App) und zeigt
// ohne Netz eine Hinweisseite. Es wird bewusst nichts zwischengespeichert, damit Login,
// Bezahlung und Berechnungen immer frisch vom Server kommen.
const OFFLINE = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lumen – offline</title><style>body{font-family:system-ui,-apple-system,sans-serif;background:#0d0d0e;color:#f2eee6;margin:0;padding:48px 24px;text-align:center}button{margin-top:16px;padding:12px 20px;border-radius:10px;border:0;font:inherit;cursor:pointer}</style></head><body><h1>Keine Internetverbindung</h1><p>Lumen braucht eine Verbindung. Bitte prüfe dein Netz und versuch es erneut.</p><p lang="en">No internet connection – please try again.</p><button onclick="location.reload()">Erneut versuchen / Retry</button></body></html>`;
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
