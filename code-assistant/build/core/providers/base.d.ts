import { ProviderConfig, ProviderInfo, ProviderEventType, ProviderEventHandler, Repository, Branch, Commit, CommitAnalysis, ChangeAnalysis, HistoryOptions, SourceControlProvider } from './types';
import { ProviderCache } from './cache';
import { ProviderEventBus } from './events';
/**
 * Base provider implementation
 */
export declare abstract class BaseProvider implements SourceControlProvider {
    readonly type: string;
    readonly name: string;
    readonly version: string;
    protected config: ProviderConfig;
    protected cache: ProviderCache;
    protected events: ProviderEventBus;
    protected features: Map<string, any>;
    protected info: ProviderInfo;
    constructor(config: ProviderConfig);
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
    abstract getRepository(url: string): Promise<Repository>;
    /**
     * Get default branch
     * @param repo Repository
     */
    abstract getDefaultBranch(repo: Repository): Promise<string>;
    /**
     * Get repository branches
     * @param repo Repository
     */
    abstract getBranches(repo: Repository): Promise<Branch[]>;
    /**
     * Get commit information
     * @param repo Repository
     * @param commitId Commit ID
     */
    abstract getCommit(repo: Repository, commitId: string): Promise<Commit>;
    /**
     * Get commit history
     * @param repo Repository
     * @param options History options
     */
    abstract getCommitHistory(repo: Repository, options: HistoryOptions): Promise<Commit[]>;
    /**
     * Get changes for a commit
     * @param commit Commit
     */
    abstract getChanges(commit: Commit): Promise<ChangeAnalysis>;
    /**
     * Analyze a commit
     * @param commit Commit
     */
    abstract analyzeCommit(commit: Commit): Promise<CommitAnalysis>;
    /**
     * Analyze changes
     * @param changes Changes
     */
    abstract analyzeChanges(changes: ChangeAnalysis): Promise<CommitAnalysis>;
    /**
     * Check if feature is supported
     * @param feature Feature name
     */
    hasFeature(feature: string): boolean;
    /**
     * Get feature implementation
     * @param feature Feature name
     */
    getFeature<T>(feature: string): T | undefined;
    /**
     * Subscribe to provider events
     * @param event Event type
     * @param handler Event handler
     */
    on(event: ProviderEventType, handler: ProviderEventHandler): void;
    /**
     * Unsubscribe from provider events
     * @param event Event type
     * @param handler Event handler
     */
    off(event: ProviderEventType, handler: ProviderEventHandler): void;
    /**
     * Emit provider event
     * @param type Event type
     * @param data Event data
     */
    protected emitEvent<T>(type: ProviderEventType, data: T): Promise<void>;
    /**
     * Set up error handling
     */
    private setupErrorHandling;
    /**
     * Get cached value
     * @param key Cache key
     */
    protected getCached<T>(key: string): Promise<T | undefined>;
    /**
     * Set cached value
     * @param key Cache key
     * @param value Value to cache
     * @param ttl Time to live in seconds
     */
    protected setCached<T>(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Clear provider cache
     */
    protected clearCache(): Promise<void>;
    /**
     * Register provider feature
     * @param name Feature name
     * @param implementation Feature implementation
     */
    protected registerFeature<T>(name: string, implementation: T): void;
    /**
     * Unregister provider feature
     * @param name Feature name
     */
    protected unregisterFeature(name: string): void;
    /**
     * Dispose of provider resources
     */
    dispose(): void;
}
/**
 * Create provider instance
 * @param config Provider configuration
 * @returns Provider instance
 */
export declare function createProvider<T extends BaseProvider>(Provider: new (config: ProviderConfig) => T, config: ProviderConfig): T;
