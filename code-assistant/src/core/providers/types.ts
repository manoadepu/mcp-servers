/**
 * Core provider system types and interfaces
 */

/**
 * Provider identification and metadata
 */
export interface ProviderInfo {
  type: string;
  name: string;
  version: string;
  capabilities: string[];
}

/**
 * Provider configuration options
 */
export interface ProviderConfig {
  type: string;
  auth?: ProviderAuth;
  options?: {
    timeout?: number;
    retries?: number;
    caching?: boolean;
    [key: string]: any;
  };
}

/**
 * Provider authentication types
 */
export type ProviderAuth = TokenAuth | OAuthAuth | SSHAuth;

export interface TokenAuth {
  type: 'token';
  token: string;
}

export interface OAuthAuth {
  type: 'oauth';
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  expiresAt?: Date;
}

export interface SSHAuth {
  type: 'ssh';
  privateKey: string;
  publicKey: string;
  passphrase?: string;
}

/**
 * Provider events
 */
export type ProviderEventType =
  | 'repository.update'
  | 'repository.delete'
  | 'commit.new'
  | 'commit.analyze'
  | 'analysis.start'
  | 'analysis.complete'
  | 'analysis.error'
  | 'provider.connect'
  | 'provider.disconnect'
  | 'provider.error'
  | 'provider.ratelimit';

export interface ProviderEvent<T = any> {
  type: ProviderEventType;
  provider: ProviderInfo;
  timestamp: Date;
  data: T;
}

export interface ProviderEventHandler<T = any> {
  (event: ProviderEvent<T>): void | Promise<void>;
}

/**
 * Provider errors
 */
export type ProviderErrorCode =
  | 'AUTH_FAILED'
  | 'PERMISSION_DENIED'
  | 'RESOURCE_NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'INVALID_REQUEST'
  | 'OPERATION_FAILED';

export interface ProviderErrorDetails {
  provider: string;
  code: ProviderErrorCode;
  operation: string;
  target?: string;
  metadata?: Record<string, any>;
}

/**
 * Cache configuration
 */
export interface CacheOptions {
  ttl?: number;
  namespace?: string;
  invalidateOn?: ProviderEventType[];
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expires?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleanup: Date;
}

/**
 * Repository types
 */
export interface Repository {
  id: string;
  name: string;
  url: string;
  defaultBranch: string;
  provider: ProviderInfo;
  metadata: Record<string, any>;
}

export interface Branch {
  name: string;
  commit: string;
  isDefault: boolean;
  protected: boolean;
  metadata: Record<string, any>;
}

export interface Author {
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string;
}

export interface Commit {
  id: string;
  message: string;
  author: Author;
  timestamp: Date;
  parents: string[];
  repository: Repository;
  metadata: Record<string, any>;
}

/**
 * Analysis types
 */
export interface CommitAnalysis {
  commit: Commit;
  complexity: {
    before: ComplexityMetrics;
    after: ComplexityMetrics;
    delta: number;
  };
  impact: {
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  recommendations: string[];
}

export interface ChangeAnalysis {
  files: Array<{
    path: string;
    type: 'added' | 'modified' | 'deleted' | 'renamed';
    complexity: ComplexityMetrics;
    riskScore: number;
    suggestions: string[];
  }>;
  summary: {
    totalFiles: number;
    riskLevel: 'low' | 'medium' | 'high';
    mainIssues: string[];
  };
}

export interface ComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  maintainability?: number;
}

/**
 * Operation types
 */
export interface HistoryOptions {
  since?: Date;
  until?: Date;
  branch?: string;
  path?: string;
  author?: string;
  maxCount?: number;
}

export interface CommitFilter {
  authors?: string[];
  paths?: string[];
  since?: Date;
  until?: Date;
  messagePattern?: RegExp;
}

export interface BranchFilter {
  namePattern?: RegExp;
  authorPattern?: RegExp;
  protected?: boolean;
}

/**
 * Provider constructor type
 */
export interface ProviderConstructor {
  new (config: ProviderConfig): SourceControlProvider;
}

/**
 * Core provider interface
 */
export interface SourceControlProvider {
  readonly type: string;
  readonly name: string;
  readonly version: string;

  getRepository(url: string): Promise<Repository>;
  getDefaultBranch(repo: Repository): Promise<string>;
  getBranches(repo: Repository): Promise<Branch[]>;

  getCommit(repo: Repository, commitId: string): Promise<Commit>;
  getCommitHistory(repo: Repository, options: HistoryOptions): Promise<Commit[]>;
  getChanges(commit: Commit): Promise<ChangeAnalysis>;

  analyzeCommit(commit: Commit): Promise<CommitAnalysis>;
  analyzeChanges(changes: ChangeAnalysis): Promise<CommitAnalysis>;

  hasFeature(feature: string): boolean;
  getFeature<T>(feature: string): T | undefined;

  on(event: ProviderEventType, handler: ProviderEventHandler): void;
  off(event: ProviderEventType, handler: ProviderEventHandler): void;
  dispose(): void;
}
