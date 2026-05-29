import type { CacheAdapter, CacheAdapterOptions } from "@/lib/cache/types";

/**
 * Future Redis adapter stub.
 * Implement when deploying multi-instance (Vercel + Upstash / ElastiCache).
 */
export function createRedisCacheAdapter(
  _options: CacheAdapterOptions
): CacheAdapter {
  throw new Error(
    "Redis cache adapter is not implemented. Set CACHE_BACKEND=memory or omit the variable."
  );
}
