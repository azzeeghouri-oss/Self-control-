// Aegis Guard Service Worker for Android background notifications and alarm triggers
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  const { type, title, body, tag, requireInteraction } = event.data;

  if (type === 'SCHEDULE_ALARM') {
    const delay = event.data.delay || 0;
    setTimeout(() => {
      self.registration.showNotification(title || 'Time Expired!', {
        body: body || 'Productivity timer expired. Apps are locked by Device Policy.',
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [500, 200, 500, 200, 500],
        tag: tag || 'timer-alarm',
        requireInteraction: requireInteraction !== undefined ? requireInteraction : true,
        actions: [
          { action: 'open_app', title: 'Open Aegis Guard' },
          { action: 'dismiss', title: 'Dismiss Alarm' }
        ]
      });
    }, delay);
  } else if (type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(title || 'Aegis Guard', {
      body: body || '',
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200],
      tag: tag || 'general-notif'
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
