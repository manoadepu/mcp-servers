import { GitProvider } from './provider';
import { GitProviderConfig } from './types';

interface McpToolHandler {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      optional?: boolean;
    }>;
    required: string[];
  };
  handler: (params: Record<string, any>) => Promise<{
    type: 'success' | 'error';
    data?: any;
    error?: string;
  }>;
}

interface CommitToolParams {
  commitId: string;
  repoPath: string;
}

interface PatternsToolParams {
  repoPath: string;
  since?: string;
  until?: string;
}

interface PRToolParams {
  repoPath: string;
  baseCommit: string;
  headCommit: string;
}

/**
 * Analyze commit tool handler
 */
export const analyzeCommitTool: McpToolHandler = {
  name: 'git/analyze/commit',
  description: 'Analyze Git commit complexity and impact',
  inputSchema: {
    type: 'object',
    properties: {
      commitId: {
        type: 'string',
        description: 'Commit hash to analyze'
      },
      repoPath: {
        type: 'string',
        description: 'Path to Git repository'
      },
      excludeFolders: {
        type: 'array',
        description: 'Folders to exclude from analysis (e.g., ["node_modules", "dist"])',
        optional: true
      }
    },
    required: ['commitId', 'repoPath']
  },
  handler: async (params: Record<string, any>) => {
    try {
      const typedParams = params as CommitToolParams & { excludeFolders?: string | string[] };
      const { commitId, repoPath } = typedParams;
      console.error('Analyzing commit:', commitId, 'in repo:', repoPath);
      console.error('Raw excludeFolders:', JSON.stringify(params.excludeFolders));
    let excludeFolders;
    try {
      if (typeof params.excludeFolders === 'string') {
        excludeFolders = JSON.parse(params.excludeFolders);
      } else {
        excludeFolders = params.excludeFolders;
      }
    } catch (e) {
      excludeFolders = params.excludeFolders;
    }
    excludeFolders = Array.isArray(excludeFolders) ? excludeFolders : excludeFolders ? [excludeFolders] : ['node_modules'];
    console.error('Processed excludeFolders:', JSON.stringify(excludeFolders));
    
      const config: GitProviderConfig = {
        type: 'git',
        workingDir: repoPath,
        gitPath: 'git'
      };
      
      console.error('Initializing Git provider with config:', JSON.stringify(config));
      const provider = new GitProvider(config);
      
      console.error('Getting repository info...');
      const repo = await provider.getRepository(repoPath);
      
      console.error('Getting commit info...');
      const commit = await provider.getCommit(repo, commitId);
      
      console.error('Starting commit analysis...');
      const analysis = await provider.analyzeCommit(commit, excludeFolders || ['node_modules']);
      console.error('Analysis complete');
      
      return {
        type: 'success',
        data: {
          ...analysis,
          modifiedFiles: analysis.modifiedFiles
        }
      };
    } catch (error) {
      console.error('Error in git/analyze/commit:', error);
      return {
        type: 'error',
        error: error instanceof Error ? 
          `Git analysis error: ${error.message}` : 
          'Unknown error during git analysis'
      };
    }
  }
};

/**
 * Analyze patterns tool handler
 */
