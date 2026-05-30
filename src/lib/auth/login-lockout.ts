import { AUDIT_ACTIONS } from "@/lib/audit/types";
import { recordAudit } from "@/lib/audit/record";
import { getRequestAuditMeta } from "@/lib/audit/request-meta";
import {
  notifyExcessiveFailedLogins,
} from "@/lib/push/security-events";
import {
  isServiceRoleConfigured,
  tryCreateAdminClient,
} from "@/lib/supabase/admin";

const MAX_FAILURES = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function isLoginLocked(
  email: string
): Promise<{ locked: boolean; message?: string }> {
  const normalized = normalizeEmail(email);
  if (!normalized || !isServiceRoleConfigured()) {
    return { locked: false };
  }

  const admin = tryCreateAdminClient();
  if (!admin) return { locked: false };

  const since = new Date(Date.now() - LOCK_WINDOW_MS).toISOString();
  const { count, error } = await admin
    .from("login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("email", normalized)
    .eq("success", false)
    .gte("created_at", since);

  if (error) {
    console.warn("[login-lockout] count failed", error.message);
    return { locked: false };
  }

  if ((count ?? 0) >= MAX_FAILURES) {
    return {
      locked: true,
      message:
        "Çok sayıda başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.",
    };
  }

  return { locked: false };
}

export async function recordLoginAttempt(
  email: string,
  success: boolean
): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!normalized || !isServiceRoleConfigured()) return;

  const admin = tryCreateAdminClient();
  if (!admin) return;

  const meta = await getRequestAuditMeta();

  await admin.from("login_attempts").insert({
    email: normalized,
    success,
    ip_address: meta.ip_address,
    user_agent: meta.user_agent,
  });

  if (success) {
    await admin.from("login_attempts").delete().eq("email", normalized);
    return;
  }

  const since = new Date(Date.now() - LOCK_WINDOW_MS).toISOString();
  const { count } = await admin
    .from("login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("email", normalized)
    .eq("success", false)
    .gte("created_at", since);

  const failures = count ?? 0;

  await recordAudit({
    action: AUDIT_ACTIONS.LOGIN_FAILED,
    actor: { full_name: normalized, id: null, role: null },
    entity_type: "auth",
    entity_label: normalized,
    new_value: { failures },
    ip_address: meta.ip_address,
    user_agent: meta.user_agent,
  });

  if (failures >= MAX_FAILURES) {
    await recordAudit({
      action: AUDIT_ACTIONS.LOGIN_FAILED_BURST,
      actor: { full_name: normalized, id: null, role: null },
      entity_type: "auth",
      entity_label: normalized,
      new_value: { failures, lockMinutes: 15 },
      ip_address: meta.ip_address,
      user_agent: meta.user_agent,
    });
    if (failures === MAX_FAILURES) {
      notifyExcessiveFailedLogins({ email: normalized });
    }
  }
}

export async function recordLoginLockedAttempt(email: string): Promise<void> {
  const meta = await getRequestAuditMeta();
  await recordAudit({
    action: AUDIT_ACTIONS.LOGIN_LOCKED,
    actor: { full_name: normalizeEmail(email), id: null, role: null },
    entity_type: "auth",
    entity_label: normalizeEmail(email),
    ip_address: meta.ip_address,
    user_agent: meta.user_agent,
  });
}
