import { BRAND } from "@/lib/brand";
import { sendPushToTokens } from "@/lib/push/firebase-admin";
import { logPush, logPushError } from "@/lib/push/logger";
import { getTeamPushTokens } from "@/lib/push/subscription-queries";
import { isServerPushConfigured } from "@/lib/push/server-config";
import type { DispatchPushResult, PushTestResult } from "@/lib/push/types";
import type { PushNotificationPayload } from "@/types/push";

const TITLE = BRAND.companyName;

export async function dispatchTeamPush(
  payload: Omit<PushNotificationPayload, "title"> & { title?: string },
  options?: { excludeUserId?: string; event?: string }
): Promise<DispatchPushResult> {
  const event = options?.event ?? "team_push";

  logPush("dispatch", "dispatchTeamPush started", {
    event,
    body: payload.body,
    url: payload.url,
    excludeUserId: options?.excludeUserId ?? null,
  });

  if (!isServerPushConfigured()) {
    const result: DispatchPushResult = {
      ok: false,
      skipped: true,
      skipReason: "FIREBASE_SERVICE_ACCOUNT_JSON eksik",
      event,
      teamTokenCount: 0,
      targetTokenCount: 0,
      sent: 0,
      failed: 0,
    };
    logPush("dispatch", "dispatchTeamPush skipped", result);
    return result;
  }

  try {
    const { tokens, teamTokenCount } = await getTeamPushTokens({
      excludeUserId: options?.excludeUserId,
    });

    logPush("dispatch", "push_subscriptions loaded", {
      event,
      teamTokenCount,
      targetTokenCount: tokens.length,
    });

    if (teamTokenCount === 0) {
      const result: DispatchPushResult = {
        ok: false,
        skipped: true,
        skipReason: "Kayıtlı token yok",
        event,
        teamTokenCount: 0,
        targetTokenCount: 0,
        sent: 0,
        failed: 0,
      };
      logPush("dispatch", "dispatchTeamPush skipped — no subscriptions", result);
      return result;
    }

    if (tokens.length === 0) {
      const result: DispatchPushResult = {
        ok: false,
        skipped: true,
        skipReason: "Hedef token yok (exclude filtresi?)",
        event,
        teamTokenCount,
        targetTokenCount: 0,
        sent: 0,
        failed: 0,
      };
      logPush("dispatch", "dispatchTeamPush skipped — no target tokens", result);
      return result;
    }

    const sendResult = await sendPushToTokens(tokens, {
      title: payload.title ?? TITLE,
      body: payload.body,
      url: payload.url.startsWith("/") ? payload.url : `/${payload.url}`,
      tag: payload.tag,
      badge: payload.badge,
    });

    const result: DispatchPushResult = {
      ok: sendResult.ok && sendResult.sent > 0,
      skipped: false,
      event,
      teamTokenCount,
      targetTokenCount: tokens.length,
      sent: sendResult.sent,
      failed: sendResult.failed,
      adminError: sendResult.adminError,
      fcmErrors: sendResult.fcmErrors,
    };

    logPush("dispatch", "dispatchTeamPush finished", result);
    return result;
  } catch (e) {
    logPushError("dispatch", "dispatchTeamPush exception", e, { event });
    return {
      ok: false,
      skipped: false,
      event,
      teamTokenCount: 0,
      targetTokenCount: 0,
      sent: 0,
      failed: 0,
      adminError: e instanceof Error ? e.message : String(e),
    };
  }
}

export function dispatchTeamPushAsync(
  payload: Omit<PushNotificationPayload, "title"> & { title?: string },
  options?: { excludeUserId?: string; event?: string }
): void {
  void dispatchTeamPush(payload, options).then((result) => {
    if (!result.ok) {
      logPush("dispatch", "dispatchTeamPushAsync result", result);
    }
  });
}

export async function sendTestPushToUser(
  userId: string
): Promise<PushTestResult> {
  logPush("test", "sendTestPushToUser started", { userId });

  if (!isServerPushConfigured()) {
    return {
      ok: false,
      sent: 0,
      failed: 0,
      tokenCount: 0,
      message: "Sunucu push anahtarı eksik",
      adminError: "FIREBASE_SERVICE_ACCOUNT_JSON eksik",
    };
  }

  const tokens = (
    await getTeamPushTokens({ onlyUserId: userId })
  ).tokens;

  logPush("test", "user tokens", { userId, tokenCount: tokens.length });

  if (tokens.length === 0) {
    return {
      ok: false,
      sent: 0,
      failed: 0,
      tokenCount: 0,
      message: "Bu kullanıcı için kayıtlı token yok",
    };
  }

  const sendResult = await sendPushToTokens(tokens, {
    title: BRAND.companyName,
    body: "Push test bildirimi başarılı.",
    url: "/dashboard",
    tag: "push-test",
  });

  const ok = sendResult.sent > 0;
  const result = {
    ok,
    sent: sendResult.sent,
    failed: sendResult.failed,
    tokenCount: tokens.length,
    message: ok
      ? "Test bildirimi gönderildi"
      : "Test bildirimi gönderilemedi",
    adminError: sendResult.adminError,
    fcmErrors: sendResult.fcmErrors,
  };

  logPush("test", "sendTestPushToUser finished", result);
  return result;
}
