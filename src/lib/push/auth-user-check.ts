import { tryCreateAdminClient } from "@/lib/supabase/admin";

/** auth.users tablosunda user_id var mı (FK için) */
export async function checkAuthUserExists(userId: string): Promise<{
  exists: boolean;
  error?: string;
}> {
  const admin = tryCreateAdminClient();
  if (!admin) {
    return { exists: false, error: "Service role yok" };
  }

  try {
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error) {
      return { exists: false, error: error.message };
    }
    return { exists: Boolean(data?.user?.id) };
  } catch (e) {
    return {
      exists: false,
      error: e instanceof Error ? e.message : "Auth kullanıcı kontrolü başarısız",
    };
  }
}
