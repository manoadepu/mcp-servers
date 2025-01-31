"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
exports.createProvider = createProvider;
const cache_1 = require("./cache");
const events_1 = require("./events");
/**
 * Base provider implementation
 */
class BaseProvider {
    type;
    name;
    version;
    config;
    cache;
    events;
    features;
    info;
    constructor(config) {
        this.config = config;
        this.type = config.type;
        this.name = this.getName();
        this.version = this.getVersion();
        this.features = new Map();
        this.events = new events_1.ProviderEventBus();
        // Set up cache
        const cacheOptions = {
            namespace: config.type,
            ttl: config.options?.caching ? 3600 : 0,
            invalidateOn: [
                'repository.update',
                'repository.delete',
                'commit.new'
            ]
        };
        this.cache = new cache_1.ProviderCache(cacheOptions);
        // Set up provider info
        this.info = {
            type: config.type,
            name: this.getName(),
            version: this.getVersion(),
            capabilities: this.getCapabilities()
        };
        // Set up error handling
        this.setupErrorHandling();
    }
    /**
     * Check if feature is supported
     * @param feature Feature name
     */
    hasFeature(feature) {
        return this.features.has(feature);
    }
    /**
     * Get feature implementation
     * @param feature Feature name
     */
    getFeature(feature) {
        return this.features.get(feature);
    }
    /**
     * Subscribe to provider events
     * @param event Event type
     * @param handler Event handler
     */
    on(event, handler) {
        this.events.subscribe(event, handler);
    }
    /**
     * Unsubscribe from provider events
     * @param event Event type
     * @param handler Event handler
     */
    off(event, handler) {
        this.events.unsubscribe(event, handler);
    }
    /**
     * Emit provider event
     * @param type Event type
     * @param data Event data
     */
    async emitEvent(type, data) {
        const event = {
            type,
            provider: this.info,
            timestamp: new Date(),
            data
        };
        await this.events.publish(type, this.info, data);
    }
    /**
     * Set up error handling
     */
    setupErrorHandling() {
        // Handle provider errors
        this.on('provider.error', async (event) => {
            console.error('Provider error:', event.data);
            // Implement retry logic or error recovery here
        });
        // Handle rate limiting
        this.on('provider.ratelimit', async (event) => {
            console.warn('Rate limit exceeded:', event.data);
            // Implement rate limit handling here
        });
    }
    /**
     * Get cached value
     * @param key Cache key
     */
    async getCached(key) {
        if (!this.config.options?.caching) {
            return undefined;
        }
        return this.cache.get(key);
    }
    /**
     * Set cached value
     * @param key Cache key
     * @param value Value to cache
     * @param ttl Time to live in seconds
     */
    async setCached(key, value, ttl) {
        if (!this.config.options?.caching) {
            return;
        }
        await this.cache.set(key, value, ttl);
    }
    /**
     * Clear provider cache
     */
    async clearCache() {
        await this.cache.clear();
    }
    /**
     * Register provider feature
     * @param name Feature name
     * @param implementation Feature implementation
     */
    registerFeature(name, implementation) {
        this.features.set(name, implementation);
    }
    /**
     * Unregister provider feature
     * @param name Feature name
     */
    unregisterFeature(name) {
        this.features.delete(name);
    }
    /**
     * Dispose of provider resources
     */
    dispose() {
        this.events.clear();
        this.features.clear();
        this.cache.dispose();
    }
}
exports.BaseProvider = BaseProvider;
/**
 * Create provider instance
 * @param config Provider configuration
 * @returns Provider instance
 */
function createProvider(Provider, config) {
    return new Provider(config);
}
//# sourceMappingURL=base.js.map