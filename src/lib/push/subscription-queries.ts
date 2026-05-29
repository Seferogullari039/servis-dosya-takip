import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logPush, logPushError } from "@/lib/push/logger";

export async function countTeamPushSubscriptions(): Promise<number> {
  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true });
    if (error) {
      logPushError("subscriptions", "team count failed", error);
      return 0;
    }
    return count ?? 0;
  } catch (e) {
    logPushError("subscriptions", "team count exception", e);
    return 0;
  }
}

export async function countUserPushSubscriptions(userId: string): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getTeamPushTokens(options?: {
  excludeUserId?: string;
  onlyUserId?: string;
}): Promise<{ tokens: string[]; teamTokenCount: number }> {
  try {
    const admin = createAdminClient();
    const { data: rows, error } = await admin
      .from("push_subscriptions")
      .select("fcm_token, user_id");

    if (error) {
      logPushError("subscriptions", "token fetch failed", error);
      return { tokens: [], teamTokenCount: 0 };
    }

    const teamTokenCount = rows?.length ?? 0;
    logPush("subscriptions", "push_subscriptions token count", {
      teamTokenCount,
      excludeUserId: options?.excludeUserId ?? null,
      onlyUserId: options?.onlyUserId ?? null,
    });

    if (!rows?.length) {
      return { tokens: [], teamTokenCount: 0 };
    }

    let filtered = rows;
    if (options?.onlyUserId) {
      filtered = rows.filter((r) => r.user_id === options.onlyUserId);
    } else if (options?.excludeUserId) {
      filtered = rows.filter((r) => r.user_id !== options.excludeUserId);
    }

    const tokens = [
      ...new Set(
        filtered.map((r) => r.fcm_token as string).filter((t) => Boolean(t?.trim()))
      ),
    ];

    return { tokens, teamTokenCount };
  } catch (e) {
    logPushError("subscriptions", "getTeamPushTokens exception", e);
    return { tokens: [], teamTokenCount: 0 };
  }
}

export async function getUserPushTokens(userId: string): Promise<string[]> {
  const { tokens } = await getTeamPushTokens({ onlyUserId: userId });
  return tokens;
}
