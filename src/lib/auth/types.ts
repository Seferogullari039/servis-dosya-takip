import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "personel";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthSession {
  user: User;
  profile: Profile;
}

export const USER_ROLES: UserRole[] = ["admin", "personel"];
