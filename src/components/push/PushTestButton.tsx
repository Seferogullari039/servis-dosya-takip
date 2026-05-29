"use client";

import { useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { Button } from "@/components/ui/Button";
import { usePushNotifications } from "@/components/push/PushNotificationProvider";
import { useToast } from "@/components/ui/ToastProvider";
import type { PushTestApiResponse } from "@/types/push";

export function PushTestButton() {
  const { profile } = useAuth();
  const { setLastPushResult, refreshTokenDebug } = usePushNotifications();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (profile.role !== "admin") return null;

  const handleTest = async () => {
    setLoading(true);
    try {
      const debug = await refreshTokenDebug();

      if (!debug.canPushTest) {
        const msg =
          debug.pushTestBlockReason ??
          debug.issueMessage ??
          "Push test için token hazır değil";
        setLastPushResult({
          ok: false,
          at: new Date().toISOString(),
          message: msg,
          sent: 0,
          failed: 0,
        });
        toast(msg, "info");
        return;
      }

      const res = await fetch("/api/push/test", { method: "POST" });
      const data = (await res.json()) as PushTestApiResponse & { error?: string };

      if (!res.ok) {
        const msg = data.error ?? data.message ?? "Test gönderilemedi";
        setLastPushResult({
          ok: false,
          at: new Date().toISOString(),
          message: msg,
          sent: data.sent ?? 0,
          failed: data.failed ?? 0,
        });
        toast(msg, "error");
        return;
      }

      setLastPushResult({
        ok: data.ok,
        at: new Date().toISOString(),
        message: data.message,
        sent: data.sent,
        failed: data.failed,
        adminError: data.adminError,
        fcmErrors: data.fcmErrors,
      });

      toast(
        data.ok
          ? "Push test bildirimi gönderildi"
          : data.message ?? "Test başarısız",
        data.ok ? "success" : "error"
      );
    } catch {
      setLastPushResult({
        ok: false,
        at: new Date().toISOString(),
        message: "Ağ hatası",
        sent: 0,
        failed: 0,
      });
      toast("Test isteği başarısız", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="min-h-10 text-sm"
      disabled={loading}
      onClick={() => void handleTest()}
    >
      {loading ? "Gönderiliyor…" : "Push Test"}
    </Button>
  );
}
