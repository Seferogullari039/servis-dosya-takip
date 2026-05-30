import type { UserRole } from "@/lib/auth/types";

export interface ManagedUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export type UserFormInput = {
  full_name: string;
  email: string;
  password?: string;
  role: UserRole;
  is_active: boolean;
};

export type UserOperationResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };
