import { BaseProvider } from '../../core/providers/base';
import { GitProviderConfig, GitCapability, GIT_CAPABILITIES, GitFileChange } from './types';
import { GitOperations } from './operations';
import { ComplexityAnalyzer, ComplexityMetrics } from '../../core/analyzers/complexity';
import type {
  Repository,
  Branch,
  Commit,
  CommitAnalysis,
  ChangeAnalysis,
  HistoryOptions
} from '../../core/providers';

/**
 * Git provider implementation
 */
export class GitProvider extends BaseProvider {
  private operations: GitOperations;
  private analyzer: ComplexityAnalyzer;

  constructor(config: GitProviderConfig) {
    super(config);
    this.operations = new GitOperations(
      config.workingDir || process.cwd(),
      config.gitPath
    );

    // Initialize analyzers
    this.analyzer = new ComplexityAnalyzer({
      includeHalstead: true,
      includeMaintainability: true
    });

    // Register Git-specific features
    this.registerFeature('git-operations', this.operations);
  }

  protected getName(): string {
    return 'Git';
  }

  protected getVersion(): string {
    return '1.0.0';
  }

  protected getCapabilities(): GitCapability[] {
    return [...GIT_CAPABILITIES];
  }

  public async getRepository(url: string): Promise<Repository> {
    const repoName = url.split('/').pop()?.replace('.git', '') || '';
    return {
      id: repoName,
      name: repoName,
      url,
      defaultBranch: 'main',
      provider: this.info,
      metadata: {}
    };
  }

