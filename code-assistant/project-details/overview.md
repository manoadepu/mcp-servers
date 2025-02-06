# Code Assistant MCP Server

## Overview
Code Assistant is an MCP server that provides intelligent code analysis and Git operations capabilities. It focuses on analyzing code complexity, reviewing pull requests, and providing actionable insights about code changes.

## Core Capabilities

### 1. Code Analysis
- Cyclomatic complexity measurement
- Cognitive complexity analysis
- Maintainability metrics
- Performance impact assessment
- Security vulnerability detection

### 2. Git Operations
- Repository management
- Branch operations
- Commit analysis
- PR review automation
- Change impact analysis

### 3. LLM Integration
- PR summary generation
- Code review suggestions
- Impact assessment
- Security implications analysis

## Features

### 1. Pull Request Analysis
```typescript
// Example PR analysis result
{
  "complexity": {
    "before": { "cyclomatic": 45, "cognitive": 32 },
    "after": { "cyclomatic": 38, "cognitive": 28 },
    "delta": -11
  },
  "impact": {
    "score": 65,
    "level": "medium",
    "factors": [
      "Multiple file changes",
      "API modifications",
      "Test coverage impact"
    ]
  }
}
```

### 2. Code Complexity Analysis
```typescript
// Example complexity analysis
{
  "file": "src/service/auth.ts",
  "metrics": {
    "cyclomatic": 12,
    "cognitive": 8,
    "maintainability": 76
  },
  "hotspots": [
    {
      "line": 45,
      "complexity": "high",
      "suggestion": "Consider breaking down authentication logic"
    }
  ]
}
```

### 3. Change Impact Assessment
```typescript
// Example impact assessment
{
  "changes": {
    "files": 5,
    "additions": 120,
    "deletions": 85
  },
  "impact": {
    "api": "moderate",
    "performance": "low",
    "security": "high"
  },
  "recommendations": [
    "Review authentication changes",
    "Add security tests",
    "Update API documentation"
  ]
}
```

## Implementation

### 1. Core Components

#### Analysis Engine
- Complexity analyzers
- Impact assessors
- Pattern detectors
- Metric collectors

#### Git Integration
- Repository operations
- Change tracking
- Branch management
- PR handling

#### LLM Pipeline
- Content analysis
- Summary generation
- Suggestion creation
- Impact assessment

### 2. Tools Provided

#### analyzeCode
```typescript
interface AnalyzeCodeInput {
  path: string;
  options?: {
    complexity?: boolean;
    security?: boolean;
    performance?: boolean;
  };
}
```

#### analyzePR
```typescript
interface AnalyzePRInput {
  prNumber: string;
  options?: {
    summaryType: 'brief' | 'detailed';
    includeSuggestions: boolean;
    securityCheck: boolean;
  };
}
```

#### getComplexityMetrics
```typescript
interface ComplexityMetricsInput {
  files: string[];
  threshold?: {
    cyclomatic?: number;
    cognitive?: number;
  };
}
```

### 3. Resources Provided

#### complexity-report
```
complexity://[repo]/[branch]/report
```

#### pr-analysis
```
pr://[repo]/[number]/analysis
```

#### code-metrics
```
metrics://[repo]/[path]/current
```

## Integration

### 1. MCP Protocol Implementation
```typescript
class CodeAssistantServer extends BaseMCPServer {
  tools = {
    analyzeCode: new CodeAnalysisTool(),
    analyzePR: new PRAnalysisTool(),
    getComplexityMetrics: new ComplexityTool()
  };
  
  resources = {
    complexityReport: new ComplexityReportResource(),
    prAnalysis: new PRAnalysisResource(),
    codeMetrics: new CodeMetricsResource()
  };
}
```

### 2. Event Handling
```typescript
// Event subscriptions
server.on('pr.created', async (pr) => {
  const analysis = await analyzePR(pr.number);
  await notifyReviewers(analysis);
});

server.on('commit.pushed', async (commit) => {
  const impact = await analyzeCommitImpact(commit.hash);
  await updateMetrics(impact);
});
```

### 3. Caching Strategy
```typescript
// Cache configuration
const cache = new ProviderCache({
  namespace: 'code-assistant',
  ttl: 3600,
  invalidateOn: [
    'commit.new',
    'pr.updated',
    'branch.changed'
  ]
});
```

## Configuration

### 1. Environment Variables
```env
# Analysis Configuration
COMPLEXITY_THRESHOLD=10
COGNITIVE_THRESHOLD=15
MAINTAINABILITY_THRESHOLD=70

# Git Configuration
GIT_DEFAULT_BRANCH=main
GIT_PR_FETCH_LIMIT=100
GIT_CACHE_TTL=3600

# LLM Configuration
LLM_MODEL=gpt-4
LLM_MAX_TOKENS=2000
LLM_TEMPERATURE=0.1
```

### 2. Feature Flags
```typescript
const features = {
  complexityAnalysis: true,
  securityScanning: true,
  prAutomation: true,
  impactAssessment: true,
  suggestionGeneration: true
};
```

### 3. Performance Tuning
```typescript
const performance = {
  maxConcurrentAnalysis: 5,
  cacheSize: '1GB',
  batchSize: 100,
  timeout: 30000
};
```

## Usage Examples

### 1. Analyze Pull Request
```typescript
const result = await server.executeTool('analyzePR', {
  prNumber: 'PR-123',
  options: {
    summaryType: 'detailed',
    includeSuggestions: true
  }
});
```

### 2. Get Complexity Metrics
```typescript
const metrics = await server.executeTool('getComplexityMetrics', {
  files: ['src/auth/**/*.ts'],
  threshold: {
    cyclomatic: 10,
    cognitive: 15
  }
});
```

### 3. Generate PR Summary
```typescript
const summary = await server.executeTool('generatePRSummary', {
  prNumber: 'PR-123',
  format: 'markdown',
  sections: ['changes', 'impact', 'suggestions']
});
