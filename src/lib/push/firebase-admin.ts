import type { PushNotificationPayload } from "@/types/push";

type AdminMessaging = import("firebase-admin/messaging").Messaging;

let messaging: AdminMessaging | null = null;
let initAttempted = false;

async function getAdminMessaging(): Promise<AdminMessaging | null> {
  if (initAttempted) return messaging;
  initAttempted = true;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;

  try {
    const admin = await import("firebase-admin");
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(json) as Record<string, string>;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    messaging = admin.messaging();
    return messaging;
  } catch (e) {
    console.warn("[push] Firebase Admin init failed:", e);
    return null;
  }
}

export async function sendPushToTokens(
  tokens: string[],
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  const msg = await getAdminMessaging();
  if (!msg || tokens.length === 0) return { sent: 0, failed: 0 };

  const unique = [...new Set(tokens.filter(Boolean))];
  const data: Record<string, string> = {
    title: payload.title,
    body: payload.body,
    url: payload.url,
    link: payload.url,
    tag: payload.tag ?? "seferogullari-ops",
    icon: "/icons/icon-192.png",
  };
  if (payload.badge !== undefined) {
    data.badge = String(payload.badge);
  }

  let sent = 0;
  let failed = 0;
  const chunkSize = 500;

  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    try {
      const response = await msg.sendEachForMulticast({
        tokens: chunk,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data,
        webpush: {
          fcmOptions: { link: payload.url },
          notification: {
            icon: "/icons/icon-192.png",
            badge: "/icons/badge-72.png",
            vibrate: [120, 60, 120],
          },
        },
        apns: {
          payload: {
            aps: {
              badge: payload.badge,
              sound: "default",
            },
          },
        },
      });
      sent += response.successCount;
      failed += response.failureCount;
    } catch (e) {
      console.warn("[push] multicast failed:", e);
      failed += chunk.length;
    }
  }

  return { sent, failed };
}
