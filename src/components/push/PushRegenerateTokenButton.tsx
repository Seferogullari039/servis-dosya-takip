"use client";

import { Button } from "@/components/ui/Button";
import { usePushNotifications } from "@/components/push/PushNotificationProvider";
import { useToast } from "@/components/ui/ToastProvider";

export function PushRegenerateTokenButton() {
  const { regenerating, regenerateToken, publicFirebaseReady } =
    usePushNotifications();
  const { toast } = useToast();

  if (!publicFirebaseReady) return null;

  const handleClick = async () => {
    const result = await regenerateToken();
    if (result.ok) {
      toast("Token veritabanına kaydedildi", "success");
    } else {
      const detail = result.registerErrorDetail ?? result.message;
      toast(detail, "error");
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="min-h-10 text-sm"
      disabled={regenerating}
      onClick={() => void handleClick()}
    >
      {regenerating ? "Yenileniyor…" : "Token Yeniden Oluştur"}
    </Button>
  );
}
