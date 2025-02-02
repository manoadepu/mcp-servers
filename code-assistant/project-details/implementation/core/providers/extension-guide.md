# Provider Extension Guide

## Overview
This guide explains how to create new source control providers by implementing the provider interface and integrating with the provider system.

## Quick Start

### 1. Basic Provider Template
```typescript
import { BaseProvider, SourceControlProvider, ProviderConfig } from '../core/providers';

export class CustomProvider extends BaseProvider {
  constructor(config: ProviderConfig) {
    super(config);
    // Initialize provider-specific resources
  }

  async getRepository(url: string): Promise<Repository> {
    // Implement repository retrieval
  }

  async getCommit(repo: Repository, commitId: string): Promise<Commit> {
    // Implement commit retrieval
  }

  // ... implement other required methods
}
```

### 2. Provider Registration
```typescript
// Register your provider
SourceControlProviderFactory.registerProvider('custom', CustomProvider);

// Use your provider
const provider = SourceControlProviderFactory.getProvider('custom', {
  type: 'custom',
  // provider-specific configuration
});
```

## Implementation Steps

### 1. Define Provider Configuration
```typescript
interface CustomProviderConfig extends ProviderConfig {
  apiUrl?: string;
  customOption?: string;
  // Add provider-specific configuration options
}
```

### 2. Implement Core Methods

#### Repository Operations
```typescript
class CustomProvider extends BaseProvider {
  async getRepository(url: string): Promise<Repository> {
    // Validate URL
    if (!this.isValidUrl(url)) {
      throw new ProviderError('Invalid repository URL', 'custom', 'INVALID_URL');
    }

    // Fetch repository data
    const repoData = await this.fetchRepoData(url);

    // Return repository object
    return {
      id: repoData.id,
      name: repoData.name,
      url: url,
      defaultBranch: repoData.defaultBranch,
      provider: this,
      metadata: repoData.metadata
    };
  }

  async getBranches(repo: Repository): Promise<Branch[]> {
    // Implement branch listing
    const branches = await this.fetchBranches(repo);
    return branches.map(branch => ({
      name: branch.name,
      commit: branch.commitId,
      isDefault: branch.isDefault,
      protected: branch.protected,
      metadata: branch.metadata
    }));
  }
}
```

#### Commit Operations
```typescript
class CustomProvider extends BaseProvider {
  async getCommit(repo: Repository, commitId: string): Promise<Commit> {
    // Fetch commit data
    const commitData = await this.fetchCommitData(repo, commitId);

    return {
      id: commitData.id,
      message: commitData.message,
      author: {
        name: commitData.author.name,
        email: commitData.author.email
      },
      timestamp: new Date(commitData.timestamp),
      parents: commitData.parents,
      repository: repo,
      metadata: commitData.metadata
    };
  }

  async getChanges(commit: Commit): Promise<Changes> {
    // Fetch change data
    const changeData = await this.fetchChanges(commit);

    return {
      files: changeData.files.map(file => ({
        path: file.path,
        type: file.type,
        oldPath: file.oldPath,
        content: file.content,
        patch: file.patch
      })),
      stats: {
        additions: changeData.additions,
        deletions: changeData.deletions,
        files: changeData.files.length
      }
    };
  }
}
```

### 3. Implement Analysis Integration

#### Commit Analysis
```typescript
class CustomProvider extends BaseProvider {
  async analyzeCommit(commit: Commit): Promise<CommitAnalysis> {
    // Get changes
    const changes = await this.getChanges(commit);

    // Analyze each changed file
    const fileAnalyses = await Promise.all(
      changes.files.map(async file => {
        if (file.type === 'deleted') {
          return null;
        }

        const beforeContent = await this.getFileContent(commit.parents[0], file.path);
        const afterContent = file.content;

        return {
          path: file.path,
          before: this.analyzer.analyze(beforeContent),
          after: this.analyzer.analyze(afterContent)
        };
      })
    );

    // Calculate overall impact
    const impact = this.calculateImpact(fileAnalyses);

    return {
      commit,
      complexity: {
        before: this.aggregateMetrics(fileAnalyses.map(f => f?.before)),
        after: this.aggregateMetrics(fileAnalyses.map(f => f?.after)),
        delta: impact.complexityDelta
      },
      impact: {
        score: impact.score,
        level: impact.level,
        factors: impact.factors
      },
      recommendations: this.generateRecommendations(impact)
    };
  }
}
```

