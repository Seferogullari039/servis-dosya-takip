export interface CacheAdapter {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlMs: number): void | Promise<void>;
  delete(key: string): void | Promise<void>;
  deleteByPrefix(prefix: string): void | Promise<void>;
  clear(): void | Promise<void>;
}

export type CacheBackend = "memory" | "redis";

export interface CacheAdapterOptions {
  backend?: CacheBackend;
  /** Future: Redis connection URL */
  redisUrl?: string;
  keyPrefix?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
}
