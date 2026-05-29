import {
  getMissingFirebasePublicEnvVars,
  isFirebasePublicConfigured,
} from "@/lib/firebase/public-env";
import {
  countTeamPushSubscriptions,
  countUserPushSubscriptions,
} from "@/lib/push/subscription-queries";
import { isServerPushConfigured } from "@/lib/push/server-config";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";
import type { PushDashboardStatus } from "@/types/push";

export async function getPushDashboardStatus(
  userId: string
): Promise<PushDashboardStatus> {
  const [userResult, teamResult] = await Promise.all([
    countUserPushSubscriptions(userId),
    countTeamPushSubscriptions(),
  ]);

  const missingPublicEnv = getMissingFirebasePublicEnvVars();
  const subscriptionCount = userResult.count;
  const teamTokenCount = teamResult.count;

  return {
    subscriptionCount,
    teamTokenCount,
    tokenRegistered: subscriptionCount > 0,
    publicFirebaseReady: isFirebasePublicConfigured(),
    missingPublicEnv: [...missingPublicEnv],
    serverPushReady: isServerPushConfigured(),
    serviceRoleAvailable:
      userResult.meta.serviceRoleAvailable && teamResult.meta.serviceRoleAvailable,
    serviceRoleConfigured: isServiceRoleConfigured(),
    queryError: userResult.meta.queryError ?? teamResult.meta.queryError,
  };
}
