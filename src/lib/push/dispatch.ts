import { BRAND } from "@/lib/brand";
import { sendPushToTokens } from "@/lib/push/firebase-admin";
import { logPush, logPushError } from "@/lib/push/logger";
import {
  countTeamPushSubscriptions,
  getTeamPushTokens,
  getUserPushTokensAdmin,
} from "@/lib/push/subscription-queries";
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
    const { tokens, teamTokenCount, meta } = await getTeamPushTokens({
      excludeUserId: options?.excludeUserId,
    });

    if (!meta.serviceRoleAvailable) {
      const result: DispatchPushResult = {
        ok: false,
        skipped: true,
        skipReason: meta.queryError ?? "Service role kullanılamıyor",
        event,
        teamTokenCount: 0,
        targetTokenCount: 0,
        sent: 0,
        failed: 0,
        adminError: meta.queryError,
      };
      logPush("dispatch", "dispatchTeamPush skipped — no service role", result);
      return result;
    }

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

  const { tokens, userTokenCount, meta } = await getUserPushTokensAdmin(userId);

  if (!meta.serviceRoleAvailable) {
    return {
      ok: false,
      tokensFound: 0,
      sent: 0,
      failed: 0,
      tokenCount: 0,
      message: meta.queryError ?? "Service role sorgusu kullanılamıyor",
      serviceRoleAvailable: false,
      queryError: meta.queryError,
    };
  }

  if (!isServerPushConfigured()) {
    return {
      ok: false,
      tokensFound: userTokenCount,
      sent: 0,
      failed: 0,
      tokenCount: userTokenCount,
      message: "Sunucu push anahtarı eksik",
      adminError: "FIREBASE_SERVICE_ACCOUNT_JSON eksik",
      serviceRoleAvailable: true,
    };
  }

  logPush("test", "user tokens for test", { userId, tokensFound: tokens.length });

  if (tokens.length === 0) {
    return {
      ok: false,
      tokensFound: 0,
      sent: 0,
      failed: 0,
      tokenCount: 0,
      message: "Bu kullanıcı için kayıtlı token yok (service role sorgusu)",
      serviceRoleAvailable: true,
      queryError: meta.queryError,
    };
  }

  const sendResult = await sendPushToTokens(tokens, {
    title: BRAND.companyName,
    body: "Push test bildirimi başarılı.",
    url: "/dashboard",
    tag: "push-test",
  });

  const ok = sendResult.sent > 0;
  const result: PushTestResult = {
    ok,
    tokensFound: tokens.length,
    sent: sendResult.sent,
    failed: sendResult.failed,
    tokenCount: tokens.length,
    message: ok
      ? `Test bildirimi gönderildi (${sendResult.sent}/${tokens.length} token)`
      : sendResult.adminError
        ? `Gönderim başarısız: ${sendResult.adminError}`
        : `Gönderim başarısız (${sendResult.failed} token hata)`,
    adminError: sendResult.adminError,
    fcmErrors: sendResult.fcmErrors,
    serviceRoleAvailable: true,
  };

  logPush("test", "sendTestPushToUser finished", result);
  return result;
}
