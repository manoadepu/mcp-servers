import { BaseProvider } from '../../core/providers/base';
import { GitProviderConfig, GitCapability, ExtendedChangeAnalysis, PRAnalysis } from './types';
import { PRSummaryResult } from './llm/types';
import type { Repository, Branch, Commit, CommitAnalysis, ChangeAnalysis, HistoryOptions } from '../../core/providers';
/**
 * Git provider implementation
 */
export declare class GitProvider extends BaseProvider {
    private operations;
    private analyzer;
    private llmClient;
    constructor(config: GitProviderConfig);
    /**
     * Get PR summary using LLM analysis
     */
    summarizePR(prNumber: string, excludeFolders?: string[], baseBranch?: string, headBranch?: string): Promise<PRSummaryResult>;
    /**
     * Format diff for LLM analysis
     */
    private formatDiff;
    /**
     * Extract dependency changes
     */
    private extractDependencyChanges;
    /**
     * Extract API changes
     */
    private extractAPIChanges;
    /**
     * Format complexity metrics
     */
    private formatComplexityMetrics;
    /**
     * Format impact metrics
     */
    private formatImpactMetrics;
    /**
     * Format hotspots
     */
    private formatHotspots;
    protected getName(): string;
    protected getVersion(): string;
    protected getCapabilities(): GitCapability[];
    getRepository(url: string): Promise<Repository>;
    getDefaultBranch(repo: Repository): Promise<string>;
    getBranches(repo: Repository): Promise<Branch[]>;
    getCommit(repo: Repository, commitId: string): Promise<Commit>;
    getCommitHistory(repo: Repository, options: HistoryOptions): Promise<Commit[]>;
    getChanges(commit: Commit, excludeFolders?: string | string[] | undefined): Promise<ExtendedChangeAnalysis>;
    analyzeCommit(commit: Commit, excludeFolders?: string | string[] | undefined): Promise<CommitAnalysis & {
        modifiedFiles: Array<{
            path: string;
            metrics: {
                cyclomatic: number;
                cognitive: number;
                maintainability: number;
            };
        }>;
    }>;
    analyzePR(prNumber: string, excludeFolders?: string[], baseBranch?: string, headBranch?: string): Promise<PRAnalysis>;
    private analyzeCommitFiles;
    private calculatePRComplexityMetrics;
    private calculatePRImpactScore;
    private generatePRRecommendations;
    private identifyPRHotspots;
    private determinePRImpactFactors;
    private calculateFileImpact;
    private calculateRiskScore;
    private generateFileSuggestions;
    analyzeChanges(changes: ChangeAnalysis): Promise<CommitAnalysis>;
}
