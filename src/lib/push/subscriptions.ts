import { createClient } from "@/lib/supabase/server";
import type { PushDeviceType } from "@/types/push";

export async function upsertPushSubscription(params: {
  userId: string;
  fcmToken: string;
  deviceType: PushDeviceType;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", params.userId)
      .eq("fcm_token", params.fcmToken)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("push_subscriptions")
        .update({ last_seen_at: now, device_type: params.deviceType })
        .eq("id", existing.id);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    }

    const { error } = await supabase.from("push_subscriptions").insert({
      user_id: params.userId,
      fcm_token: params.fcmToken,
      device_type: params.deviceType,
      last_seen_at: now,
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Abonelik kaydedilemedi.",
    };
  }
}

export async function removePushSubscription(
  userId: string,
  fcmToken: string
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("fcm_token", fcmToken);
  } catch {
    /* ignore */
  }
}

export { countUserPushSubscriptions, countTeamPushSubscriptions } from "@/lib/push/subscription-queries";
