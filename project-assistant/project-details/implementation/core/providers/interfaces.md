# Source Control Provider Interfaces

## Core Interfaces

### Provider Types
```typescript
// Provider type definition
interface ProviderConstructor {
  new (config: ProviderConfig): SourceControlProvider;
}

// Provider identification
interface ProviderInfo {
  type: string;
  name: string;
  version: string;
  capabilities: string[];
}
```

### Repository Types
```typescript
interface Branch {
  name: string;
  commit: string;
  isDefault: boolean;
  protected: boolean;
  metadata: Record<string, any>;
}

interface Tag {
  name: string;
  commit: string;
  message?: string;
  tagger?: Author;
  metadata: Record<string, any>;
}

interface Author {
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string;
}

interface CommitSignature {
  signer: Author;
  verified: boolean;
  algorithm?: string;
  timestamp: Date;
}
```

### Analysis Types
```typescript
interface CommitAnalysis {
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

interface ChangeAnalysis {
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

interface HistoryAnalysis {
  timeRange: {
    start: Date;
    end: Date;
  };
  commits: number;
  authors: number;
  complexityTrend: Array<{
    timestamp: Date;
    complexity: number;
  }>;
  hotspots: Array<{
    path: string;
    changes: number;
    complexity: number;
  }>;
}
```

### Operation Types
```typescript
interface HistoryOptions {
  since?: Date;
  until?: Date;
  branch?: string;
  path?: string;
  author?: string;
  maxCount?: number;
}

interface CommitFilter {
  authors?: string[];
  paths?: string[];
  since?: Date;
  until?: Date;
  messagePattern?: RegExp;
}

interface BranchFilter {
  namePattern?: RegExp;
  authorPattern?: RegExp;
  protected?: boolean;
}
```

## Provider-Specific Interfaces

### Git Provider
```typescript
interface GitProviderConfig extends ProviderConfig {
  gitPath?: string;
  sshKey?: {
    private: string;
    public: string;
    passphrase?: string;
  };
  workingDir?: string;
}

interface GitCommitExtra {
  tree: string;
  gpgSignature?: string;
  verificationStatus?: 'verified' | 'unsigned' | 'invalid';
}
```

### GitHub Provider
```typescript
interface GitHubProviderConfig extends ProviderConfig {
  apiUrl?: string;
  enterprise?: boolean;
  appId?: string;
  installationId?: string;
}

interface GitHubPRInfo {
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed' | 'merged';
  author: Author;
  reviewers: Author[];
  labels: string[];
  draft: boolean;
}
```

### Bitbucket Provider
```typescript
interface BitbucketProviderConfig extends ProviderConfig {
  apiUrl?: string;
  workspace?: string;
  cloudInstance?: boolean;
}

interface BitbucketPRInfo {
  id: number;
  title: string;
  description?: string;
  state: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED';
  author: Author;
  reviewers: Author[];
  taskCount: number;
}
```

## Event Interfaces

### Event Types
```typescript
type ProviderEventType =
  | 'repository.clone'
  | 'repository.update'
  | 'repository.delete'
  | 'commit.new'
  | 'commit.analyze'
  | 'analysis.start'
  | 'analysis.complete'
  | 'analysis.error'
  | 'provider.connect'
  | 'provider.disconnect'
  | 'provider.error';

interface ProviderEventData {
  'repository.clone': { url: string; path: string };
  'repository.update': { repository: Repository };
  'repository.delete': { repository: Repository };
  'commit.new': { commit: Commit };
  'commit.analyze': { analysis: CommitAnalysis };
  'analysis.start': { type: string; target: string };
  'analysis.complete': { type: string; target: string; result: any };
  'analysis.error': { type: string; target: string; error: Error };
  'provider.connect': { provider: ProviderInfo };
  'provider.disconnect': { provider: ProviderInfo };
  'provider.error': { provider: ProviderInfo; error: Error };
}
```

### Event Handlers
```typescript
type EventHandler<T extends keyof ProviderEventData> = (
  event: ProviderEvent<T>
) => void | Promise<void>;

interface ProviderEventSubscription {
  unsubscribe(): void;
}

interface ProviderEventBus {
  subscribe<T extends keyof ProviderEventData>(
    type: T,
    handler: EventHandler<T>
  ): ProviderEventSubscription;
  
  publish<T extends keyof ProviderEventData>(
    type: T,
    data: ProviderEventData[T]
  ): Promise<void>;
}
```

## Error Interfaces

### Error Types
```typescript
interface ProviderErrorDetails {
  provider: string;
  code: string;
  operation: string;
  target?: string;
  metadata?: Record<string, any>;
}

type ProviderErrorCode =
  | 'AUTH_FAILED'
  | 'PERMISSION_DENIED'
  | 'RESOURCE_NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'INVALID_REQUEST'
  | 'OPERATION_FAILED';

interface ProviderErrorResponse {
  error: {
    code: ProviderErrorCode;
    message: string;
    details: ProviderErrorDetails;
  };
}
```

## Cache Interfaces

### Cache Types
```typescript
interface CacheOptions {
  ttl?: number;
  namespace?: string;
  invalidateOn?: ProviderEventType[];
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expires: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleanup: Date;
}
```

## Authentication Interfaces

### Auth Types
```typescript
interface TokenAuth {
  type: 'token';
  token: string;
}

interface OAuthAuth {
  type: 'oauth';
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  expiresAt?: Date;
}

interface SSHAuth {
  type: 'ssh';
  privateKey: string;
  publicKey: string;
  passphrase?: string;
}

type ProviderAuth = TokenAuth | OAuthAuth | SSHAuth;
```

## Feature Interfaces

### Feature Registration
```typescript
interface FeatureDefinition<T = any> {
  name: string;
  description: string;
  version: string;
  implementation: T;
}

interface FeatureRegistry {
  register<T>(feature: FeatureDefinition<T>): void;
  unregister(name: string): void;
  get<T>(name: string): T | undefined;
  list(): FeatureDefinition[];
}
```

### Feature Configuration
```typescript
interface FeatureConfig {
  enabled: boolean;
  options?: Record<string, any>;
}

interface ProviderFeatures {
  [featureName: string]: FeatureConfig;
}
