import { tryCreateAdminClient } from "@/lib/supabase/admin";
import { logPush, logPushError } from "@/lib/push/logger";
import type { PushDeviceType } from "@/types/push";

export type UpsertPushSubscriptionResult =
  | {
      ok: true;
      action: "inserted" | "updated";
      rowCount: number;
      id: string;
    }
  | { ok: false; error: string; rowCount: number };

function requireAdminClient():
  | { client: NonNullable<ReturnType<typeof tryCreateAdminClient>> }
  | { client: null; error: string } {
  const client = tryCreateAdminClient();
  if (!client) {
    return {
      client: null,
      error: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil veya geçersiz",
    };
  }
  return { client };
}

/**
 * push_subscriptions kaydı — service role (RLS bypass).
 * userId oturumdaki auth.users.id ile eşleşmeli (route doğrular).
 */
export async function upsertPushSubscription(params: {
  userId: string;
  fcmToken: string;
  deviceType: PushDeviceType;
}): Promise<UpsertPushSubscriptionResult> {
  const adminResult = requireAdminClient();
  if (!adminResult.client) {
    return { ok: false, error: adminResult.error, rowCount: 0 };
  }

  const supabase = adminResult.client;
  const now = new Date().toISOString();

  try {
    const { data: existing, error: selectError } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", params.userId)
      .eq("fcm_token", params.fcmToken)
      .maybeSingle();

    if (selectError) {
      logPushError("register", "select existing failed", selectError, {
        userId: params.userId,
      });
      return { ok: false, error: selectError.message, rowCount: 0 };
    }

    if (existing?.id) {
      const { data: updated, error: updateError } = await supabase
        .from("push_subscriptions")
        .update({
          last_seen_at: now,
          device_type: params.deviceType,
        })
        .eq("id", existing.id)
        .select("id")
        .single();

      if (updateError) {
        logPushError("register", "update failed", updateError, {
          userId: params.userId,
        });
        return { ok: false, error: updateError.message, rowCount: 0 };
      }

      logPush("register", "subscription updated", {
        userId: params.userId,
        id: updated?.id,
      });

      return {
        ok: true,
        action: "updated",
        rowCount: 1,
        id: updated?.id ?? existing.id,
      };
    }

    const { data: inserted, error: insertError } = await supabase
      .from("push_subscriptions")
      .insert({
        user_id: params.userId,
        fcm_token: params.fcmToken,
        device_type: params.deviceType,
        created_at: now,
        last_seen_at: now,
      })
      .select("id")
      .single();

    if (insertError) {
      logPushError("register", "insert failed", insertError, {
        userId: params.userId,
      });
      return { ok: false, error: insertError.message, rowCount: 0 };
    }

    logPush("register", "subscription inserted", {
      userId: params.userId,
      id: inserted?.id,
    });

    return {
      ok: true,
      action: "inserted",
      rowCount: 1,
      id: inserted?.id ?? "",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Abonelik kaydedilemedi.";
    logPushError("register", "upsert exception", e, { userId: params.userId });
    return { ok: false, error: message, rowCount: 0 };
  }
}

export async function removePushSubscription(
  userId: string,
  fcmToken: string
): Promise<{ ok: boolean; rowCount: number; error?: string }> {
  const adminResult = requireAdminClient();
  if (!adminResult.client) {
    return { ok: false, rowCount: 0, error: adminResult.error };
  }

  try {
    const { data, error } = await adminResult.client
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("fcm_token", fcmToken)
      .select("id");

    if (error) return { ok: false, rowCount: 0, error: error.message };
    return { ok: true, rowCount: data?.length ?? 0 };
  } catch (e) {
    return {
      ok: false,
      rowCount: 0,
      error: e instanceof Error ? e.message : "Silinemedi",
    };
  }
}

export async function removeAllPushSubscriptionsForUser(
  userId: string
): Promise<{ ok: true; deleted: number } | { ok: false; error: string }> {
  const adminResult = requireAdminClient();
  if (!adminResult.client) {
    return { ok: false, error: adminResult.error };
  }

  try {
    const { data, error } = await adminResult.client
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .select("id");

    if (error) return { ok: false, error: error.message };
    return { ok: true, deleted: data?.length ?? 0 };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Kayıtlar silinemedi.",
    };
  }
}

export {
  countUserPushSubscriptions,
  countTeamPushSubscriptions,
} from "@/lib/push/subscription-queries";
