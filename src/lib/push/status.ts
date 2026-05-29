import {
  getMissingFirebasePublicEnvVars,
  isFirebasePublicConfigured,
} from "@/lib/firebase/public-env";
import { isServerPushConfigured } from "@/lib/push/server-config";
import {
  countTeamPushSubscriptions,
  countUserPushSubscriptions,
} from "@/lib/push/subscription-queries";
import type { PushDashboardStatus } from "@/types/push";

export async function getPushDashboardStatus(
  userId: string
): Promise<PushDashboardStatus> {
  const subscriptionCount = await countUserPushSubscriptions(userId);
  const teamTokenCount = await countTeamPushSubscriptions();
  const missingPublicEnv = getMissingFirebasePublicEnvVars();
  return {
    subscriptionCount,
    teamTokenCount,
    tokenRegistered: subscriptionCount > 0,
    publicFirebaseReady: isFirebasePublicConfigured(),
    missingPublicEnv: [...missingPublicEnv],
    serverPushReady: isServerPushConfigured(),
  };
}
