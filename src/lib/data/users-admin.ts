import { validateStrongPassword } from "@/lib/auth/password-policy";
import { mapProfileRow } from "@/lib/auth/map-profile";
import type { Profile, UserRole } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getServiceRoleKeyIssue,
  isServiceRoleApiKey,
} from "@/lib/supabase/service-role";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import type { ManagedUser, UserFormInput } from "@/types/managed-user";
import type { User } from "@supabase/supabase-js";

function assertServiceRole(): DataResult<ReturnType<typeof createAdminClient>> {
  const keyIssue = getServiceRoleKeyIssue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (keyIssue) return fail(keyIssue);
  if (!isServiceRoleApiKey(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return fail("SUPABASE_SERVICE_ROLE_KEY eksik veya geçersiz.");
  }
  try {
    return ok(createAdminClient());
  } catch {
    return fail("SUPABASE_SERVICE_ROLE_KEY eksik veya geçersiz.");
  }
}

async function listAllAuthUsers(admin: ReturnType<typeof createAdminClient>) {
  const users: User[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const batch = data.users ?? [];
    users.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return users;
}

export async function listManagedUsers(): Promise<DataResult<ManagedUser[]>> {
  const adminResult = assertServiceRole();
  if (!adminResult.ok) return adminResult;

  try {
    const admin = adminResult.data;
    const [profilesRes, authUsers] = await Promise.all([
      admin.from("profiles").select("*").order("created_at", { ascending: false }),
      listAllAuthUsers(admin),
    ]);

    if (profilesRes.error) return fail(profilesRes.error.message);

    const emailById = new Map(
      authUsers.map((u) => [u.id, u.email ?? ""])
    );

    const rows: ManagedUser[] = (profilesRes.data ?? []).map((row) => ({
      id: row.id,
      email: emailById.get(row.id) ?? "—",
      full_name: row.full_name,
      role: row.role as UserRole,
      is_active: row.is_active,
      created_at: row.created_at,
    }));

    return ok(rows);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Kullanıcılar yüklenemedi.");
  }
}

export async function getManagedUserById(
  id: string
): Promise<DataResult<ManagedUser>> {
  const list = await listManagedUsers();
  if (!list.ok) return list;
  const user = list.data.find((u) => u.id === id);
  if (!user) return fail("Kullanıcı bulunamadı.");
  return ok(user);
}

export async function createManagedUser(
  input: UserFormInput
): Promise<DataResult<{ id: string }>> {
  const adminResult = assertServiceRole();
  if (!adminResult.ok) return adminResult;

  const email = input.email.trim().toLowerCase();
  const full_name = input.full_name.trim();
  const password = input.password?.trim() ?? "";

  if (!full_name) return fail("Ad soyad zorunludur.");
  if (!email) return fail("E-posta zorunludur.");
  const passwordCheck = validateStrongPassword(password);
  if (!passwordCheck.ok) return fail(passwordCheck.error);

  try {
    const admin = adminResult.data;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: input.role },
    });

    if (error) return fail(error.message);
    const userId = data.user.id;

    const { error: profileError } = await admin.from("profiles").upsert({
      id: userId,
      full_name,
      role: input.role,
      is_active: input.is_active,
    });

    if (profileError) return fail(profileError.message);

    return ok({ id: userId });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Kullanıcı oluşturulamadı.");
  }
}

export async function updateManagedUser(
  id: string,
  input: Pick<UserFormInput, "full_name" | "role" | "is_active">,
  actor: Profile
): Promise<DataResult<null>> {
  const adminResult = assertServiceRole();
  if (!adminResult.ok) return adminResult;

  const full_name = input.full_name.trim();
  if (!full_name) return fail("Ad soyad zorunludur.");

  if (actor.id === id) {
    if (!input.is_active) {
      return fail("Kendi hesabınızı pasifleştiremezsiniz.");
    }
    if (input.role !== "admin") {
      return fail("Kendi admin rolünüzü kaldıramazsınız.");
    }
  }

  try {
    const admin = adminResult.data;
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        full_name,
        role: input.role,
        is_active: input.is_active,
      })
      .eq("id", id);

    if (profileError) return fail(profileError.message);

    const { error: metaError } = await admin.auth.admin.updateUserById(id, {
      user_metadata: { full_name, role: input.role },
    });

    if (metaError) return fail(metaError.message);

    return ok(null);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Kullanıcı güncellenemedi.");
  }
}

export async function resetManagedUserPassword(
  id: string,
  password: string,
  actor: Profile
): Promise<DataResult<null>> {
  const adminResult = assertServiceRole();
  if (!adminResult.ok) return adminResult;

  const trimmed = password.trim();
  const passwordCheck = validateStrongPassword(trimmed);
  if (!passwordCheck.ok) return fail(passwordCheck.error);

  try {
    const admin = adminResult.data;
    const { error } = await admin.auth.admin.updateUserById(id, {
      password: trimmed,
    });
    if (error) return fail(error.message);
    return ok(null);
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Şifre sıfırlanamadı."
    );
  }
}

export function mapManagedToProfile(user: ManagedUser): Profile {
  return mapProfileRow({
    id: user.id,
    full_name: user.full_name,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at,
  });
}
