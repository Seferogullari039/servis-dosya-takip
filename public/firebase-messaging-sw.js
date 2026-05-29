/* Otomatik üretildi — scripts/generate-firebase-sw.mjs */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

const firebaseConfig = {
  "apiKey": "",
  "authDomain": "",
  "projectId": "",
  "storageBucket": "",
  "messagingSenderId": "",
  "appId": ""
};

if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(function (payload) {
    const data = payload.data || {};
    const title =
      payload.notification?.title ||
      data.title ||
      "Seferoğulları Otomotiv";
    const body =
      payload.notification?.body ||
      data.body ||
      "Yeni operasyon bildirimi";
    const url = data.url || data.link || "/dashboard";
    const tag = data.tag || "seferogullari-ops";

    const options = {
      body: body,
      icon: data.icon || "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      tag: tag,
      data: { url: url, ...data },
      vibrate: [120, 60, 120],
      requireInteraction: false,
    };

    self.registration.showNotification(title, options);
  });

  self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    const url = event.notification.data?.url || "/dashboard";
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
        for (const client of list) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  });
}
