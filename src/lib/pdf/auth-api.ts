import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export type PdfAuthResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

/** API route: authenticated + aktif admin/personel */
export async function assertPdfAccess(): Promise<PdfAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false, status: 401, error: "Yetkisiz erişim. Giriş yapın." };
  }

  const profile = await getCurrentProfile();
  if (!profile?.is_active) {
    return {
      ok: false,
      status: 403,
      error: "Hesabınız aktif değil veya profil bulunamadı.",
    };
  }

  if (profile.role !== "admin" && profile.role !== "personel") {
    return {
      ok: false,
      status: 403,
      error: "PDF oluşturma yetkiniz bulunmuyor.",
    };
  }

  return { ok: true };
}
