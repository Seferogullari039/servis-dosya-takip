import { getCacheStats } from "@/lib/cache";
import { logger } from "@/lib/logging";

export const PERF_THRESHOLDS = {
  /** Warn in dev when a single query exceeds this (ms) */
  maxQueryTimeMs: 800,
  /** Dashboard aggregation budget */
  dashboardBudgetMs: 1_500,
} as const;

export interface QueryTimingResult {
  label: string;
  durationMs: number;
  exceeded: boolean;
}

/** Tracks query timing and emits dev warnings when threshold exceeded. */
export async function measureGuardedQuery<T>(
  label: string,
  fn: () => Promise<T>,
  thresholdMs: number = PERF_THRESHOLDS.maxQueryTimeMs
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const durationMs = Math.round(performance.now() - start);
    const exceeded = durationMs > thresholdMs;

    if (process.env.NODE_ENV === "development") {
      const stats = getCacheStats();
      logger.debug("query timing", {
        label,
        durationMs,
        exceeded,
        cacheHits: stats.hits,
        cacheMisses: stats.misses,
      });

      if (exceeded) {
        logger.warn("query threshold exceeded", {
          label,
          durationMs,
          thresholdMs,
        });
      }
    }
  }
}

/** Log cache miss for observability (dev). */
export function trackCacheMiss(key: string): void {
  if (process.env.NODE_ENV !== "development") return;
  logger.debug("cache miss", { key, stats: getCacheStats() });
}

/** Log cache hit for observability (dev). */
export function trackCacheHit(key: string): void {
  if (process.env.NODE_ENV !== "development") return;
  logger.debug("cache hit", { key, stats: getCacheStats() });
}
