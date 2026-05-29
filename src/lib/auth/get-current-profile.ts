import { getCurrentUser } from "@/lib/auth/get-current-user";
import { mapProfileRow } from "@/lib/auth/map-profile";
import type { Profile } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProfileRow(data);
}
