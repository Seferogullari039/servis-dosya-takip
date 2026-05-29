import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  removeAllPushSubscriptionsForUser,
  removePushSubscription,
  upsertPushSubscription,
} from "@/lib/push/subscriptions";
import type { PushDeviceType } from "@/types/push";

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

  if (body.action === "reset_all") {
    const result = await removeAllPushSubscriptionsForUser(user.id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, deleted: result.deleted });
  }

  const token = body.fcmToken?.trim();
  if (!token) {
    return NextResponse.json({ error: "FCM token gerekli." }, { status: 400 });
  }

  if (body.action === "unregister") {
    await removePushSubscription(user.id, token);
    return NextResponse.json({ ok: true });
  }

  const deviceType: PushDeviceType =
    body.deviceType === "ios" ||
    body.deviceType === "android" ||
    body.deviceType === "web"
      ? body.deviceType
      : "unknown";

  const result = await upsertPushSubscription({
    userId: user.id,
    fcmToken: token,
    deviceType,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
