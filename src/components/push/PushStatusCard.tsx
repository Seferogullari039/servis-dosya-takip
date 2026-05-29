"use client";

import { useEffect } from "react";
import { PushConfigDebug } from "@/components/push/PushConfigDebug";
import { PushRegenerateTokenButton } from "@/components/push/PushRegenerateTokenButton";
import { LocalNotificationTestButton } from "@/components/push/LocalNotificationTestButton";
import { PushTestButton } from "@/components/push/PushTestButton";
import { usePushNotifications } from "@/components/push/PushNotificationProvider";
import { cn } from "@/lib/utils/cn";

function permissionLabel(
  permission: NotificationPermission | "unsupported"
): string {
  if (permission === "unsupported") return "desteklenmiyor";
  return permission;
}

export function PushStatusCard() {
  const {
    diagnostics,
    subscriptionCount,
    teamTokenCount,
    tokenRegistered,
    publicFirebaseReady,
    missingPublicEnv,
    serverPushReady,
    lastPushResult,
    tokenDebug,
    serviceRoleAvailable,
    refreshDiagnostics,
    refreshTokenDebug,
    fcmSwDebug,
    refreshFcmSwDebug,
  } = usePushNotifications();

  useEffect(() => {
    refreshDiagnostics();
    void refreshTokenDebug();
    void refreshFcmSwDebug();
  }, [refreshDiagnostics, refreshTokenDebug, refreshFcmSwDebug]);

  const enabled = diagnostics.tokenRegistered;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-sm border-l-4",
        enabled ? "border-l-emerald-500" : "border-l-sky-500"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink dark:text-zinc-100">
            Push bildirim durumu
          </h2>
          <p className="mt-1 text-xs text-ink-muted dark:text-zinc-400">
            {enabled
              ? `Aktif · ${subscriptionCount} cihaz kayıtlı (sizin hesap)`
              : publicFirebaseReady
                ? "Bildirimler henüz etkin değil"
                : "Public Firebase env eksik"}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <PushRegenerateTokenButton />
          <PushTestButton />
          <LocalNotificationTestButton />
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold",
              enabled
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            )}
          >
            {enabled ? "Açık" : "Kapalı"}
          </span>
        </div>
      </div>

      <PushConfigDebug
        className="mt-4"
        publicFirebaseReady={publicFirebaseReady}
        missingPublicEnv={missingPublicEnv}
        serverPushReady={serverPushReady}
      />

      {tokenDebug.tokenQueryMismatch ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-900 dark:bg-red-950/40 dark:text-red-200">
          Token kayıtlı ama gönderim sorgusunda bulunamadı. Service role sorgusu
          kontrol edilmeli.
        </p>
      ) : null}

      {!serviceRoleAvailable ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          SUPABASE_SERVICE_ROLE_KEY eksik veya geçersiz. Sunucu token sayıları 0
          görünebilir; Vercel ortam değişkenini ekleyin.
        </p>
      ) : null}

      {tokenDebug.issueMessage && !tokenDebug.tokenQueryMismatch ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {tokenDebug.issueMessage}
        </p>
      ) : null}

      {tokenDebug.pushTestBlockReason && !tokenDebug.canPushTest ? (
        <p className="mt-2 text-xs text-ink-muted dark:text-zinc-400">
          {tokenDebug.pushTestBlockReason}
        </p>
      ) : null}

      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">Notification.permission</dt>
          <dd className="font-medium text-ink dark:text-zinc-200">
            {permissionLabel(tokenDebug.permission)}
          </dd>
        </div>
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">FCM token var mı</dt>
          <dd className="font-medium text-ink dark:text-zinc-200">
            {tokenDebug.hasLocalToken ? "Evet" : "Hayır"}
          </dd>
        </div>
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60 sm:col-span-2">
          <dt className="shrink-0 text-ink-muted dark:text-zinc-400">
            FCM token (ilk 20)
          </dt>
          <dd className="truncate font-mono text-[11px] font-medium text-ink dark:text-zinc-200">
            {tokenDebug.localTokenPreview ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">
            push_subscriptions (sizin, SR)
          </dt>
          <dd className="font-medium text-ink dark:text-zinc-200">
            {subscriptionCount}
          </dd>
        </div>
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">
            Ekip token (toplam, SR)
          </dt>
          <dd className="font-medium text-ink dark:text-zinc-200">
            {teamTokenCount}
          </dd>
        </div>
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">Service role</dt>
          <dd className="font-medium text-ink dark:text-zinc-200">
            {serviceRoleAvailable ? "Aktif" : "Eksik"}
          </dd>
        </div>
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">Token kayıtlı</dt>
          <dd className="font-medium text-ink dark:text-zinc-200">
            {tokenRegistered ? "Evet" : "Hayır"}
          </dd>
        </div>
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">Son push testi</dt>
          <dd
            className={cn(
              "font-medium",
              lastPushResult?.ok
                ? "text-emerald-700 dark:text-emerald-300"
                : lastPushResult
                  ? "text-red-700 dark:text-red-300"
                  : "text-ink dark:text-zinc-200"
            )}
          >
            {lastPushResult
              ? lastPushResult.ok
                ? "Başarılı"
                : "Başarısız"
              : "Henüz test yok"}
          </dd>
        </div>
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">Cihaz tipi</dt>
          <dd className="font-medium text-ink dark:text-zinc-200">
            {diagnostics.device}
          </dd>
        </div>
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">PWA modu</dt>
          <dd className="font-medium text-ink dark:text-zinc-200">
            {diagnostics.pwaMode ? "Evet" : "Hayır"}
          </dd>
        </div>
      </dl>

      <details className="mt-4 rounded-lg border border-border bg-surface-muted/50 dark:border-zinc-700 dark:bg-zinc-800/40">
        <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-ink dark:text-zinc-200">
          FCM service worker debug
        </summary>
        <dl className="border-t border-border px-3 py-2 text-xs dark:border-zinc-700">
          {(
            [
              ["firebase-messaging-sw.js erişilebilir", fcmSwDebug.fcmSwReachable ? "evet" : "hayır"],
              ["FCM SW kayıtlı", fcmSwDebug.fcmMessagingSwRegistered ? "evet" : "hayır"],
              ["FCM SW script", fcmSwDebug.fcmMessagingSwScriptUrl ?? "—"],
              ["Kontrol eden SW", fcmSwDebug.controllingSwScriptUrl ?? "—"],
              ["push-handler (workbox)", fcmSwDebug.pushHandlerInWorkboxSw ? "evet" : "hayır"],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-0.5 border-b border-border/60 py-2 last:border-0 dark:border-zinc-700/60"
            >
              <dt className="font-medium text-ink-muted dark:text-zinc-500">{label}</dt>
              <dd className="break-all font-mono text-[11px] text-ink dark:text-zinc-200">
                {value}
              </dd>
            </div>
          ))}
          <div className="py-2">
            <dt className="font-medium text-ink-muted dark:text-zinc-500">
              Son FCM arka plan payload
            </dt>
            <dd className="mt-1 break-all font-mono text-[11px] text-ink dark:text-zinc-200">
              {fcmSwDebug.lastBackgroundPayload
                ? JSON.stringify(fcmSwDebug.lastBackgroundPayload, null, 2)
                : fcmSwDebug.lastBackgroundReadError
                  ? `— (${fcmSwDebug.lastBackgroundReadError})`
                  : "— (henüz kayıt yok — uygulamayı arka plana alıp Push Test deneyin)"}
            </dd>
          </div>
        </dl>
      </details>

      <details className="mt-4 rounded-lg border border-border bg-surface-muted/50 dark:border-zinc-700 dark:bg-zinc-800/40">
        <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-ink dark:text-zinc-200">
          Cihaz algılama (ham debug)
        </summary>
        <dl className="border-t border-border px-3 py-2 text-xs dark:border-zinc-700">
          {(
            [
              ["navigator.userAgent", diagnostics.deviceDebug.userAgent],
              ["navigator.platform", diagnostics.deviceDebug.platform],
              [
                "navigator.maxTouchPoints",
                String(diagnostics.deviceDebug.maxTouchPoints),
              ],
              [
                "standalone mode (navigator.standalone)",
                diagnostics.deviceDebug.standaloneMode ? "true" : "false",
              ],
              ["display-mode", diagnostics.deviceDebug.displayMode],
              ["isIOS", diagnostics.deviceDebug.isIOS ? "true" : "false"],
              ["isSafari", diagnostics.deviceDebug.isSafari ? "true" : "false"],
              ["isPWA", diagnostics.deviceDebug.isPWA ? "true" : "false"],
              [
                "isTouchDevice",
                diagnostics.deviceDebug.isTouchDevice ? "true" : "false",
              ],
              [
                "detectedDeviceType",
                diagnostics.deviceDebug.detectedDeviceType,
              ],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-0.5 border-b border-border/60 py-2 last:border-0 dark:border-zinc-700/60"
            >
              <dt className="font-medium text-ink-muted dark:text-zinc-500">
                {label}
              </dt>
              <dd className="break-all font-mono text-[11px] text-ink dark:text-zinc-200">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </details>

      {lastPushResult ? (
        <div className="mt-3 rounded-lg bg-surface-muted px-2.5 py-2 text-xs dark:bg-zinc-800/60">
          <p className="text-ink-muted dark:text-zinc-400">
            Son test: {new Date(lastPushResult.at).toLocaleString("tr-TR")}
          </p>
          <p className="mt-1 font-medium text-ink dark:text-zinc-200">
            Bulunan token: {lastPushResult.tokensFound ?? "—"} · Gönderilen:{" "}
            {lastPushResult.sent ?? 0} · Başarısız: {lastPushResult.failed ?? 0}
          </p>
          {lastPushResult.message ? (
            <p className="mt-1 text-ink dark:text-zinc-200">{lastPushResult.message}</p>
          ) : null}
          {lastPushResult.adminError ? (
            <p className="mt-1 text-red-700 dark:text-red-300">
              Admin: {lastPushResult.adminError}
            </p>
          ) : null}
          {lastPushResult.fcmErrors?.length ? (
            <ul className="mt-1 list-inside list-disc text-red-700 dark:text-red-300">
              {lastPushResult.fcmErrors.slice(0, 3).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {diagnostics.iosNeedsHomeScreen ? (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
          iOS: Bildirim için Ana Ekrana Eklemeniz gerekir (Safari PWA).
        </p>
      ) : null}

      <p className="mt-3 text-[10px] text-ink-muted dark:text-zinc-500">
        İş emri push logları: Vercel → Functions →{" "}
        <code className="rounded bg-surface-muted px-1">[push:dispatch]</code>
      </p>
    </div>
  );
}
