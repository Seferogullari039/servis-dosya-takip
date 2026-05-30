/* Otomatik üretildi — scripts/generate-firebase-sw.mjs — 2026-05-30T01:47:56.596Z */
importScripts("/firebase-push-handler.js");
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
    return showFcmNotification(payload, "onBackgroundMessage");
  });
} else {
  console.warn("[firebase-messaging-sw] Firebase config eksik — FCM handler devre dışı");
}
