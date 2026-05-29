/**
 * System freeze & production lock helpers.
 * Controlled via environment variables — no UI changes.
 */

export interface SystemFlags {
  featureFreeze: boolean;
  safeMode: boolean;
  readonlyMode: boolean;
}

function envFlag(name: string): boolean {
  return process.env[name]?.toLowerCase() === "true";
}

export function getSystemFlags(): SystemFlags {
  return {
    featureFreeze: envFlag("FEATURE_FREEZE"),
    safeMode: envFlag("SAFE_MODE"),
    readonlyMode: envFlag("READONLY_MODE"),
  };
}

export function isFeatureFreezeActive(): boolean {
  return getSystemFlags().featureFreeze;
}

export function isSafeModeActive(): boolean {
  return getSystemFlags().safeMode;
}

export function isReadonlyModeActive(): boolean {
  return getSystemFlags().readonlyMode;
}

/** Blocks mutating operations when readonly mode is on. */
export function assertWritableOperation(operation: string): {
  ok: true;
} | {
  ok: false;
  error: string;
} {
  if (isReadonlyModeActive()) {
    return {
      ok: false,
      error: `Sistem salt-okunur modda — ${operation} devre dışı.`,
    };
  }
  return { ok: true };
}

/** Safe mode: allow reads, restrict destructive/bulk operations. */
export function assertSafeModeOperation(
  operation: string,
  options?: { allowBulk?: boolean }
): { ok: true } | { ok: false; error: string } {
  const readonly = assertWritableOperation(operation);
  if (!readonly.ok) return readonly;

  if (isSafeModeActive() && options?.allowBulk) {
    return {
      ok: false,
      error: `Güvenli mod aktif — toplu ${operation} devre dışı.`,
    };
  }

  return { ok: true };
}

/** Production lock — combine freeze + readonly for emergency. */
export function isProductionLocked(): boolean {
  const flags = getSystemFlags();
  return flags.readonlyMode || flags.featureFreeze;
}

export function getProductionLockReason(): string | null {
  const flags = getSystemFlags();
  if (flags.readonlyMode) return "READONLY_MODE=true";
  if (flags.featureFreeze) return "FEATURE_FREEZE=true";
  if (flags.safeMode) return "SAFE_MODE=true";
  return null;
}
