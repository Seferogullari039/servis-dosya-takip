import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Yalnızca sunucu tarafı (API route, script).
 * ASLA NEXT_PUBLIC_ ile expose etmeyin.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ve NEXT_PUBLIC_SUPABASE_URL sunucu ortamında tanımlı olmalı."
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
