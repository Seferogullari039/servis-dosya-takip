import type { PushNotificationPayload } from "@/types/push";

const ICON_PATH = "/icons/icon-192.png";
const BADGE_PATH = "/icons/badge-72.png";

/** iOS PWA webpush.fcm_options.link için mutlak URL */
export function resolvePushAbsoluteUrl(path: string): string {
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`
      : "");

  const pathOnly = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return base ? `${base}${pathOnly}` : pathOnly;
}

export type FcmMulticastFields = {
  notification: { title: string; body: string };
  data: Record<string, string>;
  webpush: {
    notification: {
      title: string;
      body: string;
      icon: string;
      badge: string;
      tag: string;
      requireInteraction: false;
    };
    fcmOptions: { link: string };
  };
};

/** FCM multicast — iOS PWA uyumlu notification + data + webpush */
export function buildFcmMulticastFields(
  payload: PushNotificationPayload
): FcmMulticastFields {
  const link = resolvePushAbsoluteUrl(payload.url);
  const icon = resolvePushAbsoluteUrl(ICON_PATH);
  const badge = resolvePushAbsoluteUrl(BADGE_PATH);
  const tag = payload.tag ?? "seferogullari-ops";
  const workOrderId = payload.workOrderId ?? "";

  const data: Record<string, string> = {
    title: payload.title,
    body: payload.body,
    url: payload.url,
    link,
    workOrderId,
    tag,
    icon: ICON_PATH,
  };

  return {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data,
    webpush: {
      notification: {
        title: payload.title,
        body: payload.body,
        icon,
        badge,
        tag,
        requireInteraction: false,
      },
      fcmOptions: {
        link,
      },
    },
  };
}
