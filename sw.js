/* Edwards Financial & Associates — service worker
 *
 * Lives at the site root on purpose. A service worker can only control pages at
 * or below its own path, so this must not move into a subfolder.
 *
 * Deliberately has NO fetch handler. This worker exists only to receive push
 * messages; it must never sit between the site and the network, because doing so
 * would let a stale cache serve stale calculators.
 */

const DESK_URL = '/portal-partner-daily-desk';
const ICON     = '/icon-512.png';

self.addEventListener('install', function (event) {
  // Take over straight away rather than waiting for every tab to close.
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  let payload = {};
  if (event.data) {
    try { payload = event.data.json(); }
    catch (e) { payload = { body: event.data.text() }; }
  }

  const title = payload.title || 'Daily Desk';
  const options = {
    body: payload.body || 'You have touches due today.',
    icon: payload.icon || ICON,
    badge: payload.badge || ICON,
    // One tag means a second push replaces the first rather than stacking.
    tag: payload.tag || 'daily-desk',
    renotify: true,
    requireInteraction: false,
    data: { url: payload.url || DESK_URL },
  };

  // waitUntil keeps the worker alive until the notification is actually shown.
  // Chrome shows its own "site updated in the background" notice if we do not.
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const target = (event.notification.data && event.notification.data.url) || DESK_URL;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      // Focus the desk if it is already open anywhere, rather than opening a second copy.
      for (const client of list) {
        if (client.url.indexOf(target) !== -1 && 'focus' in client) return client.focus();
      }
      // Otherwise focus any open tab of ours and send it to the desk.
      for (const client of list) {
        if ('navigate' in client && 'focus' in client) {
          return client.navigate(target).then(function (c) { return (c || client).focus(); });
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
