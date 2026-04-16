// Zeat Service Worker — handles push notifications + basic caching
const CACHE_NAME = "zeat-v1";

// ── Install: cache app shell ──────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/", "/manifest.json", "/icon.svg"])
    )
  );
});

// ── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Push: show notification ──────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "Zeat", body: event.data.text() };
  }

  const { title = "Zeat", body = "", url = "/dashboard/orders", icon = "/icon.svg", badge = "/icon.svg" } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag: "zeat-order",
      renotify: true,
      requireInteraction: true,
      data: { url },
      actions: [
        { action: "open", title: "Voir la commande" },
        { action: "dismiss", title: "Ignorer" },
      ],
      vibrate: [200, 100, 200],
    })
  );
});

// ── Notification click ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url ?? "/dashboard/orders";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // If dashboard already open, focus it
        const existing = clients.find(
          (c) => c.url.includes("/dashboard") && "focus" in c
        );
        if (existing) {
          existing.focus();
          existing.navigate(targetUrl);
          return;
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
