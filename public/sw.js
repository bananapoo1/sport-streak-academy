// Service Worker for Push Notifications
const CACHE_NAME = 'sportivo-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: '🏆 Training Reminder',
    body: "Don't forget to complete your daily training!",
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'streak-reminder',
    data: {
      url: '/',
    },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      { action: 'open', title: 'Start Training' },
      { action: 'dismiss', title: 'Later' },
    ],
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          const url = event.notification.data?.url || '/';
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  
  if (event.tag === 'streak-check') {
    event.waitUntil(checkStreak());
  }
});

// Periodic sync for streak reminders
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'streak-reminder') {
    event.waitUntil(sendStreakReminder());
  }
});

async function checkStreak() {
  // This would check if user has trained today
  console.log('[SW] Checking streak status...');
}

async function sendStreakReminder() {
  const now = new Date();
  const hour = now.getHours();
  
  // Only send reminders during reasonable hours (9 AM - 9 PM)
  if (hour >= 9 && hour <= 21) {
    self.registration.showNotification("🔥 Keep Your Streak Alive!", {
      body: "You haven't trained today. Complete a quick drill to maintain your streak!",
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'streak-reminder',
      vibrate: [200, 100, 200],
      data: { url: '/sports' },
      actions: [
        { action: 'open', title: 'Train Now' },
        { action: 'dismiss', title: 'Later' },
      ],
    });
  }
}
