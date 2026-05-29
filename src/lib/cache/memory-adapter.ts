import type { CacheAdapter, CacheStats } from "@/lib/cache/types";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class MemoryCacheAdapter implements CacheAdapter {
  private store = new Map<string, CacheEntry<unknown>>();
  private prefix: string;
  stats: CacheStats = { hits: 0, misses: 0 };

  constructor(keyPrefix = "") {
    this.prefix = keyPrefix;
  }

  private scoped(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  get<T>(key: string): T | undefined {
    const scoped = this.scoped(key);
    const entry = this.store.get(scoped);
    if (!entry) {
      this.stats.misses += 1;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(scoped);
      this.stats.misses += 1;
      return undefined;
    }
    this.stats.hits += 1;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(this.scoped(key), {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(this.scoped(key));
  }

  deleteByPrefix(prefix: string): void {
    const full = this.scoped(prefix);
    for (const key of this.store.keys()) {
      if (key.startsWith(full)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
    this.stats = { hits: 0, misses: 0 };
  }
}

/** Singleton process-wide memory cache. */
export const memoryCacheAdapter = new MemoryCacheAdapter("sdt");
