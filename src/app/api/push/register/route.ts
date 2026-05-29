import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  removeAllPushSubscriptionsForUser,
  removePushSubscription,
  upsertPushSubscription,
} from "@/lib/push/subscriptions";
import { logPushRegisterError } from "@/lib/push/supabase-error";
import type { PushDeviceType, PushRegisterApiResponse } from "@/types/push";

function tokenPreview(token: string | undefined): string | null {
  if (!token?.trim()) return null;
  const t = token.trim();
  return t.length <= 30 ? t : `${t.slice(0, 30)}…`;
}

function buildPayload(
  base: Omit<PushRegisterApiResponse, "debug"> & {
    debug?: PushRegisterApiResponse["debug"];
  }
): PushRegisterApiResponse {
  return base as PushRegisterApiResponse;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  let body: {
    fcmToken?: string;
    deviceType?: PushDeviceType;
    action?: "register" | "unregister" | "reset_all";
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const userId = user.id;
  const email = user.email ?? null;

  if (body.action === "reset_all") {
    const result = await removeAllPushSubscriptionsForUser(userId, email);
    if (!result.ok) {
      logPushRegisterError("reset_all", {
        userId,
        email,
        error: result.error,
      });
    }
    const payload = buildPayload({
      ok: result.ok,
      userId,
      email,
      tokenReceived: false,
      action: "reset_all",
      rowCount: result.ok ? result.deleted : 0,
      error: result.ok ? undefined : result.error,
      deleted: result.ok ? result.deleted : 0,
    });
    return NextResponse.json(payload, { status: result.ok ? 200 : 500 });
  }

  const token = body.fcmToken?.trim();

  if (body.action === "unregister") {
    if (!token) {
      return NextResponse.json(
        { error: "FCM token gerekli." },
        { status: 400 }
      );
    }
    const result = await removePushSubscription(userId, token, email);
    if (!result.ok) {
      logPushRegisterError("unregister", {
        userId,
        email,
        error: result.error ?? "unregister failed",
      });
    }
    const payload = buildPayload({
      ok: result.ok,
      userId,
      email,
      tokenReceived: true,
      tokenPreview: tokenPreview(token),
      action: "unregistered",
      rowCount: result.rowCount,
      error: result.error,
    });
    return NextResponse.json(payload, { status: result.ok ? 200 : 500 });
  }

  if (!token) {
    const payload = buildPayload({
      ok: false,
      userId,
      email,
      tokenReceived: false,
      rowCount: 0,
      error: "FCM token gerekli.",
    });
    return NextResponse.json(payload, { status: 400 });
  }

  const deviceType: PushDeviceType =
    body.deviceType === "ios" ||
    body.deviceType === "android" ||
    body.deviceType === "web"
      ? body.deviceType
      : "unknown";

  const result = await upsertPushSubscription({
    userId,
    fcmToken: token,
    deviceType,
    email,
  });

  if (!result.ok) {
    logPushRegisterError("register", {
      userId,
      email,
      error: {
        message: result.error,
        code: result.debug.supabaseCode,
        details: result.debug.supabaseDetails,
        hint: result.debug.supabaseHint,
      },
    });
  }

  const payload = buildPayload({
    ok: result.ok,
    userId,
    email,
    tokenReceived: true,
    tokenPreview: tokenPreview(token),
    action: result.ok ? result.action : undefined,
    rowCount: result.rowCount,
    error: result.ok ? undefined : result.error,
    debug: result.debug,
  });

  return NextResponse.json(payload, { status: result.ok ? 200 : 500 });
}
