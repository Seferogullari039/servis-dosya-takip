import {
  ensureFirebaseMessagingServiceWorker,
  getFirebaseMessaging,
} from "@/lib/firebase/client";
import { getFirebasePublicConfig } from "@/lib/firebase/config";
import { isFirebasePublicConfigured } from "@/lib/firebase/public-env";
import {
  canRequestPushPermissionOnDevice,
  detectPushDeviceType,
  isPushEnvironmentSupported,
} from "@/lib/push/device";
import {
  formatRegisterApiError,
  registerFcmTokenViaApi,
} from "@/lib/push/register-client";
import { getToken } from "firebase/messaging";
import type { PushDeviceType, PushRegisterApiResponse } from "@/types/push";

export type EnablePushFailureReason =
  | "firebase_not_configured"
  | "ios_needs_home_screen"
  | "unsupported"
  | "permission_denied"
  | "sw_unreachable"
  | "messaging_unsupported"
  | "token_failed"
  | "register_failed";

export type EnablePushResult =
  | { ok: true; token: string; registerApi?: PushRegisterApiResponse }
  | {
      ok: false;
      reason: EnablePushFailureReason;
      message: string;
      registerApi?: PushRegisterApiResponse | null;
      registerErrorDetail?: string;
    };

export {
  canRequestPushPermissionOnDevice,
  getDeviceLabel,
  isIosStandalonePwa,
  isPushEnvironmentSupported,
} from "@/lib/push/device";

export async function enablePushNotifications(): Promise<EnablePushResult> {
  if (!isFirebasePublicConfigured()) {
    return {
      ok: false,
      reason: "firebase_not_configured",
      message: "Bildirim ayarları henüz tamamlanmamış.",
    };
  }

  if (!isPushEnvironmentSupported()) {
    return {
      ok: false,
      reason: "unsupported",
      message: "Bu tarayıcı push bildirimlerini desteklemiyor.",
    };
  }

  if (!canRequestPushPermissionOnDevice()) {
    return {
      ok: false,
      reason: "ios_needs_home_screen",
      message:
        "iPhone’da bildirim için uygulamayı Safari’den Ana Ekrana ekleyip oradan açmanız gerekir.",
    };
  }

  const swRegistration = await ensureFirebaseMessagingServiceWorker();
  if (!swRegistration) {
    return {
      ok: false,
      reason: "sw_unreachable",
      message:
        "Bildirim servisi yüklenemedi. Sayfayı yenileyin veya site yöneticisine bildirin.",
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      reason: "permission_denied",
      message:
        permission === "denied"
          ? "Bildirim izni reddedildi. Tarayıcı ayarlarından izin verebilirsiniz."
          : "Bildirim izni verilmedi.",
    };
  }

  const config = getFirebasePublicConfig();
  if (!config) {
    return {
      ok: false,
      reason: "firebase_not_configured",
      message: "Bildirim ayarları henüz tamamlanmamış.",
    };
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return {
      ok: false,
      reason: "messaging_unsupported",
      message: "Bu cihazda Firebase bildirimleri desteklenmiyor.",
    };
  }

  let token: string | null = null;
  try {
    token = await getToken(messaging, {
      vapidKey: config.vapidKey,
      serviceWorkerRegistration: swRegistration,
    });
  } catch {
    token = null;
  }

  if (!token) {
    return {
      ok: false,
      reason: "token_failed",
      message: "Bildirim anahtarı alınamadı. Tekrar deneyin.",
    };
  }

  const kind = detectPushDeviceType();
  const deviceType: PushDeviceType =
    kind === "ios" || kind === "android" || kind === "web" ? kind : "unknown";

  const register = await registerFcmTokenViaApi(token, deviceType);

  if (!register.ok) {
    const detail =
      register.api?.debug?.errorCategoryLabel ??
      formatRegisterApiError(register.api, register.errorMessage);
    return {
      ok: false,
      reason: "register_failed",
      message: "Token veritabanına kaydedilemedi",
      registerApi: register.api,
      registerErrorDetail: detail,
    };
  }

  return {
    ok: true,
    token,
    registerApi: register.api ?? undefined,
  };
}
