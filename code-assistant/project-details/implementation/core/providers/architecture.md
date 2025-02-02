# Source Control Provider Architecture

## Overview
The source control provider system is designed to support multiple version control platforms (Git, GitHub, Bitbucket, etc.) through a unified interface while maintaining extensibility for future providers. This architecture enables consistent analysis across different source control systems while leveraging platform-specific features when available.

## Core Components

### 1. Provider Interface
```typescript
interface SourceControlProvider {
  // Core provider information
  readonly type: string;
  readonly name: string;
  readonly version: string;

  // Repository operations
  getRepository(url: string): Promise<Repository>;
  getDefaultBranch(repo: Repository): Promise<string>;
  getBranches(repo: Repository): Promise<Branch[]>;

  // Commit operations
  getCommit(repo: Repository, commitId: string): Promise<Commit>;
  getCommitHistory(repo: Repository, options: HistoryOptions): Promise<CommitHistory>;
  getChanges(commit: Commit): Promise<Changes>;

  // Analysis operations
  analyzeCommit(commit: Commit): Promise<CommitAnalysis>;
  analyzeChanges(changes: Changes): Promise<ChangeAnalysis>;
  
  // Provider-specific features
  hasFeature(feature: string): boolean;
  getFeature<T>(feature: string): T | undefined;
}
```

### 2. Provider Factory
```typescript
class SourceControlProviderFactory {
  private static providers: Map<string, ProviderConstructor> = new Map();

  static registerProvider(type: string, provider: ProviderConstructor) {
    this.providers.set(type, provider);
  }

  static getProvider(type: string, config: ProviderConfig): SourceControlProvider {
    const Provider = this.providers.get(type);
    if (!Provider) {
      throw new Error(`Unsupported provider type: ${type}`);
    }
    return new Provider(config);
  }
}
```

### 3. Core Data Models

#### Repository Model
```typescript
interface Repository {
  id: string;
  name: string;
  url: string;
  defaultBranch: string;
  provider: SourceControlProvider;
  metadata: Record<string, any>;
}
```

#### Commit Model
```typescript
interface Commit {
  id: string;
  message: string;
  author: Author;
  timestamp: Date;
  parents: string[];
  repository: Repository;
  metadata: Record<string, any>;
}
```

#### Changes Model
```typescript
interface Changes {
  files: Array<{
    path: string;
    type: 'added' | 'modified' | 'deleted' | 'renamed';
    oldPath?: string;
    content?: string;
    patch?: string;
  }>;
  stats: {
    additions: number;
    deletions: number;
    files: number;
  };
}
```

## Provider Implementation

### 1. Base Provider Class
```typescript
abstract class BaseProvider implements SourceControlProvider {
  protected config: ProviderConfig;
  protected features: Set<string>;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.features = new Set();
  }

  abstract getRepository(url: string): Promise<Repository>;
  // ... other abstract methods

  hasFeature(feature: string): boolean {
    return this.features.has(feature);
  }

  getFeature<T>(feature: string): T | undefined {
    return this.hasFeature(feature) ? this.features[feature] as T : undefined;
  }
}
```

### 2. Provider Registration
```typescript
// Register built-in providers
SourceControlProviderFactory.registerProvider('git', GitProvider);
SourceControlProviderFactory.registerProvider('github', GitHubProvider);
SourceControlProviderFactory.registerProvider('bitbucket', BitbucketProvider);
```

## Event System

### 1. Provider Events
```typescript
interface ProviderEvent {
  type: string;
  provider: SourceControlProvider;
  timestamp: Date;
  data: any;
}

interface ProviderEventEmitter {
  on(event: string, handler: (event: ProviderEvent) => void): void;
  off(event: string, handler: (event: ProviderEvent) => void): void;
  emit(event: ProviderEvent): void;
}
```

### 2. Event Types
- Repository events (clone, update, delete)
- Commit events (new, analyze)
- Analysis events (start, complete, error)
- Provider events (connect, disconnect, error)

## Error Handling

### 1. Provider-Specific Errors
```typescript
class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}
```

### 2. Error Categories
- Authentication errors
- Permission errors
- Network errors
- Resource not found
- Rate limiting
- Provider-specific errors

## Configuration System

### 1. Provider Configuration
```typescript
interface ProviderConfig {
  type: string;
  auth?: {
    type: 'token' | 'oauth' | 'ssh';
    credentials: any;
  };
  options?: {
    timeout?: number;
    retries?: number;
    caching?: boolean;
    [key: string]: any;
  };
}
```

### 2. Environment Variables
```bash
# Provider-specific configuration
PROVIDER_GIT_PATH=/usr/bin/git
PROVIDER_GITHUB_API_URL=https://api.github.com
PROVIDER_BITBUCKET_API_URL=https://api.bitbucket.org

# Authentication
PROVIDER_GITHUB_TOKEN=xxx
PROVIDER_BITBUCKET_USERNAME=xxx
PROVIDER_BITBUCKET_APP_PASSWORD=xxx
```

## Caching Strategy

### 1. Cache Interface
```typescript
interface ProviderCache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

### 2. Cache Implementation
- In-memory caching for frequently accessed data
- File system caching for larger objects
- Cache invalidation on repository updates
- TTL-based cache expiration

## Extension Points

### 1. Provider Features
- Custom API endpoints
- Platform-specific analytics
- Advanced authentication methods
- Specialized caching strategies

### 2. Event Handlers
- Custom event processing
- Webhooks integration
- External system notifications
- Monitoring and logging

## Security Considerations

### 1. Authentication
- Secure credential storage
- Token rotation
- OAuth flow support
- SSH key management

### 2. Access Control
- Repository-level permissions
- User-level permissions
- Rate limiting
- Audit logging

## Performance Optimization

### 1. Caching Strategy
- Smart caching of repository data
- Incremental updates
- Background fetching
- Cache warming

### 2. Resource Management
- Connection pooling
- Request batching
- Parallel processing
- Resource cleanup

## Implementation Guidelines

### 1. Provider Implementation Steps
1. Extend BaseProvider class
2. Implement required interfaces
3. Add provider-specific features
4. Register with ProviderFactory
5. Add configuration handling
6. Implement error handling
7. Add caching support
8. Document provider capabilities

### 2. Best Practices
- Use TypeScript for type safety
- Follow SOLID principles
- Implement proper error handling
- Add comprehensive logging
- Write thorough tests
- Document provider features
- Handle rate limiting
- Implement retry logic
