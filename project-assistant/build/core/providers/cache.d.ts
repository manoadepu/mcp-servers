import { CacheOptions, CacheStats } from './types';
/**
 * Provider cache implementation
 */
export declare class ProviderCache {
    private cache;
    private namespace;
    private stats;
    private cleanupInterval?;
    constructor(options?: CacheOptions);
    /**
     * Start the cleanup interval
     */
    private startCleanupInterval;
    /**
     * Stop the cleanup interval
     */
    stopCleanupInterval(): void;
    /**
     * Get a cached value
     * @param key Cache key
     * @returns Cached value or undefined
     */
    get<T>(key: string): Promise<T | undefined>;
    /**
     * Set a cached value
     * @param key Cache key
     * @param value Value to cache
     * @param ttl Time to live in seconds
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Delete a cached value
     * @param key Cache key
     */
    delete(key: string): Promise<void>;
    /**
     * Clear all cached values
     */
    clear(): Promise<void>;
    /**
     * Get cache statistics
     * @returns Cache stats
     */
    getStats(): CacheStats;
    /**
     * Check if a key exists in the cache
     * @param key Cache key
     * @returns True if key exists
     */
    has(key: string): boolean;
    /**
     * Get multiple cached values
     * @param keys Cache keys
     * @returns Map of cached values
     */
    getMany<T>(keys: string[]): Promise<Map<string, T>>;
    /**
     * Set multiple cached values
     * @param entries Map of key-value pairs to cache
     * @param ttl Time to live in seconds
     */
    setMany<T>(entries: Map<string, T>, ttl?: number): Promise<void>;
    /**
     * Delete multiple cached values
     * @param keys Cache keys
     */
    deleteMany(keys: string[]): Promise<void>;
    /**
     * Get namespaced cache key
     * @param key Original key
     * @returns Namespaced key
     */
    private getNamespacedKey;
    /**
     * Get original key from namespaced key
     * @param namespacedKey Namespaced key
     * @returns Original key
     */
    private getOriginalKey;
    /**
     * Set up cache invalidation on events
     * @param events Events that trigger invalidation
     */
    private setupEventInvalidation;
    /**
     * Clean up expired entries
     */
    private cleanup;
    /**
     * Dispose of the cache instance
     */
    dispose(): void;
}
/**
 * Create a new cache instance
 * @param options Cache options
 * @returns Provider cache
 */
export declare function createCache(options?: CacheOptions): ProviderCache;
/**
 * Cache singleton instance
 */
export declare const globalCache: ProviderCache;
