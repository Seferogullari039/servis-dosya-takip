"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import { getFirebasePublicConfig } from "@/lib/firebase/config";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  const config = getFirebasePublicConfig();
  if (!config) return null;
  if (!getApps().length) {
    app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });
  }
  return app ?? getApps()[0] ?? null;
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  if (!supported) return null;
  const firebaseApp = await getFirebaseApp();
  if (!firebaseApp) return null;
  if (!messaging) {
    messaging = getMessaging(firebaseApp);
  }
  return messaging;
}

/** Production’da firebase-messaging-sw.js erişilebilir mi */
export async function checkFirebaseMessagingSwReachable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch("/firebase-messaging-sw.js", {
      method: "HEAD",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ensureFirebaseMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  const reachable = await checkFirebaseMessagingSwReachable();
  if (!reachable) return null;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      const script = reg.active?.scriptURL ?? reg.installing?.scriptURL ?? "";
      if (script.includes("firebase-messaging-sw")) {
        return reg;
      }
    }
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });
  } catch {
    return null;
  }
}

/** @deprecated enablePushNotifications kullanın */
export async function requestFcmToken(): Promise<string | null> {
  const { enablePushNotifications } = await import("@/lib/push/enable-push");
  const result = await enablePushNotifications();
  return result.ok ? result.token : null;
}

export function subscribeForegroundMessages(
  handler: (payload: {
    title: string;
    body: string;
    url?: string;
  }) => void
): (() => void) | null {
  let unsub: (() => void) | undefined;
  void getFirebaseMessaging().then((msg) => {
    if (!msg) return;
    unsub = onMessage(msg, (payload) => {
      const title =
        payload.notification?.title ??
        payload.data?.title ??
        "Seferoğulları Otomotiv";
      const body =
        payload.notification?.body ??
        payload.data?.body ??
        "Yeni bildirim";
      handler({
        title,
        body,
        url: payload.data?.url ?? payload.data?.link,
      });
    });
  });
  return () => unsub?.();
}

export {
  detectPushDeviceType,
  isIosStandalonePwa,
  isPushEnvironmentSupported,
} from "@/lib/push/device";
