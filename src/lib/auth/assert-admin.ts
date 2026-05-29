import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { Profile } from "@/lib/auth/types";

export async function assertAdminAccess(): Promise<
  | { ok: true; profile: Profile }
  | { ok: false; error: string; status: 401 | 403 }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Oturum gerekli.", status: 401 };
  }

  const profile = await getCurrentProfile();
  if (!profile?.is_active) {
    return { ok: false, error: "Aktif oturum gerekli.", status: 401 };
  }

  if (profile.role !== "admin") {
    return {
      ok: false,
      error: "Bu işlem yalnızca admin tarafından yapılabilir.",
      status: 403,
    };
  }

  return { ok: true, profile };
}
