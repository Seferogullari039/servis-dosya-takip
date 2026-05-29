import type { Profile, UserRole } from "@/lib/auth/types";
import type { ProfileRow } from "@/types/supabase";

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    full_name: row.full_name,
    role: row.role as UserRole,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}
