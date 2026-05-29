"use client";

import { Button } from "@/components/ui/Button";
import { usePushNotifications } from "@/components/push/PushNotificationProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils/cn";

export function PushEnableCard() {
  const { firebaseConfigured, diagnostics, enabling, enableNotifications } =
    usePushNotifications();
  const { toast } = useToast();

  const active = diagnostics.tokenRegistered;

  const handleEnable = async () => {
    if (diagnostics.iosNeedsHomeScreen) return;
    const result = await enableNotifications();
    if (!result.ok) {
      toast(result.message, result.reason === "permission_denied" ? "error" : "info");
    }
  };

  return (
    <section
      className={cn(
        "rounded-2xl border-2 bg-surface p-5 shadow-md",
        active
          ? "border-emerald-400/60 border-l-4 border-l-emerald-500"
          : "border-sky-400/50 border-l-4 border-l-sky-500"
      )}
      aria-labelledby="push-enable-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0c1a2e] text-white"
            aria-hidden
          >
            <svg
              className="h-7 w-7"
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
          <div className="min-w-0">
            <h2
              id="push-enable-title"
              className="text-lg font-semibold text-ink dark:text-zinc-50"
            >
              {active ? "Bildirimler açık" : "Bildirimleri Aç"}
            </h2>
            <p className="mt-1 text-sm text-ink-muted dark:text-zinc-400">
              {active
                ? "İş emri ve tedarik güncellemeleri bu cihaza gönderilir."
                : "Anlık iş emri, tedarik ve dosya bildirimleri alın."}
            </p>
          </div>
        </div>
        {active ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Aktif
          </span>
        ) : null}
      </div>

      {!firebaseConfigured ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Bildirim ayarları henüz tamamlanmamış.
        </p>
      ) : null}

      {firebaseConfigured && diagnostics.iosNeedsHomeScreen ? (
        <div className="mt-4 space-y-3">
          <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Bildirim için Ana Ekrana Eklemeniz gerekir. Safari’de Paylaş →{" "}
            <strong>Ana Ekrana Ekle</strong> ile ekleyin, ardından uygulamayı ana
            ekrandan açın.
          </p>
          <Button type="button" className="min-h-11" disabled>
            Bildirimleri Aç
          </Button>
        </div>
      ) : null}

      {firebaseConfigured && !active && !diagnostics.iosNeedsHomeScreen ? (
        <div className="mt-4">
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            disabled={
              enabling ||
              diagnostics.permission === "denied" ||
              diagnostics.permission === "unsupported"
            }
            onClick={() => void handleEnable()}
          >
            {enabling ? "Etkinleştiriliyor…" : "Bildirimleri Aç"}
          </Button>
          {diagnostics.permission === "denied" ? (
            <p className="mt-2 text-xs text-ink-muted dark:text-zinc-400">
              Bildirim izni kapalı. Tarayıcı veya cihaz ayarlarından izin verin.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
