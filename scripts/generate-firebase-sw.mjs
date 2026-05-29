/**
 * .env.local → public/firebase-messaging-sw.js (FCM background handler)
 * NEXT_PUBLIC_* Firebase değişkenleri gerekli.
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnvLocal } from "./load-env.mjs";

const root = path.resolve(import.meta.dirname, "..");
loadEnvLocal(true);

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

const hasConfig = Boolean(config.apiKey && config.projectId && config.messagingSenderId);

const sw = `/* Otomatik üretildi — scripts/generate-firebase-sw.mjs */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

const firebaseConfig = ${JSON.stringify(config, null, 2)};

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
`;

const outPath = path.join(root, "public", "firebase-messaging-sw.js");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, sw, "utf8");

if (hasConfig) {
  console.log("[generate-firebase-sw] yazıldı:", outPath);
} else {
  console.warn(
    "[generate-firebase-sw] Firebase env eksik — SW şablonu yazıldı, push devre dışı kalabilir."
  );
}
