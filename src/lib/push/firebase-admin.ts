import { buildFcmMulticastFields } from "@/lib/push/fcm-payload";
import { logPush, logPushError } from "@/lib/push/logger";
import type { SendPushResult } from "@/lib/push/types";
import type { PushNotificationPayload } from "@/types/push";

type AdminMessaging = import("firebase-admin/messaging").Messaging;

let messaging: AdminMessaging | null = null;
let initAttempted = false;
let initError: string | null = null;

export function getFirebaseAdminInitError(): string | null {
  return initError;
}

async function getAdminMessaging(): Promise<AdminMessaging | null> {
  if (initAttempted) return messaging;
  initAttempted = true;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!json) {
    initError = "FIREBASE_SERVICE_ACCOUNT_JSON tanımlı değil";
    logPush("admin", "init skipped — service account env missing");
    return null;
  }

  try {
    const admin = await import("firebase-admin");
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(json) as Record<string, string>;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    messaging = admin.messaging();
    initError = null;
    logPush("admin", "Firebase Admin SDK hazır");
    return messaging;
  } catch (e) {
    initError = e instanceof Error ? e.message : String(e);
    logPushError("admin", "Firebase Admin init failed", e);
    return null;
  }
}

export async function sendPushToTokens(
  tokens: string[],
  payload: PushNotificationPayload
): Promise<SendPushResult> {
  const msg = await getAdminMessaging();
  if (!msg) {
    return {
      sent: 0,
      failed: tokens.length,
      ok: false,
      adminError: initError ?? "Firebase Admin başlatılamadı",
    };
  }

  if (tokens.length === 0) {
    return { sent: 0, failed: 0, ok: true };
  }

  const unique = [...new Set(tokens.filter(Boolean))];
  const fcmFields = buildFcmMulticastFields(payload);

  let sent = 0;
  let failed = 0;
  const fcmErrors: string[] = [];
  const chunkSize = 500;

  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    try {
      const response = await msg.sendEachForMulticast({
        tokens: chunk,
        ...fcmFields,
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              alert: {
                title: payload.title,
                body: payload.body,
              },
              badge: payload.badge,
              sound: "default",
            },
          },
        },
      });
      sent += response.successCount;
      failed += response.failureCount;

      logPush("admin", "FCM multicast batch result", {
        successCount: response.successCount,
        failureCount: response.failureCount,
        payload: {
          notification: fcmFields.notification,
          data: fcmFields.data,
          webpush: fcmFields.webpush,
        },
      });

      response.responses.forEach((r, idx) => {
        const tokenPreview = chunk[idx]?.slice(0, 12) ?? "?";
        if (r.success) {
          logPush("admin", "FCM token send success", {
            tokenPreview,
            messageId: r.messageId,
            title: payload.title,
            body: payload.body,
            url: payload.url,
            workOrderId: payload.workOrderId ?? "",
            webpushLink: fcmFields.webpush.fcmOptions.link,
          });
        } else if (r.error) {
          const errLine = `${tokenPreview}…: ${r.error.code} — ${r.error.message}`;
          fcmErrors.push(errLine);
          logPushError("admin", "FCM token send failed", r.error, {
            tokenPreview,
            code: r.error.code,
            payloadTitle: payload.title,
          });
        }
      });
    } catch (e) {
      logPushError("admin", "multicast batch failed", e, {
        chunkSize: chunk.length,
        payloadTitle: payload.title,
        webpushLink: fcmFields.webpush.fcmOptions.link,
      });
      failed += chunk.length;
      fcmErrors.push(
        e instanceof Error ? e.message : "Multicast gönderimi başarısız"
      );
    }
  }

  const ok = sent > 0 && failed === 0 ? true : sent > 0;
  logPush("admin", "sendPushToTokens complete", {
    sent,
    failed,
    total: unique.length,
    ok,
    payloadSummary: {
      title: payload.title,
      body: payload.body,
      url: payload.url,
      workOrderId: payload.workOrderId,
      webpush: fcmFields.webpush,
    },
  });

  return {
    sent,
    failed,
    ok,
    adminError: initError ?? undefined,
    fcmErrors: fcmErrors.length ? fcmErrors.slice(0, 10) : undefined,
  };
}
