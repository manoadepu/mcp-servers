"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalCache = exports.ProviderCache = void 0;
exports.createCache = createCache;
const node_cache_1 = __importDefault(require("node-cache"));
const events_1 = require("./events");
/**
 * Provider cache implementation
 */
class ProviderCache {
    cache;
    namespace;
    stats;
    cleanupInterval;
    constructor(options = {}) {
        this.cache = new node_cache_1.default({
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
    startCleanupInterval() {
        this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // Clean up every 5 minutes
    }
    /**
     * Stop the cleanup interval
     */
    stopCleanupInterval() {
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
    async get(key) {
        const namespacedKey = this.getNamespacedKey(key);
        const entry = this.cache.get(namespacedKey);
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
    async set(key, value, ttl) {
        const namespacedKey = this.getNamespacedKey(key);
        const entry = {
            value,
            timestamp: Date.now(),
            expires: ttl ? Date.now() + ttl * 1000 : undefined
        };
        if (ttl !== undefined) {
            this.cache.set(namespacedKey, entry, ttl);
        }
        else {
            this.cache.set(namespacedKey, entry);
        }
        this.stats.size = Number(this.cache.stats.keys || 0);
    }
    /**
     * Delete a cached value
     * @param key Cache key
     */
    async delete(key) {
        const namespacedKey = this.getNamespacedKey(key);
        this.cache.del(namespacedKey);
        this.stats.size = Number(this.cache.stats.keys || 0);
    }
    /**
     * Clear all cached values
     */
    async clear() {
        this.cache.flushAll();
        this.stats.size = 0;
        this.stats.lastCleanup = new Date();
    }
    /**
     * Get cache statistics
     * @returns Cache stats
     */
    getStats() {
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
    has(key) {
        const namespacedKey = this.getNamespacedKey(key);
        return this.cache.has(namespacedKey);
    }
    /**
     * Get multiple cached values
     * @param keys Cache keys
     * @returns Map of cached values
     */
    async getMany(keys) {
        const result = new Map();
        const namespacedKeys = keys.map(key => this.getNamespacedKey(key));
        const entries = this.cache.mget(namespacedKeys) || {};
        for (const [namespacedKey, entry] of Object.entries(entries)) {
            if (!entry) {
                this.stats.misses++;
                continue;
            }
            const typedEntry = entry;
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
    async setMany(entries, ttl) {
        const cacheEntries = {};
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
            const option = {
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
    async deleteMany(keys) {
        const namespacedKeys = keys.map(key => this.getNamespacedKey(key));
        this.cache.del(namespacedKeys);
        this.stats.size = Number(this.cache.stats.keys || 0);
    }
    /**
     * Get namespaced cache key
     * @param key Original key
     * @returns Namespaced key
     */
    getNamespacedKey(key) {
        return `${this.namespace}:${key}`;
    }
    /**
     * Get original key from namespaced key
     * @param namespacedKey Namespaced key
     * @returns Original key
     */
    getOriginalKey(namespacedKey) {
        return namespacedKey.slice(this.namespace.length + 1);
    }
    /**
     * Set up cache invalidation on events
     * @param events Events that trigger invalidation
     */
    setupEventInvalidation(events) {
        for (const event of events) {
            events_1.globalEventBus.subscribe(event, () => this.clear());
        }
    }
    /**
     * Clean up expired entries
     */
    cleanup() {
        const keys = this.cache.keys();
        const now = Date.now();
        for (const key of keys) {
            const entry = this.cache.get(key);
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
    dispose() {
        this.stopCleanupInterval();
        this.cache.flushAll();
        this.cache.close();
    }
}
exports.ProviderCache = ProviderCache;
/**
 * Create a new cache instance
 * @param options Cache options
 * @returns Provider cache
 */
function createCache(options) {
    return new ProviderCache(options);
}
/**
 * Cache singleton instance
 */
exports.globalCache = createCache();
//# sourceMappingURL=cache.js.map