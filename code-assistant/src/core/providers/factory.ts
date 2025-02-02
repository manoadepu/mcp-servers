import {
  ProviderConfig,
  ProviderConstructor,
  SourceControlProvider
} from './types';

/**
 * Provider factory for managing source control providers
 */
export class ProviderFactory {
  private static instance: ProviderFactory;
  private providers: Map<string, ProviderConstructor>;

  private constructor() {
    this.providers = new Map();
  }

  /**
   * Get factory instance
   * @returns Provider factory singleton
   */
  public static getInstance(): ProviderFactory {
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
  public registerProvider(
    type: string,
    provider: ProviderConstructor
  ): void {
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
  public unregisterProvider(type: string): void {
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
  public createProvider(config: ProviderConfig): SourceControlProvider {
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
  public hasProvider(type: string): boolean {
    return this.providers.has(type);
  }

  /**
   * Get registered provider types
   * @returns Array of provider types
   */
  public getProviderTypes(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get provider constructor
   * @param type Provider type
   * @returns Provider constructor
   * @throws Error if provider type not found
   */
  public getProviderConstructor(type: string): ProviderConstructor {
    const Provider = this.providers.get(type);
    if (!Provider) {
      throw new Error(`Provider type '${type}' not found`);
    }
    return Provider;
  }

  /**
   * Clear all registered providers
   */
  public clear(): void {
    this.providers.clear();
  }
}

/**
 * Global provider factory instance
 */
export const providerFactory = ProviderFactory.getInstance();

/**
 * Register a provider
 * @param type Provider type
 * @param provider Provider constructor
 */
export function registerProvider(
  type: string,
  provider: ProviderConstructor
): void {
  providerFactory.registerProvider(type, provider);
}

/**
 * Create provider instance
 * @param config Provider configuration
 * @returns Provider instance
 */
export function createProvider(config: ProviderConfig): SourceControlProvider {
  return providerFactory.createProvider(config);
}

/**
 * Get provider constructor
 * @param type Provider type
 * @returns Provider constructor
 */
export function getProviderConstructor(type: string): ProviderConstructor {
  return providerFactory.getProviderConstructor(type);
}

/**
 * Check if provider type is registered
 * @param type Provider type
 * @returns True if provider type is registered
 */
export function hasProvider(type: string): boolean {
  return providerFactory.hasProvider(type);
}

/**
 * Get registered provider types
 * @returns Array of provider types
 */
export function getProviderTypes(): string[] {
  return providerFactory.getProviderTypes();
}
