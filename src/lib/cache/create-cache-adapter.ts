import { createRedisCacheAdapter } from "@/lib/cache/redis-adapter";
import { memoryCacheAdapter } from "@/lib/cache/memory-adapter";
import type { CacheAdapter, CacheAdapterOptions, CacheBackend } from "@/lib/cache/types";

function resolveBackend(options?: CacheAdapterOptions): CacheBackend {
  const env = process.env.CACHE_BACKEND as CacheBackend | undefined;
  return options?.backend ?? env ?? "memory";
}

export function createCacheAdapter(options?: CacheAdapterOptions): CacheAdapter {
  const backend = resolveBackend(options);

  if (backend === "redis") {
    return createRedisCacheAdapter({
      ...options,
      backend: "redis",
      redisUrl: options?.redisUrl ?? process.env.REDIS_URL,
    });
  }

  return memoryCacheAdapter;
}
