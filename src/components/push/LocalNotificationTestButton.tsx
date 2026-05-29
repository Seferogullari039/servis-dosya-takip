"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function LocalNotificationTestButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleTest = () => {
    setLoading(true);
    setResult(null);
    setIsError(false);

    try {
      if (typeof window === "undefined" || !("Notification" in window)) {
        setIsError(true);
        setResult("Hata: Notification API bu ortamda desteklenmiyor.");
        return;
      }

      const permission = Notification.permission;
      if (permission !== "granted") {
        setIsError(true);
        setResult(
          `Uyarı: Bildirim izni "${permission}". Önce Bildirimleri Aç ile izin verin.`
        );
        return;
      }

      const notification = new Notification("Seferoğulları Test", {
        body: "Yerel bildirim çalışıyor.",
        icon: "/icons/icon-192.png",
      });

      if (!notification) {
        setIsError(true);
        setResult("Hata: Notification oluşturulamadı.");
        return;
      }

      notification.onerror = () => {
        setIsError(true);
        setResult("Hata: Yerel bildirim gösterilemedi (onerror).");
      };

      setResult("Yerel bildirim tetiklendi");
    } catch (e) {
      setIsError(true);
      setResult(
        `Hata: ${e instanceof Error ? e.message : "Yerel bildirim başarısız"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="secondary"
        className="min-h-10 text-sm"
        disabled={loading}
        onClick={handleTest}
      >
        {loading ? "Deneniyor…" : "Yerel Bildirim Testi"}
      </Button>
      {result ? (
        <p
          className={cn(
            "max-w-xs text-xs font-medium",
            isError
              ? "text-amber-800 dark:text-amber-300"
              : "text-emerald-700 dark:text-emerald-300"
          )}
          role="status"
        >
          {result}
        </p>
      ) : null}
    </div>
  );
}
