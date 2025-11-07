/**
 * Cache Manager
 * In-memory caching with TTL and size limits
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  size: number;
}

interface CacheConfig {
  maxSize?: number; // Max cache size in bytes (default: 10MB)
  defaultTTL?: number; // Default TTL in milliseconds (default: 5 minutes)
  onEvict?: (key: string, value: unknown) => void;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private currentSize = 0;
  private readonly maxSize: number;
  private readonly defaultTTL: number;
  private readonly onEvict?: (key: string, value: unknown) => void;

  constructor(config: CacheConfig = {}) {
    this.maxSize = config.maxSize || 10 * 1024 * 1024; // 10MB default
    this.defaultTTL = config.defaultTTL || 5 * 60 * 1000; // 5 minutes default
    this.onEvict = config.onEvict;

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const size = this.estimateSize(value);

    // Check if value is too large
    if (size > this.maxSize) {
      console.warn(`[CacheManager] Value for key "${key}" exceeds max cache size`);
      return;
    }

    // Evict entries if needed to make space
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictOldest();
    }

    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    // Delete old entry if exists
    if (this.cache.has(key)) {
      this.delete(key);
    }

    this.cache.set(key, { value, expiresAt, size });
    this.currentSize += size;
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    this.cache.delete(key);
    this.currentSize -= entry.size;

    if (this.onEvict) {
      this.onEvict(key, entry.value);
    }

    return true;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      currentSize: this.currentSize,
      maxSize: this.maxSize,
      utilizationPct: (this.currentSize / this.maxSize) * 100,
    };
  }

  /**
   * Get or set value (fetch if not in cache)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[CacheManager] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Evict oldest entry (FIFO)
   */
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.delete(firstKey);
    }
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: unknown): number {
    if (value === null || value === undefined) {
      return 8;
    }

    if (typeof value === 'string') {
      return value.length * 2; // UTF-16 encoding
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return 8;
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).length * 2;
      } catch {
        return 1024; // Default estimate for objects that can't be stringified
      }
    }

    return 8;
  }
}

// Global cache instance
export const globalCache = new CacheManager({
  maxSize: 50 * 1024 * 1024, // 50MB
  defaultTTL: 5 * 60 * 1000, // 5 minutes
});

// Specific caches for different data types
export const caches = {
  // User data cache (10 minutes TTL)
  user: new CacheManager({
    maxSize: 5 * 1024 * 1024,
    defaultTTL: 10 * 60 * 1000,
  }),

  // API responses cache (5 minutes TTL)
  api: new CacheManager({
    maxSize: 20 * 1024 * 1024,
    defaultTTL: 5 * 60 * 1000,
  }),

  // ML results cache (30 minutes TTL)
  ml: new CacheManager({
    maxSize: 10 * 1024 * 1024,
    defaultTTL: 30 * 60 * 1000,
  }),

  // Static data cache (1 hour TTL)
  static: new CacheManager({
    maxSize: 5 * 1024 * 1024,
    defaultTTL: 60 * 60 * 1000,
  }),
};
