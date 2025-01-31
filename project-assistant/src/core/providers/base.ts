import {
  ProviderConfig,
  ProviderInfo,
  ProviderEventType,
  ProviderEventHandler,
  ProviderEvent,
  Repository,
  Branch,
  Commit,
  CommitAnalysis,
  ChangeAnalysis,
  HistoryOptions,
  CacheOptions,
  SourceControlProvider
} from './types';
import { ProviderCache } from './cache';
import { ProviderEventBus } from './events';

/**
 * Base provider implementation
 */
export abstract class BaseProvider implements SourceControlProvider {
  public readonly type: string;
  public readonly name: string;
  public readonly version: string;
  protected config: ProviderConfig;
  protected cache: ProviderCache;
  protected events: ProviderEventBus;
  protected features: Map<string, any>;
  protected info: ProviderInfo;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.type = config.type;
    this.name = this.getName();
    this.version = this.getVersion();
    this.features = new Map();
    this.events = new ProviderEventBus();

    // Set up cache
    const cacheOptions: CacheOptions = {
      namespace: config.type,
      ttl: config.options?.caching ? 3600 : 0,
      invalidateOn: [
        'repository.update',
        'repository.delete',
        'commit.new'
      ]
    };
    this.cache = new ProviderCache(cacheOptions);

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
   * Get provider name
   */
  protected abstract getName(): string;

  /**
   * Get provider version
   */
  protected abstract getVersion(): string;

  /**
   * Get provider capabilities
   */
  protected abstract getCapabilities(): string[];

  /**
   * Get repository information
   * @param url Repository URL
   */
  public abstract getRepository(url: string): Promise<Repository>;

  /**
   * Get default branch
   * @param repo Repository
   */
  public abstract getDefaultBranch(repo: Repository): Promise<string>;

  /**
   * Get repository branches
   * @param repo Repository
   */
  public abstract getBranches(repo: Repository): Promise<Branch[]>;

  /**
   * Get commit information
   * @param repo Repository
   * @param commitId Commit ID
   */
  public abstract getCommit(repo: Repository, commitId: string): Promise<Commit>;

  /**
   * Get commit history
   * @param repo Repository
   * @param options History options
   */
  public abstract getCommitHistory(
    repo: Repository,
    options: HistoryOptions
  ): Promise<Commit[]>;

  /**
   * Get changes for a commit
   * @param commit Commit
   */
  public abstract getChanges(commit: Commit): Promise<ChangeAnalysis>;

  /**
   * Analyze a commit
   * @param commit Commit
   */
  public abstract analyzeCommit(commit: Commit): Promise<CommitAnalysis>;

  /**
   * Analyze changes
   * @param changes Changes
   */
  public abstract analyzeChanges(changes: ChangeAnalysis): Promise<CommitAnalysis>;

  /**
   * Check if feature is supported
   * @param feature Feature name
   */
  public hasFeature(feature: string): boolean {
    return this.features.has(feature);
  }

  /**
   * Get feature implementation
   * @param feature Feature name
   */
  public getFeature<T>(feature: string): T | undefined {
    return this.features.get(feature) as T | undefined;
  }

  /**
   * Subscribe to provider events
   * @param event Event type
   * @param handler Event handler
   */
  public on(event: ProviderEventType, handler: ProviderEventHandler): void {
    this.events.subscribe(event, handler);
  }

  /**
   * Unsubscribe from provider events
   * @param event Event type
   * @param handler Event handler
   */
  public off(event: ProviderEventType, handler: ProviderEventHandler): void {
    this.events.unsubscribe(event, handler);
  }

  /**
   * Emit provider event
   * @param type Event type
   * @param data Event data
   */
  protected async emitEvent<T>(
    type: ProviderEventType,
    data: T
  ): Promise<void> {
    const event: ProviderEvent<T> = {
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
  private setupErrorHandling(): void {
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
  protected async getCached<T>(key: string): Promise<T | undefined> {
    if (!this.config.options?.caching) {
      return undefined;
    }
    return this.cache.get<T>(key);
  }

  /**
   * Set cached value
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds
   */
  protected async setCached<T>(
    key: string,
    value: T,
    ttl?: number
  ): Promise<void> {
    if (!this.config.options?.caching) {
      return;
    }
    await this.cache.set(key, value, ttl);
  }

  /**
   * Clear provider cache
   */
  protected async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Register provider feature
   * @param name Feature name
   * @param implementation Feature implementation
   */
  protected registerFeature<T>(name: string, implementation: T): void {
    this.features.set(name, implementation);
  }

  /**
   * Unregister provider feature
   * @param name Feature name
   */
  protected unregisterFeature(name: string): void {
    this.features.delete(name);
  }

  /**
   * Dispose of provider resources
   */
  public dispose(): void {
    this.events.clear();
    this.features.clear();
    this.cache.dispose();
  }
}

/**
 * Create provider instance
 * @param config Provider configuration
 * @returns Provider instance
 */
export function createProvider<T extends BaseProvider>(
  Provider: new (config: ProviderConfig) => T,
  config: ProviderConfig
): T {
  return new Provider(config);
}
