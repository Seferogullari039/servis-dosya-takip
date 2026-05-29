import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { AuthSession } from "@/lib/auth/types";

export async function requireAuth(): Promise<AuthSession> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?reason=session_expired");
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?reason=auth_required");
  }

  if (!profile.is_active) {
    redirect("/login?reason=account_inactive");
  }

  return { user, profile };
}
