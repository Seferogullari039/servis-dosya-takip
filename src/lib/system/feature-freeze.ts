import type { Profile } from "@/lib/auth/types";
import { isFeatureFreezeActive, isReadonlyModeActive } from "@/lib/system/freeze";

/**
 * Product feature freeze — production productization lock.
 * Set FEATURE_FREEZE_MODE=true in production to block non-admin writes.
 * Admin override: admin role may create/update during freeze.
 */
export function isFeatureFreezeModeActive(): boolean {
  if (process.env.FEATURE_FREEZE_MODE === "false") return false;
  if (process.env.FEATURE_FREEZE_MODE === "true") return true;
  return isFeatureFreezeActive();
}

export function canWriteDuringFeatureFreeze(profile: Profile): boolean {
  return profile.role === "admin";
}

export function assertFeatureFreezeWrite(
  profile: Profile,
  operation: string
): { ok: true } | { ok: false; error: string } {
  if (!isFeatureFreezeModeActive()) return { ok: true };

  if (canWriteDuringFeatureFreeze(profile)) return { ok: true };

  return {
    ok: false,
    error: `Sistem güncelleme modu kapalı — ${operation} şu an yapılamaz. Yöneticinize başvurun.`,
  };
}

/** Combined write guard: readonly + feature freeze (admin override for freeze only). */
export function assertProductWriteAccess(
  profile: Profile,
  operation: string
): { ok: true } | { ok: false; error: string } {
  if (isReadonlyModeActive()) {
    return {
      ok: false,
      error: "Sistem salt-okunur modda — değişiklik yapılamaz.",
    };
  }

  return assertFeatureFreezeWrite(profile, operation);
}

export const FEATURE_FREEZE_POLICY = {
  envVar: "FEATURE_FREEZE_MODE",
  adminOverride: true,
  blockedOperations: [
    "create",
    "update",
    "bulk",
    "status_change",
    "payment_change",
    "note_add",
    "expert_change",
  ],
  allowedDuringFreeze: ["read", "search", "export_pdf", "view_timeline"],
} as const;
