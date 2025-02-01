import { BaseProvider } from '../../core/providers/base';
import { GitProviderConfig, GitCapability, GIT_CAPABILITIES, GitFileChange, GitFileAnalysis, ExtendedChangeAnalysis, DetailedFileAnalysis, PRAnalysis } from './types';
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
    // Use the parent directory of the executable as the working directory
    const workingDir = config.workingDir || process.cwd();
    console.error('Initializing GitProvider with working directory:', workingDir);
    this.operations = new GitOperations(
      workingDir,
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

public async getChanges(commit: Commit, excludeFolders: string | string[] | undefined = ['node_modules']): Promise<ExtendedChangeAnalysis> {
    const excludeFoldersArray = excludeFolders ? 
      (Array.isArray(excludeFolders) ? excludeFolders : [excludeFolders]) : 
      ['node_modules'];
    
    const changes = await this.operations.getCommitChanges(commit.id, excludeFoldersArray);
    
    // Get only JS/TS files and analyze their complexity
    const modifiedFiles = await Promise.all(
      changes.files
        .filter(file => file.file.match(/\.(ts|js|tsx|jsx)$/))
        .map(async file => {
          try {
            const content = await this.operations.getFileAtCommit(commit.id, file.file);
            const metrics = this.analyzer.analyze(content);
            return {
              path: file.file,
              metrics: {
                cyclomatic: metrics.cyclomatic,
                cognitive: metrics.cognitive,
                maintainability: metrics.maintainability || 0
              }
            };
          } catch (error) {
            console.error(`Error analyzing ${file.file}:`, error);
            return {
              path: file.file,
              metrics: {
                cyclomatic: 0,
                cognitive: 0,
                maintainability: 0
              }
            };
          }
        })
    );
    
    console.error('Analyzed files:', modifiedFiles);
    const analyzedFiles: DetailedFileAnalysis[] = await Promise.all(
      changes.files
        .filter(file => file.file.match(/\.(ts|js|tsx|jsx)$/))
        .map(async file => {
        try {
          // Get file content after the commit
          const contentAfter = await this.operations.getFileAtCommit(commit.id, file.file);
          let contentBefore = '';
          
          try {
            // Try to get content before commit, use empty string if file didn't exist
            contentBefore = await this.operations.getFileAtCommit(commit.id + '^', file.file);
          } catch (error) {
            // File is likely new, use empty content for "before" state
            contentBefore = '';
          }
          
          // Analyze complexity before and after
          const metricsBefore = contentBefore ? this.analyzer.analyze(contentBefore) : { cyclomatic: 0, cognitive: 0, maintainability: 100 };
          const metricsAfter = this.analyzer.analyze(contentAfter);
          console.error(`Analyzed ${file.file}: Before - cyclomatic=${metricsBefore.cyclomatic}, cognitive=${metricsBefore.cognitive}, After - cyclomatic=${metricsAfter.cyclomatic}, cognitive=${metricsAfter.cognitive}`);
          
          // Calculate risk score based on complexity
          const riskScore = Math.min(
            100,
            ((metricsAfter.cyclomatic / 10) + (metricsAfter.cognitive / 15)) * 50
          );
          
          // Generate suggestions
          const suggestions = [];
          if (metricsAfter.cyclomatic > 10) {
            suggestions.push('Consider breaking down complex logic');
          }
          if (metricsAfter.cognitive > 15) {
            suggestions.push('High cognitive load - simplify code structure');
          }
          if (metricsAfter.maintainability && metricsAfter.maintainability < 50) {
            suggestions.push('Low maintainability - needs refactoring');
          }
          
          return {
            path: file.file,
            type: 'modified',
            complexity: metricsAfter,
            detailedComplexity: {
              before: metricsBefore,
              after: metricsAfter,
              delta: metricsAfter.cyclomatic - metricsBefore.cyclomatic
            },
            impact: {
              score: riskScore,
              level: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
              factors: []
            },
            riskScore,
            suggestions
          };
        } catch (error) {
          console.error(`Error analyzing ${file.file}:`, error);
          // Return default metrics if file analysis fails
          return {
            path: file.file,
            type: 'modified',
            complexity: { cyclomatic: 0, cognitive: 0 },
            detailedComplexity: {
              before: { cyclomatic: 0, cognitive: 0 },
              after: { cyclomatic: 0, cognitive: 0 },
              delta: 0
            },
            impact: {
              score: 0,
              level: 'low',
              factors: []
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
        riskLevel: riskLevel as 'high' | 'medium' | 'low',
        mainIssues
      },
      modifiedFiles
    };
  }

  public async analyzeCommit(commit: Commit, excludeFolders: string | string[] | undefined = ['node_modules']): Promise<CommitAnalysis & { modifiedFiles: Array<{ path: string; metrics: { cyclomatic: number; cognitive: number; maintainability: number; } }> }> {
    console.error('Analyzing commit:', commit.id);
    const changes = await this.getChanges(commit, excludeFolders);
    console.error('Got changes:', changes);
    
    // Use the already analyzed files from getChanges
    const fileMetrics = (changes.files as DetailedFileAnalysis[]).map(file => ({
      file: file.path,
      before: file.detailedComplexity.before,
      after: file.detailedComplexity.after
    }));

    // Calculate overall complexity metrics
    const totalComplexity = {
      cyclomatic: fileMetrics.reduce((sum, file) => 
        sum + (file.after?.cyclomatic || 0), 0),
      cognitive: fileMetrics.reduce((sum, file) => 
        sum + (file.after?.cognitive || 0), 0)
    };
    
    console.error('Total complexity:', totalComplexity);

    // Calculate complexity delta
    const complexityDelta = fileMetrics.reduce((sum, file) => 
      sum + ((file.after?.cyclomatic || 0) - (file.before?.cyclomatic || 0)), 0);
    
    console.error('Complexity delta:', complexityDelta);

    // Calculate impact score based on changes and complexity
    const impactScore = Math.min(
      100,
      (changes.files.length * 10) + 
      Math.abs(complexityDelta * 5) + 
      (totalComplexity.cyclomatic * 2)
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
      recommendations,
      modifiedFiles: changes.modifiedFiles
    };
  }

  public async analyzePR(prNumber: string, excludeFolders: string[] = ['node_modules']): Promise<PRAnalysis> {
    try {
      // Get PR information
      const prInfo = await this.operations.getPRInfo(prNumber);
      
      // Get PR changes
      const changes = await this.operations.getPRChanges(prNumber, excludeFolders);
      
      // Analyze each commit in the PR
      const commitAnalyses = await Promise.all(
        prInfo.commits.map(async hash => ({
          hash,
          analysis: await this.analyzeCommitFiles(hash, changes.files.map(f => f.file))
        }))
      );

      // Calculate overall complexity metrics
      const complexityMetrics = this.calculatePRComplexityMetrics(commitAnalyses);
      
      // Calculate impact score
      const impactScore = this.calculatePRImpactScore(changes, complexityMetrics);
      
      // Generate recommendations
      const recommendations = this.generatePRRecommendations(changes, complexityMetrics);
      
      // Identify hotspots
      const hotspots = await this.identifyPRHotspots(changes.files, prInfo.commits);

      return {
        pr: prInfo,
        commits: commitAnalyses,
        impact: {
          score: impactScore,
          level: impactScore > 70 ? 'high' : impactScore > 40 ? 'medium' : 'low',
          factors: this.determinePRImpactFactors(changes, complexityMetrics)
        },
        complexity: complexityMetrics,
        recommendations,
        hotspots
      };
    } catch (error) {
      console.error('Error analyzing PR:', error);
      throw error;
    }
  }

  private async analyzeCommitFiles(hash: string, files: string[]): Promise<DetailedFileAnalysis[]> {
    const analyses: DetailedFileAnalysis[] = [];
    
    for (const file of files) {
      if (!file.match(/\.(ts|js|tsx|jsx)$/)) continue;

      const contentAfter = await this.operations.getFileAtCommit(hash, file);
      let contentBefore = '';
      
      try {
        contentBefore = await this.operations.getFileAtCommit(`${hash}^`, file);
      } catch (error) {
        // File is likely new
      }

      const metricsBefore = contentBefore ? this.analyzer.analyze(contentBefore) : { cyclomatic: 0, cognitive: 0, maintainability: 100 };
      const metricsAfter = this.analyzer.analyze(contentAfter);

      analyses.push({
        path: file,
        type: 'modified',
        complexity: metricsAfter,
        detailedComplexity: {
          before: metricsBefore,
          after: metricsAfter,
          delta: metricsAfter.cyclomatic - metricsBefore.cyclomatic
        },
        impact: this.calculateFileImpact(metricsBefore, metricsAfter),
        riskScore: this.calculateRiskScore(metricsBefore, metricsAfter),
        suggestions: this.generateFileSuggestions(metricsAfter)
      });
    }

    return analyses;
  }

  private calculatePRComplexityMetrics(commitAnalyses: Array<{
    hash: string;
    analysis: DetailedFileAnalysis[];
  }>): {
    before: ComplexityMetrics;
    after: ComplexityMetrics;
    delta: number;
  } {
    const before = {
      cyclomatic: 0,
      cognitive: 0
    };
    
    const after = {
      cyclomatic: 0,
      cognitive: 0
    };

    for (const commit of commitAnalyses) {
      for (const file of commit.analysis) {
        before.cyclomatic += file.detailedComplexity.before.cyclomatic;
        before.cognitive += file.detailedComplexity.before.cognitive;
        after.cyclomatic += file.detailedComplexity.after.cyclomatic;
        after.cognitive += file.detailedComplexity.after.cognitive;
      }
    }

    return {
      before,
      after,
      delta: (after.cyclomatic + after.cognitive) - (before.cyclomatic + before.cognitive)
    };
  }

  private calculatePRImpactScore(
    changes: { total: { changes: number; files: number } },
    complexity: { delta: number }
  ): number {
    return Math.min(
      100,
      (changes.total.changes / 100) * 30 + // Size impact (30%)
      (changes.total.files * 5) + // File count impact
      Math.abs(complexity.delta * 2) // Complexity impact
    );
  }

  private generatePRRecommendations(
    changes: { total: { changes: number; files: number } },
    complexity: { delta: number }
  ): string[] {
    const recommendations: string[] = [];

    if (changes.total.files > 10) {
      recommendations.push('Consider breaking down the PR into smaller, focused changes');
    }

    if (changes.total.changes > 500) {
      recommendations.push('Large change set detected - thorough review recommended');
    }

    if (complexity.delta > 20) {
      recommendations.push('Significant complexity increase - consider refactoring opportunities');
    }

    return recommendations;
  }

  private async identifyPRHotspots(
    files: Array<{ file: string }>,
    commits: string[]
  ): Promise<Array<{
    path: string;
    changeFrequency: number;
    complexityTrend: Array<{
      commit: string;
      complexity: ComplexityMetrics;
    }>;
  }>> {
    const hotspots: Array<{
      path: string;
      changeFrequency: number;
      complexityTrend: Array<{
        commit: string;
        complexity: ComplexityMetrics;
      }>;
    }> = [];

    for (const { file } of files) {
      if (!file.match(/\.(ts|js|tsx|jsx)$/)) continue;

      const complexityTrend = await Promise.all(
        commits.map(async commit => ({
          commit,
          complexity: this.analyzer.analyze(
            await this.operations.getFileAtCommit(commit, file)
          )
        }))
      );

      hotspots.push({
        path: file,
        changeFrequency: commits.length,
        complexityTrend
      });
    }

    return hotspots;
  }

  private determinePRImpactFactors(
    changes: { total: { changes: number; files: number } },
    complexity: { delta: number }
  ): string[] {
    const factors: string[] = [];

    if (changes.total.files > 10) {
      factors.push('Large number of files modified');
    }

    if (changes.total.changes > 500) {
      factors.push('Significant code churn');
    }

    if (complexity.delta > 20) {
      factors.push('High complexity impact');
    }

    return factors;
  }

  private calculateFileImpact(before: ComplexityMetrics, after: ComplexityMetrics): {
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: string[];
  } {
    const complexityDelta = after.cyclomatic - before.cyclomatic;
    const cognitiveDelta = after.cognitive - before.cognitive;
    
    const score = Math.min(
      100,
      (Math.abs(complexityDelta) * 10) +
      (Math.abs(cognitiveDelta) * 15)
    );

    const factors: string[] = [];
    if (complexityDelta > 5) factors.push('Significant cyclomatic complexity increase');
    if (cognitiveDelta > 5) factors.push('High cognitive complexity impact');

    return {
      score,
      level: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
      factors
    };
  }

  private calculateRiskScore(before: ComplexityMetrics, after: ComplexityMetrics): number {
    return Math.min(
      100,
      ((after.cyclomatic / 10) + (after.cognitive / 15)) * 50
    );
  }

  private generateFileSuggestions(metrics: ComplexityMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.cyclomatic > 10) {
      suggestions.push('Consider breaking down complex logic');
    }
    if (metrics.cognitive > 15) {
      suggestions.push('High cognitive load - simplify code structure');
    }
    if (metrics.maintainability && metrics.maintainability < 50) {
      suggestions.push('Low maintainability - needs refactoring');
    }

    return suggestions;
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
