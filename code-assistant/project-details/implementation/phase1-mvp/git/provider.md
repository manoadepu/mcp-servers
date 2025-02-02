# Git Provider Implementation

## Overview
The Git provider implementation for Phase 1 MVP focuses on analyzing code complexity changes in Git repositories. This provider integrates directly with local Git repositories using the Git CLI, enabling deep analysis of code changes and complexity trends.

## Core Features

### 1. Repository Analysis
- Local repository access
- Branch and commit tracking
- File change detection
- Complexity trend analysis

### 2. Change Detection
- File modifications tracking
- Content diff analysis
- Complexity impact calculation
- Change pattern recognition

### 3. Complexity Tracking
- Historical complexity analysis
- Change-based complexity delta
- Hotspot identification
- Trend visualization

## Implementation Details

### 1. Git Operations
```typescript
class GitProvider extends BaseProvider {
  private async executeGit(args: string[]): Promise<string> {
    const { stdout } = await exec('git', args, {
      cwd: this.workingDir,
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    return stdout.trim();
  }

  private async getFileContent(commit: string, path: string): Promise<string> {
    try {
      return await this.executeGit(['show', `${commit}:${path}`]);
    } catch (error) {
      if (error.message.includes('exists on disk, but not in')) {
        return ''; // File didn't exist in this commit
      }
      throw error;
    }
  }

  private async getDiff(oldCommit: string, newCommit: string): Promise<string> {
    return this.executeGit([
      'diff',
      '--unified=3',
      oldCommit,
      newCommit
    ]);
  }
}
```

### 2. Change Analysis
```typescript
class GitProvider extends BaseProvider {
  async analyzeChanges(commit: Commit): Promise<ChangeAnalysis> {
    const parentCommit = commit.parents[0];
    const diff = await this.getDiff(parentCommit, commit.id);
    const changes = this.parseGitDiff(diff);

    const fileAnalyses = await Promise.all(
      changes.map(async change => {
        const oldContent = await this.getFileContent(parentCommit, change.path);
        const newContent = await this.getFileContent(commit.id, change.path);

        return {
          path: change.path,
          type: change.type,
          complexity: await this.analyzeComplexity(oldContent, newContent),
          riskScore: this.calculateRiskScore(change),
          suggestions: this.generateSuggestions(change)
        };
      })
    );

    return {
      files: fileAnalyses,
      summary: this.generateChangeSummary(fileAnalyses)
    };
  }

  private parseGitDiff(diff: string): Array<{
    path: string;
    type: 'added' | 'modified' | 'deleted' | 'renamed';
    additions: number;
    deletions: number;
  }> {
    // Parse git diff output
    const changes: Array<{
      path: string;
      type: 'added' | 'modified' | 'deleted' | 'renamed';
      additions: number;
      deletions: number;
    }> = [];

    // ... diff parsing logic

    return changes;
  }
}
```

### 3. Complexity Analysis
```typescript
class GitProvider extends BaseProvider {
  async analyzeComplexity(oldContent: string, newContent: string): Promise<{
    before: ComplexityMetrics;
    after: ComplexityMetrics;
    delta: number;
  }> {
    const beforeMetrics = oldContent
      ? this.analyzer.analyze(oldContent)
      : null;

    const afterMetrics = newContent
      ? this.analyzer.analyze(newContent)
      : null;

    return {
      before: beforeMetrics || { cyclomatic: 0, cognitive: 0 },
      after: afterMetrics || { cyclomatic: 0, cognitive: 0 },
      delta: this.calculateComplexityDelta(beforeMetrics, afterMetrics)
    };
  }

  private calculateComplexityDelta(
    before: ComplexityMetrics | null,
    after: ComplexityMetrics | null
  ): number {
    if (!before) return after ? after.cyclomatic + after.cognitive : 0;
    if (!after) return -(before.cyclomatic + before.cognitive);
    
    return (
      (after.cyclomatic + after.cognitive) -
      (before.cyclomatic + before.cognitive)
    );
  }
}
```

