"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdminAccess } from "@/lib/auth/assert-admin";
import {
  createManagedUser,
  resetManagedUserPassword,
  updateManagedUser,
} from "@/lib/data/users-admin";
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

  const result = await createManagedUser({
    full_name: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role,
    is_active: formData.get("is_active") === "on",
  });

  if (!result.ok) return { ok: false, error: result.error };

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

  const result = await updateManagedUser(
    id,
    {
      full_name: String(formData.get("full_name") ?? ""),
      role,
      is_active: formData.get("is_active") === "on",
    },
    auth.profile
  );

  if (!result.ok) return { ok: false, error: result.error };

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

  const result = await resetManagedUserPassword(
    id,
    String(formData.get("password") ?? ""),
    auth.profile
  );

  if (!result.ok) return { ok: false, error: result.error };

  return { ok: true, id };
}

export async function toggleUserActiveAction(
  userId: string,
  isActive: boolean
): Promise<UserOperationResult> {
  const auth = await assertAdminAccess();
  if (!auth.ok) return { ok: false, error: auth.error };

  const { getManagedUserById } = await import("@/lib/data/users-admin");
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

  revalidatePath("/kullanicilar");
  revalidatePath(`/kullanicilar/${userId}`);
  return { ok: true, id: userId };
}