export const analyzePatternsTools: McpToolHandler = {
  name: 'git/analyze/patterns',
  description: 'Analyze Git repository patterns and trends',
  inputSchema: {
    type: 'object',
    properties: {
      repoPath: {
        type: 'string',
        description: 'Path to Git repository'
      },
      since: {
        type: 'string',
        description: 'Start date (ISO format)',
        optional: true
      },
      until: {
        type: 'string',
        description: 'End date (ISO format)',
        optional: true
      }
    },
    required: ['repoPath']
  },
  handler: async (params: Record<string, any>) => {
    const typedParams = params as PatternsToolParams;
    const { repoPath, since, until } = typedParams;
    
    const config: GitProviderConfig = {
      type: 'git',
      workingDir: repoPath,
      gitPath: 'git'
    };
    
    const provider = new GitProvider(config);
    
    try {
      const repo = await provider.getRepository(repoPath);
      const history = await provider.getCommitHistory(repo, {
        since: since ? new Date(since) : undefined,
        until: until ? new Date(until) : undefined
      });
      
      // Analyze patterns across commits
      const patterns = await Promise.all(
        history.map(async (commit) => {
          const analysis = await provider.analyzeCommit(commit);
          const changes = await provider.getChanges(commit);
          return {
            commit: commit.id,
            timestamp: commit.timestamp,
            complexity: analysis.complexity,
            impact: analysis.impact,
            changes: changes.files.map(f => ({
              path: f.path,
              complexity: f.complexity,
              riskScore: f.riskScore
            }))
          };
        })
      );
      
      // Calculate trends and hotspots
      const hotspots = patterns.reduce((acc, p) => {
        p.changes.forEach(c => {
          if (!acc[c.path]) {
            acc[c.path] = {
              path: c.path,
              changes: 0,
              totalComplexity: 0,
              averageRisk: 0
            };
          }
          acc[c.path].changes++;
          acc[c.path].totalComplexity += c.complexity.cyclomatic;
          acc[c.path].averageRisk = 
            (acc[c.path].averageRisk * (acc[c.path].changes - 1) + c.riskScore) / 
            acc[c.path].changes;
        });
        return acc;
      }, {} as Record<string, {
        path: string;
        changes: number;
        totalComplexity: number;
        averageRisk: number;
      }>);
      
      return {
        type: 'success',
        data: {
          patterns,
          hotspots: Object.values(hotspots)
            .sort((a, b) => b.changes - a.changes)
            .slice(0, 10),
          summary: {
            totalCommits: patterns.length,
            averageComplexity: patterns.reduce((sum, p) => 
              sum + p.complexity.after.cyclomatic, 0) / patterns.length,
            riskLevel: patterns.some(p => p.impact.level === 'high') ? 'high' :
              patterns.some(p => p.impact.level === 'medium') ? 'medium' : 'low'
          }
        }
      };
    } catch (error) {
      return {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      provider.dispose();
    }
  }
};

/**
 * Analyze PR tool handler
 */
export const analyzePRTool: McpToolHandler = {
  name: 'git/analyze/pr',
  description: 'Analyze Git pull request impact',
  inputSchema: {
    type: 'object',
    properties: {
      repoPath: {
        type: 'string',
        description: 'Path to Git repository'
      },
      baseCommit: {
        type: 'string',
        description: 'Base commit hash'
      },
      headCommit: {
        type: 'string',
        description: 'Head commit hash'
      }
    },
    required: ['repoPath', 'baseCommit', 'headCommit']
  },
  handler: async (params: Record<string, any>) => {
    const typedParams = params as PRToolParams;
    const { repoPath, baseCommit, headCommit } = typedParams;
    
    const config: GitProviderConfig = {
      type: 'git',
      workingDir: repoPath,
      gitPath: 'git'
    };
    
    const provider = new GitProvider(config);
    
    try {
      const repo = await provider.getRepository(repoPath);
      
      // Analyze base and head commits
      const baseCommitObj = await provider.getCommit(repo, baseCommit);
      const headCommitObj = await provider.getCommit(repo, headCommit);
      
      const baseAnalysis = await provider.analyzeCommit(baseCommitObj);
      const headAnalysis = await provider.analyzeCommit(headCommitObj);
      
      // Get changes between commits
      const baseChanges = await provider.getChanges(baseCommitObj);
      const headChanges = await provider.getChanges(headCommitObj);
      
      // Calculate impact
      const changedFiles = new Set([
        ...baseChanges.files.map(f => f.path),
        ...headChanges.files.map(f => f.path)
      ]);
      
      const fileAnalysis = Array.from(changedFiles).map(path => {
        const baseFile = baseChanges.files.find(f => f.path === path);
        const headFile = headChanges.files.find(f => f.path === path);
        
        return {
          path,
          complexityDelta: (headFile?.complexity.cyclomatic || 0) - 
            (baseFile?.complexity.cyclomatic || 0),
          riskScore: headFile?.riskScore || 0,
          suggestions: headFile?.suggestions || []
        };
      });
      
      return {
        type: 'success',
        data: {
          files: fileAnalysis,
          complexity: {
            before: baseAnalysis.complexity,
            after: headAnalysis.complexity,
            delta: headAnalysis.complexity.after.cyclomatic - 
              baseAnalysis.complexity.after.cyclomatic
          },
          impact: headAnalysis.impact,
          recommendations: [
            ...headAnalysis.recommendations,
            ...(Math.abs(headAnalysis.complexity.delta) > 10 ? 
              ['Consider breaking changes into smaller PRs'] : []),
            ...(fileAnalysis.length > 10 ?
              ['PR affects many files - careful review needed'] : [])
          ]
        }
      };
    } catch (error) {
      return {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      provider.dispose();
    }
  }
};

export const gitTools = [
  analyzeCommitTool,
  analyzePatternsTools,
  analyzePRTool
];
