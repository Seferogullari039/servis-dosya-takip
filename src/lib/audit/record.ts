import type { Profile } from "@/lib/auth/types";
import type { AuditActor, RecordAuditInput } from "@/lib/audit/types";
import { getRequestAuditMeta } from "@/lib/audit/request-meta";
import {
  isServiceRoleConfigured,
  tryCreateAdminClient,
} from "@/lib/supabase/admin";
import type { Json } from "@/types/supabase";

function toJson(
  value: Record<string, unknown> | Json | null | undefined
): Json | null {
  if (value === undefined || value === null) return null;
  return value as Json;
}

export function profileToActor(profile: Profile): AuditActor {
  return {
    id: profile.id,
    full_name: profile.full_name,
    role: profile.role,
  };
}

/** Sunucu tarafı audit kaydı (service role). Hata ana akışı kesmez. */
export async function recordAudit(
  input: RecordAuditInput
): Promise<void> {
  try {
    if (!isServiceRoleConfigured()) return;
    const admin = tryCreateAdminClient();
    if (!admin) return;

    let ip = input.ip_address ?? null;
    let ua = input.user_agent ?? null;
    if (ip === null && ua === null) {
      const meta = await getRequestAuditMeta();
      ip = meta.ip_address;
      ua = meta.user_agent;
    }

    const actor = input.actor;
    await admin.from("audit_logs").insert({
      user_id: actor?.id ?? null,
      user_name: actor?.full_name ?? "Sistem",
      user_role: actor?.role ?? null,
      action: input.action,
      entity_type: input.entity_type ?? null,
      entity_id: input.entity_id ?? null,
      entity_label: input.entity_label ?? null,
      old_value: toJson(input.old_value),
      new_value: toJson(input.new_value),
      ip_address: ip,
      user_agent: ua,
    });
  } catch (e) {
    console.warn("[audit] record failed", input.action, e);
  }
}

export async function recordAuditWithProfile(
  profile: Profile | null | undefined,
  input: Omit<RecordAuditInput, "actor">
): Promise<void> {
  await recordAudit({
    ...input,
    actor: profile
      ? profileToActor(profile)
      : { full_name: "Sistem", id: null, role: null },
  });
}
