import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  formatMissingFirebasePublicEnv,
  getMissingFirebasePublicEnvVars,
  isFirebasePublicConfigured,
} from "@/lib/firebase/public-env";
import { isServerPushConfigured } from "@/lib/push/server-config";
import {
  countTeamPushSubscriptions,
  countUserPushSubscriptions,
} from "@/lib/push/subscription-queries";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const missingPublicEnv = getMissingFirebasePublicEnvVars();
  const publicFirebaseReady = isFirebasePublicConfigured();
  const serverPushReady = isServerPushConfigured();

  const [userResult, teamResult] = await Promise.all([
    countUserPushSubscriptions(user.id),
    countTeamPushSubscriptions(),
  ]);

  const subscriptionCount = userResult.count;
  const teamTokenCount = teamResult.count;
  const serviceRoleAvailable =
    userResult.meta.serviceRoleAvailable && teamResult.meta.serviceRoleAvailable;

  return NextResponse.json({
    publicFirebaseReady,
    missingPublicEnv,
    missingPublicEnvLabel: formatMissingFirebasePublicEnv(missingPublicEnv),
    serverPushReady,
    subscriptionCount,
    teamTokenCount,
    tokenRegistered: subscriptionCount > 0,
    serviceRoleAvailable,
    serviceRoleConfigured: isServiceRoleConfigured(),
    queryError: userResult.meta.queryError ?? teamResult.meta.queryError,
  });
}
