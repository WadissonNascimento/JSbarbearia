self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "Nova notificação",
      body: event.data ? event.data.text() : "",
    };
  }

  const title = payload.title || "Nova notificação";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/brands/js-barbearia/app-icon-192.png",
    badge: payload.badge || "/brands/js-barbearia/favicon.png",
    tag: payload.tag || payload.notificationId || undefined,
    renotify: Boolean(payload.tag || payload.notificationId),
    data: {
      notificationId: payload.notificationId || null,
      url: payload.url || "/",
      type: payload.type || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "/",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client && client.url === targetUrl) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }

        return undefined;
      })
  );
});
