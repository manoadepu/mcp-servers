import { ProviderConfig, ProviderConstructor, SourceControlProvider } from './types';
/**
 * Provider factory for managing source control providers
 */
export declare class ProviderFactory {
    private static instance;
    private providers;
    private constructor();
    /**
     * Get factory instance
     * @returns Provider factory singleton
     */
    static getInstance(): ProviderFactory;
    /**
     * Register a provider
     * @param type Provider type
     * @param provider Provider constructor
     * @throws Error if provider type already registered
     */
    registerProvider(type: string, provider: ProviderConstructor): void;
    /**
     * Unregister a provider
     * @param type Provider type
     * @throws Error if provider type not found
     */
    unregisterProvider(type: string): void;
    /**
     * Create provider instance
     * @param config Provider configuration
     * @returns Provider instance
     * @throws Error if provider type not found
     */
    createProvider(config: ProviderConfig): SourceControlProvider;
    /**
     * Check if provider type is registered
     * @param type Provider type
     * @returns True if provider type is registered
     */
    hasProvider(type: string): boolean;
    /**
     * Get registered provider types
     * @returns Array of provider types
     */
    getProviderTypes(): string[];
    /**
     * Get provider constructor
     * @param type Provider type
     * @returns Provider constructor
     * @throws Error if provider type not found
     */
    getProviderConstructor(type: string): ProviderConstructor;
    /**
     * Clear all registered providers
     */
    clear(): void;
}
/**
 * Global provider factory instance
 */
export declare const providerFactory: ProviderFactory;
/**
 * Register a provider
 * @param type Provider type
 * @param provider Provider constructor
 */
export declare function registerProvider(type: string, provider: ProviderConstructor): void;
/**
 * Create provider instance
 * @param config Provider configuration
 * @returns Provider instance
 */
export declare function createProvider(config: ProviderConfig): SourceControlProvider;
/**
 * Get provider constructor
 * @param type Provider type
 * @returns Provider constructor
 */
export declare function getProviderConstructor(type: string): ProviderConstructor;
/**
 * Check if provider type is registered
 * @param type Provider type
 * @returns True if provider type is registered
 */
export declare function hasProvider(type: string): boolean;
/**
 * Get registered provider types
 * @returns Array of provider types
 */
export declare function getProviderTypes(): string[];
