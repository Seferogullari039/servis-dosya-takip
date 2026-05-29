"use server";

import { redirect } from "next/navigation";
import { mapSupabaseAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
  errorCode?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/").trim() || "/";

  if (!email || !password) {
    return { error: "E-posta ve şifre zorunludur.", errorCode: "validation" };
  }

  const supabase = await createClient();
  let error: { message: string } | null = null;

  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    error = result.error;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("ENOTFOUND") || msg.includes("fetch failed")) {
      return {
        error:
          "Supabase bağlantısı kurulamadı. /setup sayfasından API key'leri kaydedin ve sunucuyu yeniden başlatın.",
        errorCode: "unknown",
      };
    }
    throw e;
  }

  if (error) {
    const mapped = mapSupabaseAuthError(error.message);
    return { error: mapped.message, errorCode: mapped.code };
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
