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
  complexity: {
    before?: ComplexityMetrics;
    after?: ComplexityMetrics;
    delta: number;
  };
  impact: {
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  suggestions: string[];
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
export type GitHookType =
  | 'pre-commit'
  | 'prepare-commit-msg'
  | 'commit-msg'
  | 'post-commit'
  | 'pre-push'
  | 'post-checkout'
  | 'post-merge';

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
export const GIT_CAPABILITIES = [
  'local-repository',
  'commit-signing',
  'branch-protection',
  'git-hooks',
  'file-history',
  'blame',
  'worktree'
] as const;

export type GitCapability = typeof GIT_CAPABILITIES[number];

/**
 * Git error codes
 */
export type GitErrorCode =
  | 'REPOSITORY_NOT_FOUND'
  | 'INVALID_REFERENCE'
  | 'MERGE_CONFLICT'
  | 'UNCOMMITTED_CHANGES'
  | 'HOOK_FAILED'
  | 'INVALID_PATH'
  | 'LOCK_ERROR'
  | 'REMOTE_ERROR'
  | 'AUTHENTICATION_FAILED'
  | 'OPERATION_FAILED';

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
export class GitProviderError extends Error {
  constructor(
    message: string,
    public details: GitErrorDetails
  ) {
    super(message);
    this.name = 'GitProviderError';
  }
}
