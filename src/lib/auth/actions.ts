"use server";

import { redirect } from "next/navigation";
import { AUDIT_ACTIONS } from "@/lib/audit/types";
import { recordAuditWithProfile } from "@/lib/audit/record";
import {
  isLoginLocked,
  recordLoginAttempt,
  recordLoginLockedAttempt,
} from "@/lib/auth/login-lockout";
import { mapSupabaseAuthError } from "@/lib/auth/errors";
import { mapProfileRow } from "@/lib/auth/map-profile";
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

  const lock = await isLoginLocked(email);
  if (lock.locked) {
    await recordLoginLockedAttempt(email);
    return {
      error: lock.message ?? "Hesap geçici olarak kilitlendi.",
      errorCode: "locked",
    };
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
    await recordLoginAttempt(email, false);
    const mapped = mapSupabaseAuthError(error.message);
    return { error: mapped.message, errorCode: mapped.code };
  }

  await recordLoginAttempt(email, true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileRow) {
      const profile = mapProfileRow(profileRow);
      if (!profile.is_active) {
        await supabase.auth.signOut();
        return {
          error: "Hesabınız pasif durumda. Yöneticinizle iletişime geçin.",
          errorCode: "inactive",
        };
      }

      await recordAuditWithProfile(profile, {
        action: AUDIT_ACTIONS.LOGIN_SUCCESS,
        entity_type: "auth",
        entity_id: user.id,
        entity_label: email,
      });
    }
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