### 4. Add Error Handling
```typescript
class CustomProvider extends BaseProvider {
  protected async handleProviderError(error: any): Promise<never> {
    if (error.response?.status === 401) {
      throw new ProviderError(
        'Authentication failed',
        'custom',
        'AUTH_FAILED',
        { originalError: error }
      );
    }

    if (error.response?.status === 429) {
      throw new ProviderError(
        'Rate limit exceeded',
        'custom',
        'RATE_LIMIT_EXCEEDED',
        {
          resetAt: error.response.headers['x-ratelimit-reset'],
          limit: error.response.headers['x-ratelimit-limit']
        }
      );
    }

    throw new ProviderError(
      'Provider operation failed',
      'custom',
      'OPERATION_FAILED',
      { originalError: error }
    );
  }
}
```

### 5. Implement Caching
```typescript
class CustomProvider extends BaseProvider {
  private cache: ProviderCache;

  constructor(config: ProviderConfig) {
    super(config);
    this.cache = new ProviderCache({
      namespace: 'custom-provider',
      ttl: config.options?.cacheTTL || 3600
    });
  }

  private async getCached<T>(
    key: string,
    fetch: () => Promise<T>
  ): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached) {
      return cached;
    }

    const value = await fetch();
    await this.cache.set(key, value);
    return value;
  }

  async getRepository(url: string): Promise<Repository> {
    return this.getCached(`repo:${url}`, async () => {
      // Original implementation
    });
  }
}
```

### 6. Add Event Handling
```typescript
class CustomProvider extends BaseProvider {
  private eventBus: ProviderEventBus;

  constructor(config: ProviderConfig) {
    super(config);
    this.eventBus = new ProviderEventBus();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.eventBus.subscribe('repository.update', async (event) => {
      await this.cache.invalidate(`repo:${event.data.repository.url}`);
    });

    this.eventBus.subscribe('commit.new', async (event) => {
      await this.analyzeCommit(event.data.commit);
    });
  }

  protected async emitEvent<T extends keyof ProviderEventData>(
    type: T,
    data: ProviderEventData[T]
  ) {
    await this.eventBus.publish(type, data);
  }
}
```

## Testing Guidelines

### 1. Unit Tests
```typescript
describe('CustomProvider', () => {
  let provider: CustomProvider;

  beforeEach(() => {
    provider = new CustomProvider({
      type: 'custom',
      // test configuration
    });
  });

  test('getRepository returns valid repository', async () => {
    const repo = await provider.getRepository('https://example.com/repo');
    expect(repo).toMatchObject({
      name: expect.any(String),
      url: expect.any(String),
      defaultBranch: expect.any(String)
    });
  });

  // ... more tests
});
```

### 2. Integration Tests
```typescript
describe('CustomProvider Integration', () => {
  test('analyzes repository changes', async () => {
    const provider = new CustomProvider(config);
    const repo = await provider.getRepository(testRepoUrl);
    const commit = await provider.getCommit(repo, testCommitId);
    const analysis = await provider.analyzeCommit(commit);

    expect(analysis.complexity.delta).toBeDefined();
    expect(analysis.impact.level).toBeDefined();
  });
});
```

## Documentation Requirements

### 1. Provider Documentation
```markdown
# Custom Provider

## Overview
Brief description of the provider and its capabilities.

## Configuration
Document all configuration options.

## Features
List supported features and any provider-specific functionality.

## Examples
Provide usage examples.

## Limitations
Document any limitations or restrictions.
```

### 2. API Documentation
```typescript
/**
 * Custom source control provider implementation
 * @implements {SourceControlProvider}
 */
class CustomProvider extends BaseProvider {
  /**
   * Get repository information
   * @param url - Repository URL
   * @returns Repository object
   * @throws {ProviderError} If repository not found or access denied
   */
  async getRepository(url: string): Promise<Repository>;
}
```

## Best Practices

### 1. Error Handling
- Use specific error types
- Include detailed error information
- Implement retry logic
- Handle rate limiting
- Log errors appropriately

### 2. Performance
- Implement efficient caching
- Use batch operations
- Minimize API calls
- Handle pagination
- Monitor performance

### 3. Security
- Validate input
- Sanitize output
- Handle credentials securely
- Implement rate limiting
- Follow security best practices

### 4. Maintainability
- Follow coding standards
- Write comprehensive tests
- Document thoroughly
- Use type safety
- Keep dependencies updated
