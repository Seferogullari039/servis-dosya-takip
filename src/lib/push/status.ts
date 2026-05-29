import {
  getMissingFirebasePublicEnvVars,
  isFirebasePublicConfigured,
} from "@/lib/firebase/public-env";
import { isServerPushConfigured } from "@/lib/push/server-config";
import { countUserPushSubscriptions } from "@/lib/push/subscriptions";
import type { PushDashboardStatus } from "@/types/push";

export async function getPushDashboardStatus(
  userId: string
): Promise<PushDashboardStatus> {
  const subscriptionCount = await countUserPushSubscriptions(userId);
  const missingPublicEnv = getMissingFirebasePublicEnvVars();
  return {
    subscriptionCount,
    publicFirebaseReady: isFirebasePublicConfigured(),
    missingPublicEnv: [...missingPublicEnv],
    serverPushReady: isServerPushConfigured(),
  };
}
