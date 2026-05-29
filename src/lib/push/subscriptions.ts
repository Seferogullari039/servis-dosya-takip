import { tryCreateAdminClient } from "@/lib/supabase/admin";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";
import { checkAuthUserExists } from "@/lib/push/auth-user-check";
import { logPush } from "@/lib/push/logger";
import { logPushRegisterError } from "@/lib/push/supabase-error";
import { parseSupabaseError } from "@/lib/push/supabase-error";
import type { PushRegisterDebugPayload } from "@/types/push";
import type { PushDeviceType } from "@/types/push";

const SCHEMA_NOTE =
  "push_subscriptions.user_id → auth.users(id) ON DELETE CASCADE. device_type: ios|android|web|unknown.";

export type UpsertPushSubscriptionResult =
  | {
      ok: true;
      action: "inserted" | "updated";
      rowCount: number;
      id: string;
      debug: PushRegisterDebugPayload;
    }
  | {
      ok: false;
      error: string;
      rowCount: number;
      debug: PushRegisterDebugPayload;
    };

function baseDebug(partial: Partial<PushRegisterDebugPayload>): PushRegisterDebugPayload {
  return {
    insertAttempted: false,
    insertSuccess: null,
    updateAttempted: false,
    updateSuccess: null,
    existingRowFound: false,
    serviceRoleConfigured: isServiceRoleConfigured(),
    authUserExists: null,
    schemaNote: SCHEMA_NOTE,
    ...partial,
  };
}

type AdminClientResult =
  | { ok: true; client: NonNullable<ReturnType<typeof tryCreateAdminClient>> }
  | { ok: false; error: string; debug: PushRegisterDebugPayload };

function requireAdminClient(): AdminClientResult {
  if (!isServiceRoleConfigured()) {
    return {
      ok: false,
      error: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil",
      debug: baseDebug({}),
    };
  }
  const client = tryCreateAdminClient();
  if (!client) {
    return {
      ok: false,
      error: "Service role client oluşturulamadı",
      debug: baseDebug({}),
    };
  }
  return { ok: true, client };
}

function failFromError(
  error: unknown,
  debug: PushRegisterDebugPayload,
  userId: string,
  email?: string | null
): UpsertPushSubscriptionResult {
  const parsed = parseSupabaseError(error);
  logPushRegisterError("upsert", { userId, email, error });
  return {
    ok: false,
    error: parsed.categoryLabel,
    rowCount: 0,
    debug: {
      ...debug,
      supabaseCode: parsed.code,
      supabaseMessage: parsed.message,
      supabaseDetails: parsed.details,
      supabaseHint: parsed.hint,
      errorCategory: parsed.category,
      errorCategoryLabel: parsed.categoryLabel,
    },
  };
}

/**
 * push_subscriptions kaydı — service role (RLS bypass).
 */
export async function upsertPushSubscription(params: {
  userId: string;
  fcmToken: string;
  deviceType: PushDeviceType;
  email?: string | null;
}): Promise<UpsertPushSubscriptionResult> {
  const adminResult = requireAdminClient();
  if (!adminResult.ok) {
    logPushRegisterError("upsert", {
      userId: params.userId,
      email: params.email,
      error: adminResult.error,
    });
    return {
      ok: false,
      error: adminResult.error,
      rowCount: 0,
      debug: adminResult.debug,
    };
  }

  const authCheck = await checkAuthUserExists(params.userId);
  let debug = baseDebug({
    authUserExists: authCheck.exists,
    authUserCheckError: authCheck.error,
  });

  if (!authCheck.exists) {
    const msg = authCheck.error
      ? `auth.users kaydı bulunamadı: ${authCheck.error}`
      : "invalid user_id — auth.users tablosunda bu UUID yok (foreign key violation riski)";
    logPushRegisterError("upsert", {
      userId: params.userId,
      email: params.email,
      error: msg,
    });
    return {
      ok: false,
      error: msg,
      rowCount: 0,
      debug: {
        ...debug,
        errorCategory: "invalid_user_id",
        errorCategoryLabel: msg,
        supabaseMessage: msg,
      },
    };
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
      debug = { ...debug, existingRowFound: false };
      return failFromError(selectError, debug, params.userId, params.email);
    }

    debug = { ...debug, existingRowFound: Boolean(existing?.id) };

    if (existing?.id) {
      debug = { ...debug, updateAttempted: true };
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
        debug = { ...debug, updateSuccess: false };
        return failFromError(updateError, debug, params.userId, params.email);
      }

      debug = { ...debug, updateSuccess: true };
      logPush("register", "subscription updated", {
        userId: params.userId,
        id: updated?.id,
      });

      return {
        ok: true,
        action: "updated",
        rowCount: 1,
        id: updated?.id ?? existing.id,
        debug,
      };
    }

    debug = { ...debug, insertAttempted: true };
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
      debug = { ...debug, insertSuccess: false };
      return failFromError(insertError, debug, params.userId, params.email);
    }

    debug = { ...debug, insertSuccess: true };
    logPush("register", "subscription inserted", {
      userId: params.userId,
      id: inserted?.id,
    });

    return {
      ok: true,
      action: "inserted",
      rowCount: 1,
      id: inserted?.id ?? "",
      debug,
    };
  } catch (e) {
    return failFromError(e, debug, params.userId, params.email);
  }
}

export async function removePushSubscription(
  userId: string,
  fcmToken: string,
  email?: string | null
): Promise<{ ok: boolean; rowCount: number; error?: string }> {
  const adminResult = requireAdminClient();
  if (!adminResult.ok) {
    return { ok: false, rowCount: 0, error: adminResult.error };
  }

  try {
    const { data, error } = await adminResult.client
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("fcm_token", fcmToken)
      .select("id");

    if (error) {
      logPushRegisterError("unregister", { userId, email, error });
      return { ok: false, rowCount: 0, error: error.message };
    }
    return { ok: true, rowCount: data?.length ?? 0 };
  } catch (e) {
    logPushRegisterError("unregister", { userId, email, error: e });
    return {
      ok: false,
      rowCount: 0,
      error: e instanceof Error ? e.message : "Silinemedi",
    };
  }
}

export async function removeAllPushSubscriptionsForUser(
  userId: string,
  email?: string | null
): Promise<{ ok: true; deleted: number } | { ok: false; error: string }> {
  const adminResult = requireAdminClient();
  if (!adminResult.ok) {
    return { ok: false, error: adminResult.error };
  }

  try {
    const { data, error } = await adminResult.client
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .select("id");

    if (error) {
      logPushRegisterError("reset_all", { userId, email, error });
      return { ok: false, error: error.message };
    }
    return { ok: true, deleted: data?.length ?? 0 };
  } catch (e) {
    logPushRegisterError("reset_all", { userId, email, error: e });
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
