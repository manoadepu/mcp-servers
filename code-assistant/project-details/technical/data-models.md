# Data Models

## Database Schema

### 1. Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  path VARCHAR(512),
  git_url VARCHAR(512),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_git_url ON projects(git_url);
```

### 2. Metrics Table
```sql
CREATE TABLE metrics (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  metric_type VARCHAR(50),
  value JSONB,
  timestamp TIMESTAMP
);

CREATE INDEX idx_metrics_project ON metrics(project_id);
CREATE INDEX idx_metrics_type ON metrics(metric_type);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);
```

### 3. Analysis Results Table
```sql
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  file_path VARCHAR(512),
  analysis_type VARCHAR(50),
  results JSONB,
  timestamp TIMESTAMP
);

CREATE INDEX idx_analysis_project ON analysis_results(project_id);
CREATE INDEX idx_analysis_type ON analysis_results(analysis_type);
```

### 4. Git Metadata Table
```sql
CREATE TABLE git_metadata (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  branch_name VARCHAR(255),
  commit_hash VARCHAR(40),
  metadata JSONB,
  timestamp TIMESTAMP
);

CREATE INDEX idx_git_project ON git_metadata(project_id);
CREATE INDEX idx_git_branch ON git_metadata(branch_name);
```

## TypeScript Type Definitions

### 1. Project Models

```typescript
interface Project {
  id: string;
  name: string;
  path: string;
  gitUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectMetrics {
  complexity: {
    cyclomatic: number;
    cognitive: number;
    dependencies: DependencyGraph;
  };
  quality: {
    testCoverage: number;
    duplications: DuplicationReport;
    vulnerabilities: SecurityReport;
  };
  performance: {
    runtime: RuntimeMetrics;
    memory: MemoryMetrics;
    api: APIMetrics;
  };
}

interface ProjectSettings {
  analysis: {
    enabledMetrics: string[];
    thresholds: MetricThresholds;
    schedule: AnalysisSchedule;
  };
  notifications: {
    enabled: boolean;
    channels: NotificationChannel[];
    rules: NotificationRule[];
  };
  integrations: {
    git: GitConfig;
    cicd: CICDConfig;
    ai: AIConfig;
  };
}
```

### 2. Analysis Models

```typescript
interface CodeAnalysis {
  files: Array<{
    path: string;
    metrics: FileMetrics;
    issues: Array<Issue>;
    suggestions: Array<Suggestion>;
  }>;
  summary: {
    totalFiles: number;
    totalIssues: number;
    overallScore: number;
  };
}

interface FileMetrics {
  size: number;
  complexity: number;
  coverage: number;
  duplications: number;
  maintainability: number;
}

interface Issue {
  type: IssueType;
  severity: IssueSeverity;
  location: CodeLocation;
  message: string;
  suggestion?: string;
}

interface Suggestion {
  type: SuggestionType;
  priority: SuggestionPriority;
  location: CodeLocation;
  description: string;
  example?: string;
}
```

### 3. Git Models

```typescript
interface GitMetrics {
  branches: Array<BranchInfo>;
  commits: Array<CommitInfo>;
  pullRequests: Array<PRInfo>;
  contributors: Array<ContributorInfo>;
}

interface BranchInfo {
  name: string;
  isActive: boolean;
  lastCommit: string;
  protection: BranchProtection;
}

interface CommitInfo {
  hash: string;
  author: string;
  date: Date;
  message: string;
  changes: FileChanges[];
}

interface PRInfo {
  id: number;
  title: string;
  author: string;
  status: PRStatus;
  reviews: PRReview[];
}
```

### 4. Performance Models

```typescript
interface RuntimeMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: Date;
}

interface APIMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
}

interface ResourceUsage {
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
}
```

### 5. Notification Models

```typescript
interface Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  message: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

interface NotificationRule {
  type: NotificationType;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  enabled: boolean;
}

interface NotificationChannel {
  type: ChannelType;
  config: ChannelConfig;
  enabled: boolean;
}
```

### 6. Cache Models

```typescript
interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: Date;
  ttl: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleanup: Date;
}
```

## Enums and Constants

```typescript
enum IssueType {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO'
}

enum IssueSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

enum NotificationType {
  ISSUE = 'ISSUE',
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  UPDATE = 'UPDATE'
}

enum ChannelType {
  EMAIL = 'EMAIL',
  SLACK = 'SLACK',
  WEBHOOK = 'WEBHOOK'
}

const DEFAULT_THRESHOLDS = {
  complexity: {
    cyclomatic: 10,
    cognitive: 15
  },
  quality: {
    coverage: 80,
    duplication: 5
  },
  performance: {
    responseTime: 1000,
    memoryUsage: 512
  }
} as const;
```

## Type Guards

```typescript
function isProject(obj: any): obj is Project {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.path === 'string' &&
    typeof obj.gitUrl === 'string' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

function isIssue(obj: any): obj is Issue {
  return (
    typeof obj === 'object' &&
    typeof obj.type === 'string' &&
    typeof obj.severity === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.location === 'object'
  );
}

function isNotification(obj: any): obj is Notification {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.severity === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.metadata === 'object' &&
    obj.timestamp instanceof Date
  );
}
