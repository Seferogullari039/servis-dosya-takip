"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { usePushNotifications } from "@/components/push/PushNotificationProvider";
import { isPushEnvironmentSupported } from "@/lib/push/device";
import { cn } from "@/lib/utils/cn";

const DISMISS_KEY = "push-prompt-dismissed-v1";

export function PushNotificationPrompt() {
  const {
    firebaseConfigured,
    diagnostics,
    enabling,
    enableNotifications,
  } = usePushNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured || !isPushEnvironmentSupported()) return;
    if (diagnostics.tokenRegistered || diagnostics.iosNeedsHomeScreen) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    if (Notification.permission === "granted") return;
    const t = window.setTimeout(() => setOpen(true), 2000);
    return () => window.clearTimeout(t);
  }, [firebaseConfigured, diagnostics.tokenRegistered, diagnostics.iosNeedsHomeScreen]);

  const handleAllow = async () => {
    if (diagnostics.iosNeedsHomeScreen) return;
    const result = await enableNotifications();
    if (result.ok) setOpen(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4 pb-safe pointer-events-none"
      role="dialog"
      aria-labelledby="push-prompt-title"
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-md rounded-2xl border border-border bg-surface p-4 shadow-2xl",
          "dark:border-zinc-600 dark:bg-zinc-900"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0c1a2e] text-white"
            aria-hidden
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="push-prompt-title"
              className="text-base font-semibold text-ink dark:text-zinc-50"
            >
              Bildirim almak ister misiniz?
            </h2>
            <p className="mt-1 text-sm text-ink-muted dark:text-zinc-400">
              İş emri, tedarik ve dosya güncellemeleri telefonunuza anında gelsin.
            </p>
            {diagnostics.iosNeedsHomeScreen ? (
              <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-2 text-xs text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                Bildirim için Ana Ekrana Eklemeniz gerekir.
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="min-h-11 flex-1"
            disabled={enabling || diagnostics.iosNeedsHomeScreen}
            onClick={() => void handleAllow()}
          >
            {enabling ? "Kaydediliyor…" : "Bildirimleri Aç"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            disabled={enabling}
            onClick={handleDismiss}
          >
            Sonra
          </Button>
        </div>
      </div>
    </div>
  );
}