  public async getDefaultBranch(repo: Repository): Promise<string> {
    try {
      const status = await this.operations.status();
      return status.current || 'main';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get default branch: ${errorMessage}`);
    }
  }

  public async getBranches(repo: Repository): Promise<Branch[]> {
    const branchInfo = await this.operations.getBranches();
    return branchInfo.all.map(name => ({
      name,
      commit: branchInfo.branches[name]?.commit || '',
      isDefault: name === branchInfo.current,
      protected: false,
      metadata: {}
    }));
  }

  public async getCommit(repo: Repository, commitId: string): Promise<Commit> {
    const commitInfo = await this.operations.getCommit(commitId);
    return {
      id: commitInfo.hash,
      message: commitInfo.message,
      author: {
        name: commitInfo.author_name,
        email: commitInfo.author_email
      },
      timestamp: new Date(commitInfo.date),
      parents: [],
      repository: repo,
      metadata: {
        refs: commitInfo.refs
      }
    };
  }

  public async getCommitHistory(
    repo: Repository,
    options: HistoryOptions
  ): Promise<Commit[]> {
    const history = await this.operations.log({
      from: options.since?.toISOString(),
      to: options.until?.toISOString(),
      file: options.path,
      maxCount: options.maxCount
    });

    return history.map(entry => ({
      id: entry.hash,
      message: entry.message,
      author: {
        name: entry.author_name,
        email: entry.author_email
      },
      timestamp: new Date(entry.date),
      parents: [],
      repository: repo,
      metadata: {
        refs: entry.refs,
        body: entry.body
      }
    }));
  }

  public async getChanges(commit: Commit): Promise<ChangeAnalysis> {
    const changes = await this.operations.getCommitChanges(commit.id);
    
    const analyzedFiles = await Promise.all(
      changes.files.map(async file => {
        try {
          // Get file content
          const content = await this.operations.getFileAtCommit(commit.id, file.file);
          
          // Only analyze TypeScript/JavaScript files
          if (!file.file.match(/\.(ts|js|tsx|jsx)$/)) {
            return {
              path: file.file,
              type: 'modified' as GitFileChange['type'],
              complexity: {
                cyclomatic: 0,
                cognitive: 0
              },
              riskScore: 0,
              suggestions: ['Non-TypeScript/JavaScript file - skipping analysis']
            };
          }
          
          // Analyze complexity
          const metrics = this.analyzer.analyze(content);
          console.error(`Analyzed ${file.file}: cyclomatic=${metrics.cyclomatic}, cognitive=${metrics.cognitive}`);
          
          // Calculate risk score based on complexity
          const riskScore = Math.min(
            100,
            ((metrics.cyclomatic / 10) + (metrics.cognitive / 15)) * 50
          );
          
          // Generate suggestions
          const suggestions = [];
          if (metrics.cyclomatic > 10) {
            suggestions.push('Consider breaking down complex logic');
          }
          if (metrics.cognitive > 15) {
            suggestions.push('High cognitive load - simplify code structure');
          }
          if (metrics.maintainability && metrics.maintainability < 50) {
            suggestions.push('Low maintainability - needs refactoring');
          }
          
          return {
            path: file.file,
            type: 'modified' as GitFileChange['type'],
            complexity: {
              cyclomatic: metrics.cyclomatic,
              cognitive: metrics.cognitive
            },
            riskScore,
            suggestions
          };
        } catch (error) {
          console.error(`Error analyzing ${file.file}:`, error);
          // Return default metrics if file analysis fails
          return {
            path: file.file,
            type: 'modified' as GitFileChange['type'],
            complexity: {
              cyclomatic: 0,
              cognitive: 0
            },
            riskScore: 0,
            suggestions: ['Error analyzing file']
          };
        }
      })
    );
    
    // Calculate overall risk level
    const avgRiskScore = analyzedFiles.reduce((sum, file) => sum + file.riskScore, 0) / analyzedFiles.length;
    const riskLevel = avgRiskScore > 70 ? 'high' : avgRiskScore > 40 ? 'medium' : 'low';
    
    // Identify main issues
    const mainIssues = [];
    if (analyzedFiles.some(f => f.complexity.cyclomatic > 10)) {
      mainIssues.push('High cyclomatic complexity detected');
    }
    if (analyzedFiles.some(f => f.complexity.cognitive > 15)) {
      mainIssues.push('High cognitive complexity detected');
    }
    if (analyzedFiles.length > 10) {
      mainIssues.push('Large number of files changed');
    }
    
    return {
      files: analyzedFiles,
      summary: {
        totalFiles: changes.total.files,
        riskLevel,
        mainIssues
      }
    };
  }

  public async analyzeCommit(commit: Commit): Promise<CommitAnalysis> {
    const changes = await this.getChanges(commit);
    
    // Calculate overall complexity metrics
    const totalComplexity = {
      cyclomatic: changes.files.reduce((sum, file) => sum + file.complexity.cyclomatic, 0),
      cognitive: changes.files.reduce((sum, file) => sum + file.complexity.cognitive, 0)
    };
    
    // Calculate impact score
    const impactScore = Math.min(
      100,
      (changes.files.length * 10) + 
      (totalComplexity.cyclomatic * 5) + 
      (totalComplexity.cognitive * 5)
    );
    
    // Determine impact level
    const impactLevel = impactScore > 70 ? 'high' : impactScore > 40 ? 'medium' : 'low';
    
    // Identify impact factors
    const factors = [];
    if (changes.files.length > 10) {
      factors.push('Large number of files modified');
    }
    if (totalComplexity.cyclomatic > 50) {
      factors.push('Significant increase in cyclomatic complexity');
    }
    if (totalComplexity.cognitive > 75) {
      factors.push('High cognitive complexity impact');
    }
    
    // Generate recommendations
    const recommendations = [];
    if (changes.files.length > 10) {
      recommendations.push('Consider breaking changes into smaller commits');
    }
    if (totalComplexity.cyclomatic > 50) {
      recommendations.push('Review complex logic for potential simplification');
    }
    if (totalComplexity.cognitive > 75) {
      recommendations.push('Consider refactoring to reduce cognitive load');
    }
    
    return {
      commit,
      complexity: {
        before: {
          cyclomatic: 0, // We don't have previous state
          cognitive: 0
        },
        after: {
          cyclomatic: totalComplexity.cyclomatic,
          cognitive: totalComplexity.cognitive
        },
        delta: totalComplexity.cyclomatic // Simplified delta calculation
      },
      impact: {
        score: impactScore,
        level: impactLevel,
        factors
      },
      recommendations
    };
  }

  public async analyzeChanges(changes: ChangeAnalysis): Promise<CommitAnalysis> {
    // This is a placeholder implementation
    // Real implementation would analyze the changes and provide insights
    return {
      commit: {} as Commit, // This should be provided by the caller
      complexity: {
        before: {
          cyclomatic: 0,
          cognitive: 0
        },
        after: {
          cyclomatic: 0,
          cognitive: 0
        },
        delta: 0
      },
      impact: {
        score: 0,
        level: 'low',
        factors: []
      },
      recommendations: []
    };
  }
}
