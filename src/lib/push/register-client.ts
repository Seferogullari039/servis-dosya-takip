"use client";

import type { PushDeviceType, PushRegisterApiResponse } from "@/types/push";

export interface RegisterFcmTokenResult {
  ok: boolean;
  api: PushRegisterApiResponse | null;
  errorMessage: string | null;
}

export async function registerFcmTokenViaApi(
  token: string,
  deviceType: PushDeviceType
): Promise<RegisterFcmTokenResult> {
  try {
    const res = await fetch("/api/push/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fcmToken: token,
        deviceType,
        action: "register",
      }),
    });

    let api: PushRegisterApiResponse | null = null;
    try {
      api = (await res.json()) as PushRegisterApiResponse;
    } catch {
      api = null;
    }

    if (!res.ok || !api?.ok) {
      const errorMessage =
        api?.error ??
        (api && !api.ok ? "Kayıt başarısız" : null) ??
        `HTTP ${res.status}`;
      return { ok: false, api, errorMessage };
    }

    return { ok: true, api, errorMessage: null };
  } catch (e) {
    return {
      ok: false,
      api: null,
      errorMessage: e instanceof Error ? e.message : "Ağ hatası",
    };
  }
}

export function formatRegisterApiError(
  api: PushRegisterApiResponse | null,
  fallback?: string | null
): string {
  if (!api) return fallback ?? "Bilinmeyen API hatası";
  const parts = [
    api.error,
    api.ok ? null : `userId=${api.userId}`,
    api.action ? `action=${api.action}` : null,
    `rowCount=${api.rowCount}`,
  ].filter(Boolean);
  return parts.join(" · ") || fallback || "Kayıt başarısız";
}
