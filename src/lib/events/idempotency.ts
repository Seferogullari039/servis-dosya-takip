import type { ServiceFileEventType } from "@/types/events";

const DEDUP_TTL_MS = 5_000;

const recentKeys = new Map<string, number>();

function pruneExpired(now: number): void {
  for (const [key, ts] of recentKeys) {
    if (now - ts > DEDUP_TTL_MS) recentKeys.delete(key);
  }
}

export function buildEventIdempotencyKey(
  serviceFileId: string,
  eventType: ServiceFileEventType,
  oldValue: Record<string, unknown> | null | undefined,
  newValue: Record<string, unknown> | null | undefined
): string {
  const oldStr = JSON.stringify(oldValue ?? null);
  const newStr = JSON.stringify(newValue ?? null);
  return `${serviceFileId}:${eventType}:${oldStr}:${newStr}`;
}

/** Returns true when the same event was logged within the dedup window. */
export function isDuplicateEvent(key: string): boolean {
  const now = Date.now();
  pruneExpired(now);

  const last = recentKeys.get(key);
  if (last !== undefined && now - last < DEDUP_TTL_MS) {
    return true;
  }

  recentKeys.set(key, now);
  return false;
}

export function clearIdempotencyKey(key: string): void {
  recentKeys.delete(key);
}
