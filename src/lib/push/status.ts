import { isFirebaseConfigured } from "@/lib/firebase/config";
import { countUserPushSubscriptions } from "@/lib/push/subscriptions";
import type { PushDashboardStatus } from "@/types/push";

export async function getPushDashboardStatus(
  userId: string
): Promise<PushDashboardStatus> {
  const subscriptionCount = await countUserPushSubscriptions(userId);
  return {
    subscriptionCount,
    firebaseConfigured: isFirebaseConfigured(),
  };
}
