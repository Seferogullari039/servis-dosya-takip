import {
  isServiceRoleConfigured,
  tryCreateAdminClient,
} from "@/lib/supabase/admin";
import { logPush, logPushError } from "@/lib/push/logger";

export interface PushSubscriptionQueryMeta {
  serviceRoleAvailable: boolean;
  queryError?: string;
}

export type PushSubscriptionRow = {
  fcm_token: string;
  user_id: string;
};

function dedupeTokens(rows: PushSubscriptionRow[]): string[] {
  return [
    ...new Set(
      rows
        .map((r) => r.fcm_token)
        .filter((t) => Boolean(t?.trim()))
    ),
  ];
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

/**
 * Push Test ve dispatchTeamPush için ortak service role sorgusu.
 * push_subscriptions tablosundan fcm_token + user_id okur (RLS bypass).
 */
export async function fetchPushSubscriptionTokensAdmin(options?: {
  userId?: string;
}): Promise<{
  rows: PushSubscriptionRow[];
  tokens: string[];
  meta: PushSubscriptionQueryMeta;
}> {
  const { admin, meta } = getAdminOrMeta();
  if (!admin) {
    return { rows: [], tokens: [], meta };
  }

  try {
    let query = admin.from("push_subscriptions").select("fcm_token, user_id");

    if (options?.userId) {
      query = query.eq("user_id", options.userId);
    }

    const { data, error } = await query;

    if (error) {
      logPushError("subscriptions", "fetchPushSubscriptionTokensAdmin failed", error, {
        userId: options?.userId ?? null,
      });
      return {
        rows: [],
        tokens: [],
        meta: { ...meta, queryError: error.message },
      };
    }

    const rows = (data ?? []) as PushSubscriptionRow[];
    const tokens = dedupeTokens(rows);

    logPush("subscriptions", "fetchPushSubscriptionTokensAdmin", {
      userId: options?.userId ?? "all",
      rowCount: rows.length,
      tokenCount: tokens.length,
    });

    return { rows, tokens, meta };
  } catch (e) {
    logPushError("subscriptions", "fetchPushSubscriptionTokensAdmin exception", e, {
      userId: options?.userId ?? null,
    });
    return {
      rows: [],
      tokens: [],
      meta: {
        ...meta,
        queryError: e instanceof Error ? e.message : "Sorgu hatası",
      },
    };
  }
}

export async function countTeamPushSubscriptions(): Promise<{
  count: number;
  meta: PushSubscriptionQueryMeta;
}> {
  const { rows, meta } = await fetchPushSubscriptionTokensAdmin();
  return { count: rows.length, meta };
}

/** Kullanıcının token sayısı — yalnızca service role */
export async function countUserPushSubscriptions(userId: string): Promise<{
  count: number;
  meta: PushSubscriptionQueryMeta;
}> {
  const { rows, meta } = await fetchPushSubscriptionTokensAdmin({ userId });
  return { count: rows.length, meta };
}

/** Push Test ile aynı sorgu — giriş yapan kullanıcının tokenları */
export async function getUserPushTokensAdmin(userId: string): Promise<{
  tokens: string[];
  userTokenCount: number;
  meta: PushSubscriptionQueryMeta;
}> {
  const { rows, tokens, meta } = await fetchPushSubscriptionTokensAdmin({
    userId,
  });

  logPush("subscriptions", "user tokens loaded (service role)", {
    userId,
    userTokenCount: tokens.length,
    rowCount: rows.length,
  });

  return { tokens, userTokenCount: tokens.length, meta };
}

/** Tüm ekip tokenları — Push Test ile aynı fetch, exclude gönderimde uygulanır */
export async function getTeamPushTokens(): Promise<{
  rows: PushSubscriptionRow[];
  tokens: string[];
  teamTokenCount: number;
  meta: PushSubscriptionQueryMeta;
}> {
  const { rows, tokens, meta } = await fetchPushSubscriptionTokensAdmin();

  logPush("subscriptions", "team tokens loaded (service role)", {
    teamTokenCount: rows.length,
    uniqueTokenCount: tokens.length,
  });

  return {
    rows,
    tokens,
    teamTokenCount: rows.length,
    meta,
  };
}

/** exclude sonrası hedef; ekip boş kalmaz (tek kullanıcıda tüm tokenlar) */
export function resolveTeamPushTargetTokens(
  rows: PushSubscriptionRow[],
  allTokens: string[],
  excludeUserId?: string
): string[] {
  if (!excludeUserId) {
    return allTokens;
  }

  const filteredRows = rows.filter((r) => r.user_id !== excludeUserId);
  const filtered = dedupeTokens(filteredRows);

  if (filtered.length > 0) {
    return filtered;
  }

  if (allTokens.length > 0) {
    logPush("subscriptions", "exclude yielded zero tokens; using full team list", {
      excludeUserId,
      teamTokenCount: rows.length,
    });
  }

  return allTokens;
}
