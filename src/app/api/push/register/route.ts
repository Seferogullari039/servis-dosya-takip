import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  removeAllPushSubscriptionsForUser,
  removePushSubscription,
  upsertPushSubscription,
} from "@/lib/push/subscriptions";
import type { PushDeviceType, PushRegisterApiResponse } from "@/types/push";

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

  if (body.action === "reset_all") {
    const result = await removeAllPushSubscriptionsForUser(userId);
    const payload: PushRegisterApiResponse = {
      ok: result.ok,
      userId,
      tokenReceived: false,
      action: "reset_all",
      rowCount: result.ok ? result.deleted : 0,
      error: result.ok ? undefined : result.error,
      deleted: result.ok ? result.deleted : 0,
    };
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
    const result = await removePushSubscription(userId, token);
    const payload: PushRegisterApiResponse = {
      ok: result.ok,
      userId,
      tokenReceived: true,
      action: "unregistered",
      rowCount: result.rowCount,
      error: result.error,
    };
    return NextResponse.json(payload, { status: result.ok ? 200 : 500 });
  }

  if (!token) {
    const payload: PushRegisterApiResponse = {
      ok: false,
      userId,
      tokenReceived: false,
      rowCount: 0,
      error: "FCM token gerekli.",
    };
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
  });

  const payload: PushRegisterApiResponse = {
    ok: result.ok,
    userId,
    tokenReceived: true,
    action: result.ok ? result.action : undefined,
    rowCount: result.rowCount,
    error: result.ok ? undefined : result.error,
  };

  return NextResponse.json(payload, { status: result.ok ? 200 : 500 });
}
