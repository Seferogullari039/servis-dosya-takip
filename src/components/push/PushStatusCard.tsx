"use client";

import { useEffect } from "react";
import { usePushNotifications } from "@/components/push/PushNotificationProvider";
import { cn } from "@/lib/utils/cn";

function permissionLabel(
  permission: NotificationPermission | "unsupported"
): string {
  if (permission === "unsupported") return "desteklenmiyor";
  return permission;
}

function tokenLabel(registered: boolean): string {
  return registered ? "kayıtlı" : "kayıtlı değil";
}

export function PushStatusCard() {
  const { diagnostics, subscriptionCount, firebaseConfigured, refreshDiagnostics } =
    usePushNotifications();

  useEffect(() => {
    refreshDiagnostics();
  }, [refreshDiagnostics]);

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
              ? `Aktif · ${subscriptionCount} cihaz kayıtlı`
              : firebaseConfigured
                ? "Bildirimler henüz etkin değil"
                : "Bildirim ayarları henüz tamamlanmamış"}
          </p>
        </div>
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

      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">Cihaz</dt>
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
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">Bildirim izni</dt>
          <dd className="font-medium text-ink dark:text-zinc-200">
            {permissionLabel(diagnostics.permission)}
          </dd>
        </div>
        <div className="flex justify-between gap-2 rounded-lg bg-surface-muted px-2.5 py-2 dark:bg-zinc-800/60">
          <dt className="text-ink-muted dark:text-zinc-400">Token durumu</dt>
          <dd className="font-medium text-ink dark:text-zinc-200">
            {tokenLabel(diagnostics.tokenRegistered)}
          </dd>
        </div>
      </dl>

      {diagnostics.iosNeedsHomeScreen ? (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
          iOS: Bildirim için Ana Ekrana Eklemeniz gerekir (Safari PWA).
        </p>
      ) : null}
    </div>
  );
}
