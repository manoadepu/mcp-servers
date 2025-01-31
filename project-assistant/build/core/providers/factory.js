"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerFactory = exports.ProviderFactory = void 0;
exports.registerProvider = registerProvider;
exports.createProvider = createProvider;
exports.getProviderConstructor = getProviderConstructor;
exports.hasProvider = hasProvider;
exports.getProviderTypes = getProviderTypes;
/**
 * Provider factory for managing source control providers
 */
class ProviderFactory {
    static instance;
    providers;
    constructor() {
        this.providers = new Map();
    }
    /**
     * Get factory instance
     * @returns Provider factory singleton
     */
    static getInstance() {
        if (!ProviderFactory.instance) {
            ProviderFactory.instance = new ProviderFactory();
        }
        return ProviderFactory.instance;
    }
    /**
     * Register a provider
     * @param type Provider type
     * @param provider Provider constructor
     * @throws Error if provider type already registered
     */
    registerProvider(type, provider) {
        if (this.providers.has(type)) {
            throw new Error(`Provider type '${type}' already registered`);
        }
        this.providers.set(type, provider);
    }
    /**
     * Unregister a provider
     * @param type Provider type
     * @throws Error if provider type not found
     */
    unregisterProvider(type) {
        if (!this.providers.has(type)) {
            throw new Error(`Provider type '${type}' not found`);
        }
        this.providers.delete(type);
    }
    /**
     * Create provider instance
     * @param config Provider configuration
     * @returns Provider instance
     * @throws Error if provider type not found
     */
    createProvider(config) {
        const Provider = this.providers.get(config.type);
        if (!Provider) {
            throw new Error(`Provider type '${config.type}' not found`);
        }
        return new Provider(config);
    }
    /**
     * Check if provider type is registered
     * @param type Provider type
     * @returns True if provider type is registered
     */
    hasProvider(type) {
        return this.providers.has(type);
    }
    /**
     * Get registered provider types
     * @returns Array of provider types
     */
    getProviderTypes() {
        return Array.from(this.providers.keys());
    }
    /**
     * Get provider constructor
     * @param type Provider type
     * @returns Provider constructor
     * @throws Error if provider type not found
     */
    getProviderConstructor(type) {
        const Provider = this.providers.get(type);
        if (!Provider) {
            throw new Error(`Provider type '${type}' not found`);
        }
        return Provider;
    }
    /**
     * Clear all registered providers
     */
    clear() {
        this.providers.clear();
    }
}
exports.ProviderFactory = ProviderFactory;
/**
 * Global provider factory instance
 */
exports.providerFactory = ProviderFactory.getInstance();
/**
 * Register a provider
 * @param type Provider type
 * @param provider Provider constructor
 */
function registerProvider(type, provider) {
    exports.providerFactory.registerProvider(type, provider);
}
/**
 * Create provider instance
 * @param config Provider configuration
 * @returns Provider instance
 */
function createProvider(config) {
    return exports.providerFactory.createProvider(config);
}
/**
 * Get provider constructor
 * @param type Provider type
 * @returns Provider constructor
 */
function getProviderConstructor(type) {
    return exports.providerFactory.getProviderConstructor(type);
}
/**
 * Check if provider type is registered
 * @param type Provider type
 * @returns True if provider type is registered
 */
function hasProvider(type) {
    return exports.providerFactory.hasProvider(type);
}
/**
 * Get registered provider types
 * @returns Array of provider types
 */
function getProviderTypes() {
    return exports.providerFactory.getProviderTypes();
}
//# sourceMappingURL=factory.js.map