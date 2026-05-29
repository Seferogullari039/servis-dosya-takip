import {
  isServiceRoleConfigured,
  tryCreateAdminClient,
} from "@/lib/supabase/admin";
import { logPush, logPushError } from "@/lib/push/logger";

export interface PushSubscriptionQueryMeta {
  serviceRoleAvailable: boolean;
  queryError?: string;
}

function getAdminOrMeta(): {
  admin: ReturnType<typeof tryCreateAdminClient>;
  meta: PushSubscriptionQueryMeta;
} {
  if (!isServiceRoleConfigured()) {
    return {
      admin: null,
      meta: {
        serviceRoleAvailable: false,
        queryError: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil",
      },
    };
  }
  const admin = tryCreateAdminClient();
  if (!admin) {
    return {
      admin: null,
      meta: {
        serviceRoleAvailable: false,
        queryError: "Service role client oluşturulamadı",
      },
    };
  }
  return { admin, meta: { serviceRoleAvailable: true } };
}

export async function countTeamPushSubscriptions(): Promise<{
  count: number;
  meta: PushSubscriptionQueryMeta;
}> {
  const { admin, meta } = getAdminOrMeta();
  if (!admin) return { count: 0, meta };

  try {
    const { count, error } = await admin
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true });
    if (error) {
      logPushError("subscriptions", "team count failed", error);
      return { count: 0, meta: { ...meta, queryError: error.message } };
    }
    return { count: count ?? 0, meta };
  } catch (e) {
    logPushError("subscriptions", "team count exception", e);
    return {
      count: 0,
      meta: {
        ...meta,
        queryError: e instanceof Error ? e.message : "Sorgu hatası",
      },
    };
  }
}

/** Kullanıcının token sayısı — yalnızca service role */
export async function countUserPushSubscriptions(userId: string): Promise<{
  count: number;
  meta: PushSubscriptionQueryMeta;
}> {
  const { admin, meta } = getAdminOrMeta();
  if (!admin) return { count: 0, meta };

  try {
    const { count, error } = await admin
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) {
      logPushError("subscriptions", "user count failed", error, { userId });
      return { count: 0, meta: { ...meta, queryError: error.message } };
    }
    return { count: count ?? 0, meta };
  } catch (e) {
    logPushError("subscriptions", "user count exception", e, { userId });
    return {
      count: 0,
      meta: {
        ...meta,
        queryError: e instanceof Error ? e.message : "Sorgu hatası",
      },
    };
  }
}

/** Giriş yapan kullanıcının FCM tokenları — service role, user_id filtresi */
export async function getUserPushTokensAdmin(userId: string): Promise<{
  tokens: string[];
  userTokenCount: number;
  meta: PushSubscriptionQueryMeta;
}> {
  const { admin, meta } = getAdminOrMeta();
  if (!admin) {
    return { tokens: [], userTokenCount: 0, meta };
  }

  try {
    const { data, error } = await admin
      .from("push_subscriptions")
      .select("fcm_token")
      .eq("user_id", userId);

    if (error) {
      logPushError("subscriptions", "user tokens failed", error, { userId });
      return {
        tokens: [],
        userTokenCount: 0,
        meta: { ...meta, queryError: error.message },
      };
    }

    const tokens = [
      ...new Set(
        (data ?? [])
          .map((r) => r.fcm_token as string)
          .filter((t) => Boolean(t?.trim()))
      ),
    ];

    logPush("subscriptions", "user tokens loaded (service role)", {
      userId,
      userTokenCount: tokens.length,
    });

    return { tokens, userTokenCount: tokens.length, meta };
  } catch (e) {
    logPushError("subscriptions", "user tokens exception", e, { userId });
    return {
      tokens: [],
      userTokenCount: 0,
      meta: {
        ...meta,
        queryError: e instanceof Error ? e.message : "Sorgu hatası",
      },
    };
  }
}

export async function getTeamPushTokens(options?: {
  excludeUserId?: string;
}): Promise<{
  tokens: string[];
  teamTokenCount: number;
  meta: PushSubscriptionQueryMeta;
}> {
  const { admin, meta } = getAdminOrMeta();
  if (!admin) {
    return { tokens: [], teamTokenCount: 0, meta };
  }

  try {
    let query = admin.from("push_subscriptions").select("fcm_token, user_id");

    if (options?.excludeUserId) {
      query = query.neq("user_id", options.excludeUserId);
    }

    const { data: rows, error } = await query;

    if (error) {
      logPushError("subscriptions", "team token fetch failed", error);
      return { tokens: [], teamTokenCount: 0, meta: { ...meta, queryError: error.message } };
    }

    const teamTokenCount = rows?.length ?? 0;
    const tokens = [
      ...new Set(
        (rows ?? [])
          .map((r) => r.fcm_token as string)
          .filter((t) => Boolean(t?.trim()))
      ),
    ];

    logPush("subscriptions", "team tokens loaded (service role)", {
      teamTokenCount,
      targetTokenCount: tokens.length,
      excludeUserId: options?.excludeUserId ?? null,
    });

    return { tokens, teamTokenCount, meta };
  } catch (e) {
    logPushError("subscriptions", "getTeamPushTokens exception", e);
    return {
      tokens: [],
      teamTokenCount: 0,
      meta: {
        ...meta,
        queryError: e instanceof Error ? e.message : "Sorgu hatası",
      },
    };
  }
}
