"use client";

import {
  ensureFirebaseMessagingServiceWorker,
  getFirebaseMessaging,
} from "@/lib/firebase/client";
import { getFirebasePublicConfig } from "@/lib/firebase/config";
import { isFirebasePublicConfigured } from "@/lib/firebase/public-env";
import {
  detectPushDeviceType,
  isPushEnvironmentSupported,
} from "@/lib/push/device";
import type { EnablePushResult } from "@/lib/push/enable-push";
import { enablePushNotifications } from "@/lib/push/enable-push";
import { deleteToken, getToken } from "firebase/messaging";
import type { PushDeviceType } from "@/types/push";

export function readNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isPushEnvironmentSupported()) return "unsupported";
  return Notification.permission;
}

/** İzin verilmişse mevcut FCM token'ı okur (izin istemez). */
export async function readLocalFcmToken(): Promise<{
  token: string | null;
  error?: string;
}> {
  if (!isFirebasePublicConfigured()) {
    return { token: null, error: "Firebase public env eksik" };
  }
  if (!isPushEnvironmentSupported()) {
    return { token: null, error: "Push desteklenmiyor" };
  }
  if (Notification.permission !== "granted") {
    return { token: null, error: "Bildirim izni yok" };
  }

  const swRegistration = await ensureFirebaseMessagingServiceWorker();
  if (!swRegistration) {
    return { token: null, error: "Service worker hazır değil" };
  }

  const config = getFirebasePublicConfig();
  if (!config) {
    return { token: null, error: "Firebase yapılandırması eksik" };
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return { token: null, error: "Firebase Messaging desteklenmiyor" };
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: config.vapidKey,
      serviceWorkerRegistration: swRegistration,
    });
    return { token: token || null };
  } catch (e) {
    return {
      token: null,
      error: e instanceof Error ? e.message : "getToken başarısız",
    };
  }
}

async function resetAllPushSubscriptionsOnServer(): Promise<boolean> {
  const res = await fetch("/api/push/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reset_all" }),
  });
  return res.ok;
}

/** Tüm DB kayıtlarını siler, FCM token'ı yeniler ve tekrar kaydeder. */
export async function regeneratePushToken(): Promise<EnablePushResult> {
  await resetAllPushSubscriptionsOnServer();

  if (isPushEnvironmentSupported() && Notification.permission === "granted") {
    const messaging = await getFirebaseMessaging();
    if (messaging) {
      try {
        await deleteToken(messaging);
      } catch {
        /* ignore */
      }
    }
  }

  return enablePushNotifications();
}
