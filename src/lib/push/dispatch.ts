import { createAdminClient } from "@/lib/supabase/admin";
import { BRAND } from "@/lib/brand";
import { sendPushToTokens } from "@/lib/push/firebase-admin";
import type { PushNotificationPayload } from "@/types/push";

const TITLE = BRAND.companyName;

/**
 * Operasyon ekibine push gönderir (fire-and-forget).
 * FIREBASE_SERVICE_ACCOUNT_JSON yoksa sessizce atlar.
 */
export async function dispatchTeamPush(
  payload: Omit<PushNotificationPayload, "title"> & { title?: string },
  options?: { excludeUserId?: string }
): Promise<void> {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return;

    const admin = createAdminClient();
    const { data: rows, error } = await admin
      .from("push_subscriptions")
      .select("fcm_token, user_id");

    if (error || !rows?.length) return;

    const tokens = rows
      .filter((r) => r.user_id !== options?.excludeUserId)
      .map((r) => r.fcm_token as string);

    await sendPushToTokens(tokens, {
      title: payload.title ?? TITLE,
      body: payload.body,
      url: payload.url.startsWith("/") ? payload.url : `/${payload.url}`,
      tag: payload.tag,
      badge: payload.badge,
    });
  } catch (e) {
    console.warn("[push] dispatchTeamPush:", e);
  }
}

export function dispatchTeamPushAsync(
  payload: Omit<PushNotificationPayload, "title"> & { title?: string },
  options?: { excludeUserId?: string }
): void {
  void dispatchTeamPush(payload, options);
}
