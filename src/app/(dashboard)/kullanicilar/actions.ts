"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AUDIT_ACTIONS } from "@/lib/audit/types";
import { recordAuditWithProfile } from "@/lib/audit/record";
import { assertAdminAccess } from "@/lib/auth/assert-admin";
import { validateStrongPassword } from "@/lib/auth/password-policy";
import {
  createManagedUser,
  getManagedUserById,
  resetManagedUserPassword,
  updateManagedUser,
} from "@/lib/data/users-admin";
import {
  notifyUserCreated,
  notifyUserRoleChanged,
} from "@/lib/push/events";
import { notifyUserDeactivated } from "@/lib/push/security-events";
import type { UserRole } from "@/lib/auth/types";
import type { UserOperationResult } from "@/types/managed-user";

function parseRole(value: FormDataEntryValue | null): UserRole | null {
  const role = String(value ?? "").trim();
  if (role === "admin" || role === "personel") return role;
  return null;
}

export async function createUserAction(
  _prev: UserOperationResult,
  formData: FormData
): Promise<UserOperationResult> {
  const auth = await assertAdminAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const role = parseRole(formData.get("role"));
  if (!role) return { ok: false, error: "Geçersiz rol." };

  const password = String(formData.get("password") ?? "");
  const pwCheck = validateStrongPassword(password);
  if (!pwCheck.ok) return { ok: false, error: pwCheck.error };

  const email = String(formData.get("email") ?? "").trim();
  const full_name = String(formData.get("full_name") ?? "").trim();

  const result = await createManagedUser({
    full_name,
    email,
    password,
    role,
    is_active: formData.get("is_active") === "on",
  });

  if (!result.ok) return { ok: false, error: result.error };

  await recordAuditWithProfile(auth.profile, {
    action: AUDIT_ACTIONS.USER_CREATE,
    entity_type: "user",
    entity_id: result.data.id,
    entity_label: email,
    new_value: { full_name, email, role, is_active: formData.get("is_active") === "on" },
  });

  notifyUserCreated({
    email,
    role,
    excludeUserId: auth.profile.id,
  });

  revalidatePath("/kullanicilar");
  redirect(`/kullanicilar/${result.data.id}`);
}

export async function updateUserAction(
  _prev: UserOperationResult,
  formData: FormData
): Promise<UserOperationResult> {
  const auth = await assertAdminAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Kullanıcı kimliği eksik." };

  const role = parseRole(formData.get("role"));
  if (!role) return { ok: false, error: "Geçersiz rol." };

  const before = await getManagedUserById(id);
  if (!before.ok) return { ok: false, error: before.error };

  const is_active = formData.get("is_active") === "on";
  const full_name = String(formData.get("full_name") ?? "").trim();

  const result = await updateManagedUser(
    id,
    { full_name, role, is_active },
    auth.profile
  );

  if (!result.ok) return { ok: false, error: result.error };

  if (before.data.role !== role) {
    await recordAuditWithProfile(auth.profile, {
      action: AUDIT_ACTIONS.USER_ROLE_CHANGE,
      entity_type: "user",
      entity_id: id,
      entity_label: before.data.email,
      old_value: { role: before.data.role },
      new_value: { role },
    });
    notifyUserRoleChanged({
      email: before.data.email,
      previousRole: before.data.role,
      newRole: role,
      excludeUserId: auth.profile.id,
    });
  }

  if (before.data.is_active !== is_active) {
    await recordAuditWithProfile(auth.profile, {
      action: AUDIT_ACTIONS.USER_ACTIVE_CHANGE,
      entity_type: "user",
      entity_id: id,
      entity_label: before.data.email,
      old_value: { is_active: before.data.is_active },
      new_value: { is_active },
    });
    if (!is_active) {
      notifyUserDeactivated({
        email: before.data.email,
        fullName: full_name,
        excludeUserId: auth.profile.id,
      });
    }
  }

  revalidatePath("/kullanicilar");
  revalidatePath(`/kullanicilar/${id}`);
  return { ok: true, id };
}

export async function resetPasswordAction(
  _prev: UserOperationResult,
  formData: FormData
): Promise<UserOperationResult> {
  const auth = await assertAdminAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Kullanıcı kimliği eksik." };

  const password = String(formData.get("password") ?? "");
  const pwCheck = validateStrongPassword(password);
  if (!pwCheck.ok) return { ok: false, error: pwCheck.error };

  const user = await getManagedUserById(id);
  if (!user.ok) return { ok: false, error: user.error };

  const result = await resetManagedUserPassword(id, password, auth.profile);

  if (!result.ok) return { ok: false, error: result.error };

  await recordAuditWithProfile(auth.profile, {
    action: AUDIT_ACTIONS.USER_PASSWORD_RESET,
    entity_type: "user",
    entity_id: id,
    entity_label: user.data.email,
  });

  return { ok: true, id };
}

export async function toggleUserActiveAction(
  userId: string,
  isActive: boolean
): Promise<UserOperationResult> {
  const auth = await assertAdminAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const current = await getManagedUserById(userId);
  if (!current.ok) return { ok: false, error: current.error };

  const result = await updateManagedUser(
    userId,
    {
      full_name: current.data.full_name,
      role: current.data.role,
      is_active: isActive,
    },
    auth.profile
  );

  if (!result.ok) return { ok: false, error: result.error };

  await recordAuditWithProfile(auth.profile, {
    action: AUDIT_ACTIONS.USER_ACTIVE_CHANGE,
    entity_type: "user",
    entity_id: userId,
    entity_label: current.data.email,
    old_value: { is_active: current.data.is_active },
    new_value: { is_active: isActive },
  });

  if (!isActive) {
    notifyUserDeactivated({
      email: current.data.email,
      fullName: current.data.full_name,
      excludeUserId: auth.profile.id,
    });
  }

  revalidatePath("/kullanicilar");
  revalidatePath(`/kullanicilar/${userId}`);
  return { ok: true, id: userId };
}
