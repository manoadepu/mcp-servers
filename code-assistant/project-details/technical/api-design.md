# API Design

## Resource Endpoints

### Project Metrics
```typescript
/**
 * @api {get} /resources/metrics/complexity Get Complexity Metrics
 * @apiGroup Metrics
 * @apiParam {string} projectId Project identifier
 * @apiParam {string} [branch] Git branch name
 */
GET /resources/metrics/complexity

/**
 * @api {get} /resources/metrics/quality Get Quality Metrics
 * @apiGroup Metrics
 * @apiParam {string} projectId Project identifier
 * @apiParam {string} [scope] Analysis scope (file/directory/project)
 */
GET /resources/metrics/quality

/**
 * @api {get} /resources/metrics/performance Get Performance Metrics
 * @apiGroup Metrics
 * @apiParam {string} projectId Project identifier
 * @apiParam {string} [timeRange] Time range for metrics
 */
GET /resources/metrics/performance
```

### Code Analysis
```typescript
/**
 * @api {get} /resources/analysis/files Get File Analysis
 * @apiGroup Analysis
 * @apiParam {string} projectId Project identifier
 * @apiParam {string} [path] File or directory path
 */
GET /resources/analysis/files

/**
 * @api {get} /resources/analysis/summary Get Analysis Summary
 * @apiGroup Analysis
 * @apiParam {string} projectId Project identifier
 */
GET /resources/analysis/summary

/**
 * @api {get} /resources/analysis/issues Get Analysis Issues
 * @apiGroup Analysis
 * @apiParam {string} projectId Project identifier
 * @apiParam {string} [severity] Issue severity filter
 */
GET /resources/analysis/issues
```

### Git Statistics
```typescript
/**
 * @api {get} /resources/git/branches Get Branch Information
 * @apiGroup Git
 * @apiParam {string} projectId Project identifier
 */
GET /resources/git/branches

/**
 * @api {get} /resources/git/commits Get Commit History
 * @apiGroup Git
 * @apiParam {string} projectId Project identifier
 * @apiParam {string} [branch] Branch name
 */
GET /resources/git/commits

/**
 * @api {get} /resources/git/pull-requests Get Pull Requests
 * @apiGroup Git
 * @apiParam {string} projectId Project identifier
 * @apiParam {string} [status] PR status filter
 */
GET /resources/git/pull-requests
```

## Tool Endpoints

### Code Analysis Tools
```typescript
/**
 * @api {post} /tools/analyze/complexity Analyze Code Complexity
 * @apiGroup Tools
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} [path] Target path
 * @apiBody {Object} [options] Analysis options
 */
POST /tools/analyze/complexity

/**
 * @api {post} /tools/analyze/security Analyze Security
 * @apiGroup Tools
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} [scope] Analysis scope
 * @apiBody {Object} [options] Security scan options
 */
POST /tools/analyze/security

/**
 * @api {post} /tools/analyze/quality Analyze Code Quality
 * @apiGroup Tools
 * @apiBody {string} projectId Project identifier
 * @apiBody {Array} [metrics] Quality metrics to analyze
 */
POST /tools/analyze/quality
```

### Documentation Tools
```typescript
/**
 * @api {post} /tools/docs/generate Generate Documentation
 * @apiGroup Tools
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} [path] Target path
 * @apiBody {Object} [options] Generation options
 */
POST /tools/docs/generate

/**
 * @api {post} /tools/docs/validate Validate Documentation
 * @apiGroup Tools
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} [path] Target path
 */
POST /tools/docs/validate
```

### Git Operations
```typescript
/**
 * @api {post} /tools/git/branch Manage Branch
 * @apiGroup Tools
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} name Branch name
 * @apiBody {string} action create/delete/merge
 */
POST /tools/git/branch

/**
 * @api {post} /tools/git/merge Merge Branches
 * @apiGroup Tools
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} source Source branch
 * @apiBody {string} target Target branch
 */
POST /tools/git/merge

/**
 * @api {post} /tools/git/release Create Release
 * @apiGroup Tools
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} version Release version
 * @apiBody {Object} [options] Release options
 */
POST /tools/git/release
```

## Prompt Endpoints

### Code Review
```typescript
/**
 * @api {post} /prompts/review/code Review Code
 * @apiGroup Prompts
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} [path] Target path
 * @apiBody {Object} [options] Review options
 */
POST /prompts/review/code

/**
 * @api {post} /prompts/review/pr Review Pull Request
 * @apiGroup Prompts
 * @apiBody {string} projectId Project identifier
 * @apiBody {number} prNumber Pull request number
 */
POST /prompts/review/pr
```

### Refactoring
```typescript
/**
 * @api {post} /prompts/refactor/suggest Suggest Refactoring
 * @apiGroup Prompts
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} [path] Target path
 */
POST /prompts/refactor/suggest

/**
 * @api {post} /prompts/refactor/implement Implement Refactoring
 * @apiGroup Prompts
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} path Target path
 * @apiBody {Object} suggestion Refactoring suggestion
 */
POST /prompts/refactor/implement
```

### Documentation
```typescript
/**
 * @api {post} /prompts/docs/generate Generate Documentation
 * @apiGroup Prompts
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} [path] Target path
 * @apiBody {Object} [options] Generation options
 */
POST /prompts/docs/generate

/**
 * @api {post} /prompts/docs/improve Improve Documentation
 * @apiGroup Prompts
 * @apiBody {string} projectId Project identifier
 * @apiBody {string} path Target path
 * @apiBody {Object} [options] Improvement options
 */
POST /prompts/docs/improve
```

## Integration Points

### Git Provider Integration
```typescript
interface GitProvider {
  // Repository Operations
  cloneRepo(url: string): Promise<void>;
  fetchBranches(): Promise<Branch[]>;
  createBranch(name: string): Promise<void>;
  
  // Commit Operations
  getCommits(branch: string): Promise<Commit[]>;
  analyzeCommit(hash: string): Promise<CommitAnalysis>;
  
  // PR Operations
  getPullRequests(): Promise<PullRequest[]>;
  analyzePR(id: number): Promise<PRAnalysis>;
}
```

### CI/CD Integration
```typescript
interface CICDSystem {
  // Pipeline Operations
  getPipelineStatus(): Promise<PipelineStatus>;
  triggerPipeline(config: PipelineConfig): Promise<void>;
  
  // Build Operations
  getBuildResults(): Promise<BuildResult[]>;
  analyzeBuild(id: string): Promise<BuildAnalysis>;
}
```

### AI Service Integration
```typescript
interface AIService {
  // Code Analysis
  analyzeCode(content: string): Promise<CodeAnalysis>;
  suggestRefactoring(analysis: CodeAnalysis): Promise<RefactoringSuggestions>;
  
  // Documentation
  generateDocs(code: string): Promise<Documentation>;
  improveDocs(existing: Documentation): Promise<Documentation>;
}
```

## Response Formats

### Success Response
```typescript
interface SuccessResponse<T> {
  status: 'success';
  data: T;
  metadata?: {
    timestamp: string;
    version: string;
    [key: string]: any;
  };
}
```

### Error Response
```typescript
interface ErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    timestamp: string;
    version: string;
    [key: string]: any;
  };
}
```

## API Versioning

### Version Header
```typescript
const API_VERSION_HEADER = 'X-API-Version';
const CURRENT_API_VERSION = '1.0.0';
```

### Version Routes
```typescript
// Current version
/api/v1/*

// Legacy support
/api/v0/*
```

## Rate Limiting

### Headers
```typescript
const RATE_LIMIT_HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining',
  RESET: 'X-RateLimit-Reset'
};
```

### Configuration
```typescript
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};
