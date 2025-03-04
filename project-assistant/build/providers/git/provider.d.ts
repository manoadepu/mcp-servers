import { BaseProvider } from '../../core/providers/base';
import { GitProviderConfig, GitCapability, ExtendedChangeAnalysis } from './types';
import type { Repository, Branch, Commit, CommitAnalysis, ChangeAnalysis, HistoryOptions } from '../../core/providers';
/**
 * Git provider implementation
 */
export declare class GitProvider extends BaseProvider {
    private operations;
    private analyzer;
    constructor(config: GitProviderConfig);
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
        modifiedFiles: string[];
    }>;
    analyzeChanges(changes: ChangeAnalysis): Promise<CommitAnalysis>;
}
