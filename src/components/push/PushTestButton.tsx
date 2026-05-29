"use client";

import { useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { Button } from "@/components/ui/Button";
import { usePushNotifications } from "@/components/push/PushNotificationProvider";
import { useToast } from "@/components/ui/ToastProvider";
import type { PushTestApiResponse } from "@/types/push";

export function PushTestButton() {
  const { profile } = useAuth();
  const { setLastPushResult, refreshTokenDebug, refreshFcmSwDebug } =
    usePushNotifications();
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
          tokensFound: 0,
          sent: 0,
          failed: 0,
        });
        toast(msg, "info");
        return;
      }

      const res = await fetch("/api/push/test", { method: "POST" });
      const data = (await res.json()) as PushTestApiResponse & { error?: string };

      const tokensFound = data.tokensFound ?? data.tokenCount ?? 0;

      if (!res.ok) {
        const msg = data.error ?? data.message ?? "Test gönderilemedi";
        setLastPushResult({
          ok: false,
          at: new Date().toISOString(),
          message: msg,
          tokensFound,
          sent: data.sent ?? 0,
          failed: data.failed ?? 0,
          adminError: data.adminError,
          fcmErrors: data.fcmErrors,
          queryError: data.queryError,
        });
        toast(msg, "error");
        return;
      }

      setLastPushResult({
        ok: data.ok,
        at: new Date().toISOString(),
        message: data.message,
        tokensFound,
        sent: data.sent,
        failed: data.failed,
        adminError: data.adminError,
        fcmErrors: data.fcmErrors,
        queryError: data.queryError,
      });

      const summary = `Bulunan: ${tokensFound} · Gönderilen: ${data.sent} · Başarısız: ${data.failed}`;
      toast(
        data.ok ? `Push test OK. ${summary}` : `${data.message ?? "Test başarısız"}. ${summary}`,
        data.ok ? "success" : "error"
      );
      setTimeout(() => void refreshFcmSwDebug(), 2500);
    } catch {
      setLastPushResult({
        ok: false,
        at: new Date().toISOString(),
        message: "Ağ hatası",
        tokensFound: 0,
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
