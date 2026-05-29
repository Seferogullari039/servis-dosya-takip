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
    console.log("[firebase-messaging-sw] onBackgroundMessage", payload);
    const data = payload.data || {};
    const origin = self.location.origin;
    const title =
      payload.notification?.title ||
      data.title ||
      "Seferoğulları Otomotiv";
    const body =
      payload.notification?.body ||
      data.body ||
      "Yeni operasyon bildirimi";
    const url = data.url || data.link || "/dashboard";
    const workOrderId = data.workOrderId || "";
    const tag = data.tag || "seferogullari-ops";
    const iconPath = data.icon || "/icons/icon-192.png";
    const icon =
      iconPath.indexOf("http") === 0 ? iconPath : origin + iconPath;
    const badge = origin + "/icons/badge-72.png";

    const options = {
      body: body,
      icon: icon,
      badge: badge,
      tag: tag,
      requireInteraction: false,
      data: {
        title: title,
        body: body,
        url: url,
        workOrderId: workOrderId,
        link: url,
        ...data,
      },
      vibrate: [120, 60, 120],
    };

    return self.registration.showNotification(title, options);
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
