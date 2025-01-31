import NodeCache from 'node-cache';
import {
  CacheOptions,
  CacheEntry,
  CacheStats,
  ProviderEventType
} from './types';
import { globalEventBus } from './events';

/**
 * Provider cache implementation
 */
export class ProviderCache {
  private cache: NodeCache;
  private namespace: string;
  private stats: CacheStats;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(options: CacheOptions = {}) {
    this.cache = new NodeCache({
      stdTTL: options.ttl || 3600, // 1 hour default
      checkperiod: 60, // Check for expired items every minute
      useClones: false // Don't clone objects for better performance
    });

    this.namespace = options.namespace || 'default';
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastCleanup: new Date()
    };

    // Set up event invalidation
    if (options.invalidateOn) {
      this.setupEventInvalidation(options.invalidateOn);
    }

    // Set up cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Start the cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // Clean up every 5 minutes
  }

  /**
   * Stop the cleanup interval
   */
  public stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Get a cached value
   * @param key Cache key
   * @returns Cached value or undefined
   */
  public async get<T>(key: string): Promise<T | undefined> {
    const namespacedKey = this.getNamespacedKey(key);
    const entry = this.cache.get<CacheEntry<T>>(namespacedKey);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    if (entry.expires && entry.expires < Date.now()) {
      this.cache.del(namespacedKey);
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set a cached value
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const namespacedKey = this.getNamespacedKey(key);
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      expires: ttl ? Date.now() + ttl * 1000 : undefined
    };

    if (ttl !== undefined) {
      this.cache.set(namespacedKey, entry, ttl);
    } else {
      this.cache.set(namespacedKey, entry);
    }
    this.stats.size = Number(this.cache.stats.keys || 0);
  }

  /**
   * Delete a cached value
   * @param key Cache key
   */
  public async delete(key: string): Promise<void> {
    const namespacedKey = this.getNamespacedKey(key);
    this.cache.del(namespacedKey);
    this.stats.size = Number(this.cache.stats.keys || 0);
  }

  /**
   * Clear all cached values
   */
  public async clear(): Promise<void> {
    this.cache.flushAll();
    this.stats.size = 0;
    this.stats.lastCleanup = new Date();
  }

  /**
   * Get cache statistics
   * @returns Cache stats
   */
  public getStats(): CacheStats {
    return {
      ...this.stats,
      size: Number(this.cache.stats.keys || 0)
    };
  }

  /**
   * Check if a key exists in the cache
   * @param key Cache key
   * @returns True if key exists
   */
  public has(key: string): boolean {
    const namespacedKey = this.getNamespacedKey(key);
    return this.cache.has(namespacedKey);
  }

  /**
   * Get multiple cached values
   * @param keys Cache keys
   * @returns Map of cached values
   */
  public async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();
    const namespacedKeys = keys.map(key => this.getNamespacedKey(key));
    const entries = this.cache.mget<CacheEntry<T>>(namespacedKeys) || {};

    for (const [namespacedKey, entry] of Object.entries(entries)) {
      if (!entry) {
        this.stats.misses++;
        continue;
      }

      const typedEntry = entry as CacheEntry<T>;
      if (typedEntry.expires && typedEntry.expires < Date.now()) {
        this.stats.misses++;
        continue;
      }

      const originalKey = this.getOriginalKey(namespacedKey);
      result.set(originalKey, typedEntry.value);
      this.stats.hits++;
    }

    return result;
  }

  /**
   * Set multiple cached values
   * @param entries Map of key-value pairs to cache
   * @param ttl Time to live in seconds
   */
  public async setMany<T>(entries: Map<string, T>, ttl?: number): Promise<void> {
    const cacheEntries: Record<string, CacheEntry<T>> = {};
    const now = Date.now();
    const expires = ttl ? now + ttl * 1000 : undefined;

    for (const [key, value] of entries) {
      const namespacedKey = this.getNamespacedKey(key);
      cacheEntries[namespacedKey] = {
        value,
        timestamp: now,
        expires
      };
    }

    const msetOptions = Object.entries(cacheEntries).map(([key, value]) => {
      const option: { key: string; val: CacheEntry<T>; ttl?: number } = {
        key,
        val: value
      };
      if (ttl !== undefined) {
        option.ttl = ttl;
      }
      return option;
    });
    this.cache.mset(msetOptions);

    this.stats.size = Number(this.cache.stats.keys || 0);
  }

  /**
   * Delete multiple cached values
   * @param keys Cache keys
   */
  public async deleteMany(keys: string[]): Promise<void> {
    const namespacedKeys = keys.map(key => this.getNamespacedKey(key));
    this.cache.del(namespacedKeys);
    this.stats.size = Number(this.cache.stats.keys || 0);
  }

  /**
   * Get namespaced cache key
   * @param key Original key
   * @returns Namespaced key
   */
  private getNamespacedKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  /**
   * Get original key from namespaced key
   * @param namespacedKey Namespaced key
   * @returns Original key
   */
  private getOriginalKey(namespacedKey: string): string {
    return namespacedKey.slice(this.namespace.length + 1);
  }

  /**
   * Set up cache invalidation on events
   * @param events Events that trigger invalidation
   */
  private setupEventInvalidation(events: ProviderEventType[]): void {
    for (const event of events) {
      globalEventBus.subscribe(event, () => this.clear());
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const keys = this.cache.keys();
    const now = Date.now();

    for (const key of keys) {
      const entry = this.cache.get<CacheEntry<any>>(key);
      if (entry && entry.expires && entry.expires < now) {
        this.cache.del(key);
      }
    }

    this.stats.size = Number(this.cache.stats.keys || 0);
    this.stats.lastCleanup = new Date();
  }

  /**
   * Dispose of the cache instance
   */
  public dispose(): void {
    this.stopCleanupInterval();
    this.cache.flushAll();
    this.cache.close();
  }
}

/**
 * Create a new cache instance
 * @param options Cache options
 * @returns Provider cache
 */
export function createCache(options?: CacheOptions): ProviderCache {
  return new ProviderCache(options);
}

/**
 * Cache singleton instance
 */
export const globalCache = createCache();
