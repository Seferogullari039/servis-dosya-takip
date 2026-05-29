import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  formatMissingFirebasePublicEnv,
  getMissingFirebasePublicEnvVars,
  isFirebasePublicConfigured,
} from "@/lib/firebase/public-env";
import { isServerPushConfigured } from "@/lib/push/server-config";
import { countUserPushSubscriptions } from "@/lib/push/subscriptions";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const missingPublicEnv = getMissingFirebasePublicEnvVars();
  const publicFirebaseReady = isFirebasePublicConfigured();
  const serverPushReady = isServerPushConfigured();
  const subscriptionCount = await countUserPushSubscriptions(user.id);

  return NextResponse.json({
    publicFirebaseReady,
    missingPublicEnv,
    missingPublicEnvLabel: formatMissingFirebasePublicEnv(missingPublicEnv),
    serverPushReady,
    subscriptionCount,
  });
}
