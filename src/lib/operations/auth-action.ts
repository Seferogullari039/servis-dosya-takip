import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import type { Profile } from "@/lib/auth/types";
import { assertProductWriteAccess } from "@/lib/system/feature-freeze";
import type { DosyaDurumu } from "@/types/servis-dosya";

export async function assertOperationAccess(): Promise<
  { ok: true; profile: Profile } | { ok: false; error: string }
> {
  const profile = await getCurrentProfile();
  if (!profile?.is_active) {
    return { ok: false, error: "Aktif oturum gerekli." };
  }
  if (profile.role !== "admin" && profile.role !== "personel") {
    return { ok: false, error: "Bu işlem için yetkiniz yok." };
  }

  const writeAccess = assertProductWriteAccess(profile, "operasyon");
  if (!writeAccess.ok) return writeAccess;

  return { ok: true, profile };
}

export function canSetStatus(
  profile: Profile,
  status: DosyaDurumu
): boolean {
  if (status === "Kapandı") {
    return profile.role === "admin";
  }
  return true;
}

export function canEditExpert(profile: Profile): boolean {
  return profile.role === "admin";
}
