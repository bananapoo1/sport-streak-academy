// Service Worker for Push Notifications

const deepLinkToPath = (deepLink) => {
  if (!deepLink) return "/";
  if (deepLink.startsWith("sportstreak://")) {
    const route = deepLink.replace("sportstreak://", "/");
    return route.startsWith("/") ? route : `/${route}`;
  }
  if (deepLink.startsWith("/")) return deepLink;
  return "/";
};

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "🏆 Training Reminder",
    body: "Don't forget to complete your daily training!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "streak-reminder",
    data: {
      deepLink: "sportstreak://drills",
    },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      vibrate: [200, 100, 200],
      data: data.data,
      actions: [
        { action: "open", title: "Start Training" },
        { action: "dismiss", title: "Later" },
      ],
      requireInteraction: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const deepLink = event.notification.data?.deepLink;
  const path = deepLinkToPath(deepLink);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.postMessage({ type: "OPEN_DEEP_LINK", deepLink });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(`${path}?deeplink=${encodeURIComponent(deepLink || path)}`);
      }
    }),
  );
});
