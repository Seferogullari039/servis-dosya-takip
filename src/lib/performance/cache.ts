/**
 * @deprecated Import from `@/lib/cache` instead.
 * Re-exports for backward compatibility.
 */
export {
  appCache as memoryCache,
  CACHE_TTL,
  dashboardCacheKey,
  alertsCacheKey,
  invalidateDashboardCache,
  getCacheStats,
} from "@/lib/cache";
