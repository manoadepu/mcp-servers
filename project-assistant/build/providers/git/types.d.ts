import { ProviderConfig, ComplexityMetrics } from '../../core/providers';
/**
 * Git provider configuration
 */
export interface GitProviderConfig extends ProviderConfig {
    gitPath?: string;
    workingDir?: string;
    sshKey?: {
        private: string;
        public: string;
        passphrase?: string;
    };
}
/**
 * Git commit extra information
 */
export interface GitCommitExtra {
    tree: string;
    gpgSignature?: string;
    verificationStatus?: 'verified' | 'unsigned' | 'invalid';
}
/**
 * Git file change
 */
export interface GitFileChange {
    path: string;
    oldPath?: string;
    type: 'added' | 'modified' | 'deleted' | 'renamed';
    additions: number;
    deletions: number;
    content?: string;
    patch?: string;
}
/**
 * Git file analysis
 */
export interface GitFileAnalysis {
    path: string;
    type: 'added' | 'modified' | 'deleted' | 'renamed';
    oldPath?: string;
    complexity: ComplexityMetrics;
    impact: {
        score: number;
        level: 'low' | 'medium' | 'high';
        factors: string[];
    };
    riskScore: number;
    suggestions: string[];
}
/**
 * Change analysis
 */
export interface ChangeAnalysis {
    files: GitFileAnalysis[];
    summary: {
        totalFiles: number;
        riskLevel: 'high' | 'medium' | 'low';
        mainIssues: string[];
    };
}
/**
 * Extended change analysis
 */
export interface ExtendedChangeAnalysis extends ChangeAnalysis {
    modifiedFiles: Array<{
        path: string;
        metrics: {
            cyclomatic: number;
            cognitive: number;
            maintainability: number;
        };
    }>;
}
/**
 * Detailed file analysis
 */
export interface DetailedFileAnalysis extends GitFileAnalysis {
    detailedComplexity: {
        before: ComplexityMetrics;
        after: ComplexityMetrics;
        delta: number;
    };
}
/**
 * Git repository status
 */
export interface GitRepositoryStatus {
    branch: string;
    ahead: number;
    behind: number;
    staged: GitFileChange[];
    unstaged: GitFileChange[];
    untracked: string[];
}
/**
 * Git branch protection rules
 */
export interface GitBranchProtection {
    pattern: string;
    requirePullRequest: boolean;
    requiredReviewers: number;
    requireSignedCommits: boolean;
    requireLinearHistory: boolean;
    allowForcePush: boolean;
    allowDeletion: boolean;
}
/**
 * Git hook type
 */
export type GitHookType = 'pre-commit' | 'prepare-commit-msg' | 'commit-msg' | 'post-commit' | 'pre-push' | 'post-checkout' | 'post-merge';
/**
 * Git hook handler
 */
export interface GitHookHandler {
    (args: string[]): Promise<void>;
}
/**
 * Git provider features
 */
export interface GitProviderFeatures {
    hooks: {
        [key in GitHookType]?: GitHookHandler[];
    };
    protection: {
        rules: GitBranchProtection[];
        enabled: boolean;
    };
    signing: {
        enabled: boolean;
        keyId?: string;
        passphrase?: string;
    };
}
/**
 * Git provider capabilities
 */
export declare const GIT_CAPABILITIES: readonly ["local-repository", "commit-signing", "branch-protection", "git-hooks", "file-history", "blame", "worktree"];
export type GitCapability = typeof GIT_CAPABILITIES[number];
/**
 * Base PR information
 */
export interface BasePRInfo {
    number: number;
    title: string;
    description: string;
    author: string;
    baseBranch: string;
    headBranch: string;
    commits: string[];
    createdAt: Date;
    updatedAt: Date;
    mergedAt?: Date;
    state: 'open' | 'closed' | 'merged';
}
/**
 * Remote PR information
 */
export interface RemotePRInfo extends BasePRInfo {
    isRemote: true;
    remote: string;
    url?: string;
}
/**
 * Local PR information
 */
export interface LocalPRInfo extends BasePRInfo {
    isLocal: true;
}
/**
 * Git PR information
 */
export type GitPRInfo = RemotePRInfo | LocalPRInfo;
/**
 * PR analysis result
 */
export interface PRAnalysis {
    pr: GitPRInfo;
    commits: Array<{
        hash: string;
        analysis: DetailedFileAnalysis[];
    }>;
    impact: {
        score: number;
        level: 'low' | 'medium' | 'high';
        factors: string[];
    };
    complexity: {
        before: ComplexityMetrics;
        after: ComplexityMetrics;
        delta: number;
    };
    recommendations: string[];
    hotspots: Array<{
        path: string;
        changeFrequency: number;
        complexityTrend: Array<{
            commit: string;
            complexity: ComplexityMetrics;
        }>;
    }>;
}
/**
 * PR analysis parameters
 */
export interface PRAnalysisParams {
    prNumber: string;
    repoPath: string;
    baseBranch?: string;
    headBranch?: string;
    excludeFolders?: string[];
}
/**
 * Git error codes
 */
export type GitErrorCode = 'REPOSITORY_NOT_FOUND' | 'INVALID_REFERENCE' | 'MERGE_CONFLICT' | 'UNCOMMITTED_CHANGES' | 'HOOK_FAILED' | 'INVALID_PATH' | 'LOCK_ERROR' | 'REMOTE_ERROR' | 'AUTHENTICATION_FAILED' | 'PR_NOT_FOUND' | 'OPERATION_FAILED';
/**
 * Git error details
 */
export interface GitErrorDetails {
    code: GitErrorCode;
    command?: string;
    path?: string;
    reference?: string;
    stderr?: string;
    operation?: string;
}
/**
 * Git provider error
 */
export declare class GitProviderError extends Error {
    details: GitErrorDetails;
    constructor(message: string, details: GitErrorDetails);
}
