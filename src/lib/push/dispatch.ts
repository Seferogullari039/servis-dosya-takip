import { BRAND } from "@/lib/brand";
import { sendPushToTokens } from "@/lib/push/firebase-admin";
import { logPush, logPushError } from "@/lib/push/logger";
import {
  getTeamPushTokens,
  getUserPushTokensAdmin,
  resolveTeamPushTargetTokens,
} from "@/lib/push/subscription-queries";
import { isServerPushConfigured } from "@/lib/push/server-config";
import type { DispatchPushResult, PushTestResult } from "@/lib/push/types";
import type { PushNotificationPayload } from "@/types/push";

const TITLE = BRAND.companyName;

function buildDispatchResult(
  partial: Omit<DispatchPushResult, "tokensFound" | "targetTokenCount"> & {
    tokensFound?: number;
    targetTokenCount?: number;
  }
): DispatchPushResult {
  const tokensFound = partial.tokensFound ?? partial.targetTokenCount ?? 0;
  return {
    ...partial,
    tokensFound,
    targetTokenCount: tokensFound,
  };
}

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
    const result = buildDispatchResult({
      ok: false,
      skipped: true,
      skipReason: "FIREBASE_SERVICE_ACCOUNT_JSON eksik",
      event,
      teamTokenCount: 0,
      tokensFound: 0,
      sent: 0,
      failed: 0,
      serviceRoleAvailable: true,
    });
    logPush("dispatch", "dispatchTeamPush skipped", result);
    return result;
  }

  try {
    const { rows, tokens: allTokens, teamTokenCount, meta } =
      await getTeamPushTokens();

    const baseDebug = {
      event,
      serviceRoleAvailable: meta.serviceRoleAvailable,
      teamTokenCount,
      queryError: meta.queryError,
    };

    if (!meta.serviceRoleAvailable) {
      const result = buildDispatchResult({
        ok: false,
        skipped: true,
        skipReason: meta.queryError ?? "Service role kullanılamıyor",
        ...baseDebug,
        tokensFound: 0,
        sent: 0,
        failed: 0,
        adminError: meta.queryError,
      });
      logPush("dispatch", "dispatchTeamPush skipped — no service role", result);
      return result;
    }

    if (meta.queryError) {
      const result = buildDispatchResult({
        ok: false,
        skipped: true,
        skipReason: meta.queryError,
        ...baseDebug,
        tokensFound: 0,
        sent: 0,
        failed: 0,
        adminError: meta.queryError,
      });
      logPush("dispatch", "dispatchTeamPush skipped — query error", result);
      return result;
    }

    logPush("dispatch", "push_subscriptions loaded", {
      event,
      teamTokenCount,
      allUniqueTokens: allTokens.length,
      excludeUserId: options?.excludeUserId ?? null,
      serviceRoleAvailable: meta.serviceRoleAvailable,
    });

    if (teamTokenCount === 0 || allTokens.length === 0) {
      const result = buildDispatchResult({
        ok: false,
        skipped: true,
        skipReason: "Kayıtlı token yok",
        ...baseDebug,
        tokensFound: 0,
        sent: 0,
        failed: 0,
      });
      logPush("dispatch", "dispatchTeamPush skipped — no subscriptions", result);
      return result;
    }

    const tokens = resolveTeamPushTargetTokens(
      rows,
      allTokens,
      options?.excludeUserId
    );

    logPush("dispatch", "push target tokens resolved", {
      event,
      teamTokenCount,
      tokensFound: tokens.length,
      excludeUserId: options?.excludeUserId ?? null,
    });

    if (tokens.length === 0) {
      const result = buildDispatchResult({
        ok: false,
        skipped: true,
        skipReason: "Hedef token yok",
        ...baseDebug,
        tokensFound: 0,
        sent: 0,
        failed: 0,
      });
      logPush("dispatch", "dispatchTeamPush skipped — no target tokens", result);
      return result;
    }

    const sendResult = await sendPushToTokens(tokens, {
      title: payload.title ?? TITLE,
      body: payload.body,
      url: payload.url.startsWith("/") ? payload.url : `/${payload.url}`,
      tag: payload.tag,
      badge: payload.badge,
      workOrderId: payload.workOrderId,
    });

    const result = buildDispatchResult({
      ok: sendResult.ok && sendResult.sent > 0,
      skipped: false,
      ...baseDebug,
      tokensFound: tokens.length,
      sent: sendResult.sent,
      failed: sendResult.failed,
      adminError: sendResult.adminError,
      fcmErrors: sendResult.fcmErrors,
    });

    logPush("dispatch", "dispatchTeamPush finished", result);
    return result;
  } catch (e) {
    logPushError("dispatch", "dispatchTeamPush exception", e, { event });
    return buildDispatchResult({
      ok: false,
      skipped: false,
      event,
      teamTokenCount: 0,
      tokensFound: 0,
      sent: 0,
      failed: 0,
      serviceRoleAvailable: undefined,
      adminError: e instanceof Error ? e.message : String(e),
    });
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

/** Push Test — dispatch ile aynı fetchPushSubscriptionTokensAdmin (userId filtresi) */
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
      queryError: meta.queryError,
    };
  }

  if (meta.queryError) {
    return {
      ok: false,
      tokensFound: 0,
      sent: 0,
      failed: 0,
      tokenCount: 0,
      message: meta.queryError,
      serviceRoleAvailable: true,
      queryError: meta.queryError,
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
    workOrderId: "",
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
    queryError: meta.queryError,
  };

  logPush("test", "sendTestPushToUser finished", result);
  return result;
}