### 4. Risk Assessment
```typescript
class GitProvider extends BaseProvider {
  private calculateRiskScore(change: {
    path: string;
    type: string;
    additions: number;
    deletions: number;
    complexity: {
      before: ComplexityMetrics;
      after: ComplexityMetrics;
      delta: number;
    };
  }): number {
    const factors = [
      // Size of change
      (change.additions + change.deletions) / 100,
      
      // Complexity increase
      Math.max(0, change.complexity.delta) / 5,
      
      // File type risk
      this.getFileTypeRisk(change.path),
      
      // Change type risk
      this.getChangeTypeRisk(change.type)
    ];

    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }

  private getFileTypeRisk(path: string): number {
    const extension = path.split('.').pop()?.toLowerCase();
    const riskMap: Record<string, number> = {
      'ts': 0.5,
      'js': 0.6,
      'jsx': 0.7,
      'tsx': 0.7,
      'css': 0.3,
      'html': 0.3,
      'json': 0.2,
      'md': 0.1
    };
    return riskMap[extension || ''] || 0.5;
  }

  private getChangeTypeRisk(type: string): number {
    const riskMap: Record<string, number> = {
      'added': 0.7,
      'modified': 0.5,
      'deleted': 0.3,
      'renamed': 0.2
    };
    return riskMap[type] || 0.5;
  }
}
```

### 5. Trend Analysis
```typescript
class GitProvider extends BaseProvider {
  async analyzeComplexityTrend(
    repo: Repository,
    path: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      interval?: 'day' | 'week' | 'month';
    } = {}
  ): Promise<ComplexityTrend> {
    const commits = await this.getCommitsInRange(
      repo,
      options.startDate,
      options.endDate
    );

    const snapshots = await Promise.all(
      commits.map(async commit => {
        const content = await this.getFileContent(commit.id, path);
        const metrics = content
          ? this.analyzer.analyze(content)
          : null;

        return {
          commit,
          metrics,
          timestamp: commit.timestamp
        };
      })
    );

    return {
      path,
      snapshots: snapshots
        .filter(s => s.metrics)
        .map(s => ({
          timestamp: s.timestamp,
          complexity: s.metrics!.cyclomatic + s.metrics!.cognitive,
          commit: s.commit.id
        })),
      trend: this.calculateTrend(snapshots)
    };
  }

  private calculateTrend(snapshots: Array<{
    metrics: ComplexityMetrics | null;
    timestamp: Date;
  }>): {
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    confidence: number;
  } {
    // ... trend calculation logic
    return {
      direction: 'increasing',
      rate: 0.5,
      confidence: 0.8
    };
  }
}
```

## Integration with Analysis System

### 1. Event Handling
```typescript
class GitProvider extends BaseProvider {
  private setupGitEventHandlers() {
    // Monitor repository changes
    this.watchRepository(async (event) => {
      if (event.type === 'commit') {
        const analysis = await this.analyzeCommit(event.commit);
        await this.emitEvent('commit.analyze', { analysis });
      }
    });

    // Track complexity changes
    this.on('commit.analyze', async (event) => {
      const { analysis } = event.data;
      if (analysis.impact.level === 'high') {
        await this.notifyHighImpactChange(analysis);
      }
    });
  }
}
```

### 2. Analysis Integration
```typescript
class GitProvider extends BaseProvider {
  async analyzeRepository(repo: Repository): Promise<RepositoryAnalysis> {
    const branches = await this.getBranches(repo);
    const mainBranch = branches.find(b => b.isDefault);
    
    if (!mainBranch) {
      throw new Error('No default branch found');
    }

    const commits = await this.getCommits(repo, mainBranch.name);
    const analyses = await Promise.all(
      commits.map(commit => this.analyzeCommit(commit))
    );

    return {
      repository: repo,
      complexity: this.calculateRepositoryComplexity(analyses),
      hotspots: this.identifyHotspots(analyses),
      trends: this.analyzeComplexityTrends(analyses)
    };
  }
}
```

## Performance Considerations

### 1. Caching Strategy
- Cache file contents by commit hash
- Cache analysis results
- Implement LRU cache for frequently accessed data
- Use filesystem cache for large objects

### 2. Optimization Techniques
- Batch git operations
- Parallel processing where possible
- Incremental analysis
- Smart diffing algorithms

## Error Handling

### 1. Git-Specific Errors
- Repository access errors
- Invalid commit references
- File not found in commit
- Merge conflicts

### 2. Analysis Errors
- Invalid file content
- Parsing errors
- Timeout errors
- Resource exhaustion

## Future Enhancements

### 1. Phase 2 Features
- Advanced pattern recognition
- Machine learning integration
- Team collaboration analysis
- Automated recommendations

### 2. Performance Improvements
- Distributed analysis
- Improved caching
- Optimized algorithms
- Real-time updates
