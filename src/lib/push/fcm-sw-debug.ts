"use client";

const FCM_DEBUG_CACHE = "fcm-debug-v1";
const FCM_DEBUG_KEY = "/last-fcm-background";

export interface FcmBackgroundPayloadDebug {
  at: string;
  source: string;
  notification: { title?: string; body?: string } | null;
  data: Record<string, string>;
}

export interface FcmServiceWorkerDebug {
  fcmSwReachable: boolean;
  fcmMessagingSwRegistered: boolean;
  fcmMessagingSwScriptUrl: string | null;
  controllingSwScriptUrl: string | null;
  pushHandlerInWorkboxSw: boolean;
  lastBackgroundPayload: FcmBackgroundPayloadDebug | null;
  lastBackgroundReadError: string | null;
}

export async function readFcmServiceWorkerDebug(): Promise<FcmServiceWorkerDebug> {
  const base: FcmServiceWorkerDebug = {
    fcmSwReachable: false,
    fcmMessagingSwRegistered: false,
    fcmMessagingSwScriptUrl: null,
    controllingSwScriptUrl: null,
    pushHandlerInWorkboxSw: false,
    lastBackgroundPayload: null,
    lastBackgroundReadError: null,
  };

  if (typeof window === "undefined") return base;

  try {
    const res = await fetch("/firebase-messaging-sw.js", {
      method: "HEAD",
      cache: "no-store",
    });
    base.fcmSwReachable = res.ok;
  } catch {
    base.fcmSwReachable = false;
  }

  try {
    const handlerRes = await fetch("/firebase-push-handler.js", {
      method: "HEAD",
      cache: "no-store",
    });
    base.pushHandlerInWorkboxSw = handlerRes.ok;
  } catch {
    base.pushHandlerInWorkboxSw = false;
  }

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      const script =
        reg.active?.scriptURL ??
        reg.installing?.scriptURL ??
        reg.waiting?.scriptURL ??
        "";
      if (script.includes("firebase-messaging-sw")) {
        base.fcmMessagingSwRegistered = true;
        base.fcmMessagingSwScriptUrl = script;
      }
    }

    if (navigator.serviceWorker.controller?.scriptURL) {
      base.controllingSwScriptUrl = navigator.serviceWorker.controller.scriptURL;
      if (base.controllingSwScriptUrl.includes("/sw.js")) {
        base.pushHandlerInWorkboxSw = true;
      }
    }
  }

  try {
    const cache = await caches.open(FCM_DEBUG_CACHE);
    const res = await cache.match(FCM_DEBUG_KEY);
    if (res) {
      const json = (await res.json()) as FcmBackgroundPayloadDebug;
      base.lastBackgroundPayload = json;
    }
  } catch (e) {
    base.lastBackgroundReadError =
      e instanceof Error ? e.message : "Cache okunamadı";
  }

  return base;
}
