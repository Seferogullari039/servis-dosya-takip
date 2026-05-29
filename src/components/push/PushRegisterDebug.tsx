"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { Button } from "@/components/ui/Button";
import { usePushNotifications } from "@/components/push/PushNotificationProvider";
import { readLocalFcmToken } from "@/lib/push/client-token";
import { detectPushDeviceType } from "@/lib/push/device";
import { registerFcmTokenViaApi } from "@/lib/push/register-client";
import type { PushDeviceType, PushRegisterApiResponse } from "@/types/push";
import { cn } from "@/lib/utils/cn";

function preview30(token: string | null): string {
  if (!token) return "—";
  return token.length <= 30 ? token : `${token.slice(0, 30)}…`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-2 last:border-0 dark:border-zinc-700/60">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-ink-muted dark:text-zinc-500">
        {label}
      </dt>
      <dd className="break-all font-mono text-xs text-ink dark:text-zinc-200">{value}</dd>
    </div>
  );
}

export function PushRegisterDebug() {
  const { user, profile } = useAuth();
  const {
    lastRegisterResponse,
    setLastRegisterResponse,
    refreshTokenDebug,
    publicFirebaseReady,
  } = usePushNotifications();
  const [localToken, setLocalToken] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const loadToken = useCallback(async () => {
    const { token } = await readLocalFcmToken();
    setLocalToken(token);
  }, []);

  useEffect(() => {
    void loadToken();
  }, [loadToken, lastRegisterResponse]);

  const debug = lastRegisterResponse?.debug;
  const errLabel = debug?.errorCategoryLabel ?? lastRegisterResponse?.error;

  const runRegisterTest = async () => {
    setTesting(true);
    try {
      const { token } = await readLocalFcmToken();
      setLocalToken(token);
      if (!token) {
        const fail: PushRegisterApiResponse = {
          ok: false,
          userId: user.id,
          email: user.email ?? null,
          tokenReceived: false,
          rowCount: 0,
          error: "Cihazda FCM token yok — önce Bildirimleri Aç",
        };
        setLastRegisterResponse(fail);
        return;
      }
      const kind = detectPushDeviceType();
      const deviceType: PushDeviceType =
        kind === "ios" || kind === "android" || kind === "web" ? kind : "unknown";
      const result = await registerFcmTokenViaApi(token, deviceType);
      const api: PushRegisterApiResponse = result.api ?? {
        ok: false,
        userId: user.id,
        email: user.email ?? null,
        tokenReceived: true,
        rowCount: 0,
        error: result.errorMessage ?? "Yanıt alınamadı",
      };
      setLastRegisterResponse(api);
      if (api.ok) {
        await refreshTokenDebug();
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <section
      className={cn(
        "rounded-xl border border-dashed border-amber-400/60 bg-surface p-4",
        "dark:border-amber-600/40"
      )}
      aria-labelledby="push-register-debug-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="push-register-debug-title"
            className="text-sm font-semibold text-ink dark:text-zinc-100"
          >
            Push Register Debug
          </h2>
          <p className="mt-1 text-xs text-ink-muted dark:text-zinc-400">
            {profile.role} · insert / update adımları ve Supabase hata detayı
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="min-h-10 text-sm"
          disabled={testing || !publicFirebaseReady}
          onClick={() => void runRegisterTest()}
        >
          {testing ? "Kaydediliyor…" : "Push Register Test"}
        </Button>
      </div>

      <dl className="mt-4 grid gap-0 sm:grid-cols-2">
        <Row label="auth user id" value={user.id} />
        <Row label="auth email" value={user.email ?? "—"} />
        <Row label="FCM token (ilk 30)" value={preview30(localToken)} />
        <Row
          label="insert sonucu"
          value={
            debug?.insertAttempted
              ? debug.insertSuccess
                ? "başarılı"
                : "başarısız"
              : debug?.updateAttempted
                ? "atlandı (güncelleme)"
                : "henüz denenmedi"
          }
        />
        <Row
          label="update sonucu"
          value={
            debug?.updateAttempted
              ? debug.updateSuccess
                ? "başarılı"
                : "başarısız"
              : "denenmedi"
          }
        />
        <Row
          label="auth.users FK"
          value={
            debug?.authUserExists === true
              ? "user_id geçerli"
              : debug?.authUserExists === false
                ? "user_id auth.users’da YOK"
                : "—"
          }
        />
        <Row label="Supabase error code" value={debug?.supabaseCode ?? "—"} />
        <Row label="Supabase error message" value={debug?.supabaseMessage ?? "—"} />
        {debug?.supabaseDetails ? (
          <Row label="Supabase details" value={debug.supabaseDetails} />
        ) : null}
        {debug?.supabaseHint ? (
          <Row label="Supabase hint" value={debug.supabaseHint} />
        ) : null}
        {errLabel ? (
          <div className="sm:col-span-2">
            <Row
              label="Hata kategorisi"
              value={`${debug?.errorCategory ?? "—"} — ${errLabel}`}
            />
          </div>
        ) : null}
      </dl>

      {debug?.schemaNote ? (
        <p className="mt-2 text-[10px] text-ink-muted dark:text-zinc-500">
          Şema: {debug.schemaNote}
        </p>
      ) : null}

      <div className="mt-4">
        <p className="mb-1 text-[10px] font-medium uppercase text-ink-muted dark:text-zinc-500">
          /api/push/register son response (JSON)
        </p>
        <pre
          className="max-h-48 overflow-auto rounded-lg bg-zinc-900 p-3 text-[11px] leading-relaxed text-emerald-200"
        >
          {lastRegisterResponse
            ? JSON.stringify(lastRegisterResponse, null, 2)
            : "Henüz istek yok — Push Register Test’e basın"}
        </pre>
      </div>
    </section>
  );
}
