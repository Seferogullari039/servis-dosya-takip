import { createCacheAdapter } from "@/lib/cache/create-cache-adapter";
import { memoryCacheAdapter } from "@/lib/cache/memory-adapter";

export type { CacheAdapter, CacheAdapterOptions, CacheBackend, CacheStats } from "@/lib/cache/types";
export { createCacheAdapter } from "@/lib/cache/create-cache-adapter";
export { MemoryCacheAdapter, memoryCacheAdapter } from "@/lib/cache/memory-adapter";
export { createRedisCacheAdapter } from "@/lib/cache/redis-adapter";

/** Application cache — memory by default; swap via CACHE_BACKEND=redis (future). */
export const appCache = createCacheAdapter();

export const CACHE_TTL = {
  dashboard: 30_000,
  alerts: 30_000,
  dosyalar: 15_000,
} as const;

export function dashboardCacheKey(period: string): string {
  return `dashboard:${period}`;
}

export function alertsCacheKey(): string {
  return "alerts:summary";
}

export function invalidateDashboardCache(): void {
  appCache.deleteByPrefix("dashboard:");
  appCache.delete(alertsCacheKey());
}

/** Cache miss/hit stats (memory adapter only). */
export function getCacheStats() {
  return memoryCacheAdapter.stats;
}
