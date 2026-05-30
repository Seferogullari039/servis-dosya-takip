import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { Profile, UserRole } from "@/lib/auth/types";
import { mapRowToServisDosya } from "@/lib/data/map-dosya";
import { logCreated } from "@/lib/events/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  decodeSupabaseJwtRole,
  getServiceRoleKeyIssue,
  isServiceRoleApiKey,
} from "@/lib/supabase/service-role";
import type { ServisDosyasi, ServisDosyasiForm } from "@/types/servis-dosya";
import type { ServisDosyasiInsert } from "@/types/supabase";

export type CreateDosyaInsertDebug = {
  actionUsed: "createDosyaAction";
  serviceRoleConfigured: boolean;
  serviceRoleUsed: boolean;
  serviceRoleKeyLooksValid: boolean;
  jwtRole: string | null;
  userRole: UserRole | null;
  insertClient: "service_role" | "none";
  supabaseCode?: string;
  rawError?: string;
};

export type OlusturDosyaResult =
  | { ok: true; data: ServisDosyasi; debug: CreateDosyaInsertDebug }
  | { ok: false; error: string; debug: CreateDosyaInsertDebug };

function buildDebug(
  partial: Partial<CreateDosyaInsertDebug> & {
    userRole: UserRole | null;
  }
): CreateDosyaInsertDebug {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    actionUsed: "createDosyaAction",
    serviceRoleConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && key?.trim()
    ),
    serviceRoleUsed: partial.serviceRoleUsed ?? false,
    serviceRoleKeyLooksValid: isServiceRoleApiKey(key),
    jwtRole: key?.trim() ? decodeSupabaseJwtRole(key) : null,
    userRole: partial.userRole,
    insertClient: partial.insertClient ?? "none",
    supabaseCode: partial.supabaseCode,
    rawError: partial.rawError,
  };
}

export function formatCreateDosyaError(
  message: string,
  debug: CreateDosyaInsertDebug
): string {
  return `${message}\n\n[Debug]\n${JSON.stringify(debug, null, 2)}`;
}

async function assertInsertAccess(): Promise<
  | { ok: true; userId: string; profile: Profile }
  | { ok: false; error: string; userRole: UserRole | null }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: "Oturum gerekli. Lütfen tekrar giriş yapın.",
      userRole: null,
    };
  }

  const profile = await getCurrentProfile();
  if (!profile?.is_active) {
    return {
      ok: false,
      error: "Hesabınız aktif değil.",
      userRole: profile?.role ?? null,
    };
  }

  if (profile.role !== "admin" && profile.role !== "personel") {
    return {
      ok: false,
      error: "Dosya oluşturma yetkiniz yok.",
      userRole: profile.role,
    };
  }

  return { ok: true, userId: user.id, profile };
}

/**
 * Yalnızca service role ile servis_dosyalari insert.
 */
export async function insertServisDosyasiWithServiceRole(
  insertPayload: ServisDosyasiInsert,
  userRole: UserRole | null
): Promise<OlusturDosyaResult> {
  const keyIssue = getServiceRoleKeyIssue(
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  if (keyIssue) {
    const debug = buildDebug({ userRole, insertClient: "none" });
    return { ok: false, error: keyIssue, debug };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    const debug = buildDebug({ userRole, insertClient: "none" });
    return {
      ok: false,
      error: "SUPABASE_SERVICE_ROLE_KEY eksik veya okunamıyor",
      debug,
    };
  }

  const debug = buildDebug({
    userRole,
    serviceRoleUsed: true,
    insertClient: "service_role",
  });

  const { data, error } = await admin
    .from("servis_dosyalari")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      error: error.message,
      debug: {
        ...debug,
        supabaseCode: error.code,
        rawError: error.message,
      },
    };
  }

  if (!data) {
    return {
      ok: false,
      error: "Dosya oluşturuldu ancak yanıt alınamadı.",
      debug,
    };
  }

  const dosya = mapRowToServisDosya(data);
  const createdLog = await logCreated(dosya.id, dosya);
  if (!createdLog.ok) {
    console.warn("[audit] created event:", createdLog.error);
  }

  return { ok: true, data: dosya, debug };
}

/** createDosyaAction → olusturDosya (service role, debug ile). */
export async function olusturDosyaWithServiceRole(
  form: ServisDosyasiForm,
  mapFormToInsert: (form: ServisDosyasiForm) => ServisDosyasiInsert
): Promise<OlusturDosyaResult> {
  const access = await assertInsertAccess();
  if (!access.ok) {
    return {
      ok: false,
      error: access.error,
      debug: buildDebug({ userRole: access.userRole }),
    };
  }

  const insertPayload: ServisDosyasiInsert = {
    ...mapFormToInsert(form),
    deleted_at: null,
  };

  return insertServisDosyasiWithServiceRole(
    insertPayload,
    access.profile.role
  );
}
