"use client";

import { useState } from "react";
import { usePushNotifications } from "@/components/push/PushNotificationProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils/cn";

const statusLabels = {
  active: "Bildirimler açık",
  off: "Bildirimler kapalı",
  unsupported: "Bildirim desteklenmiyor",
} as const;

export function PushBellButton() {
  const {
    bellStatus,
    unreadCount,
    diagnostics,
    enabling,
    firebaseConfigured,
    enableNotifications,
  } = usePushNotifications();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleClick = async () => {
    setOpen((v) => !v);
    if (bellStatus === "active") return;

    if (!firebaseConfigured) {
      toast("Bildirim ayarları henüz tamamlanmamış.", "info");
      return;
    }

    if (diagnostics.iosNeedsHomeScreen) {
      toast(
        "Bildirim için Ana Ekrana Eklemeniz gerekir. Uygulamayı ana ekrandan açın.",
        "info"
      );
      return;
    }

    if (bellStatus === "unsupported") {
      toast("Bu cihazda push bildirimleri desteklenmiyor.", "info");
      return;
    }

    const result = await enableNotifications();
    if (!result.ok) {
      toast(result.message, result.reason === "permission_denied" ? "error" : "info");
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={enabling}
        className={cn(
          "relative rounded-lg p-2 transition-colors",
          bellStatus === "active"
            ? "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            : "text-ink-muted hover:bg-surface-muted dark:text-zinc-400"
        )}
        aria-label={statusLabels[bellStatus]}
        title={statusLabels[bellStatus]}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white"
            aria-label={`${unreadCount} okunmamış bildirim`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : bellStatus === "off" && firebaseConfigured ? (
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500"
            aria-hidden
          />
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-surface p-3 text-sm shadow-lg dark:border-zinc-600 dark:bg-zinc-900"
          role="status"
        >
          <p className="font-medium text-ink dark:text-zinc-100">
            {statusLabels[bellStatus]}
          </p>
          <p className="mt-1 text-xs text-ink-muted dark:text-zinc-400">
            {bellStatus === "active"
              ? "Bu cihaz bildirim alıyor."
              : diagnostics.iosNeedsHomeScreen
                ? "iOS: önce Ana Ekrana ekleyin."
                : bellStatus === "off"
                  ? "Açmak için zile tekrar dokunun."
                  : "Sunucu veya tarayıcı yapılandırması eksik."}
          </p>
          <button
            type="button"
            className="mt-2 text-xs text-sky-600 hover:underline dark:text-sky-400"
            onClick={() => setOpen(false)}
          >
            Kapat
          </button>
        </div>
      ) : null}
    </div>
  );
}
