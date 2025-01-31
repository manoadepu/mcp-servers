/**
 * Git operations utility class
 */
export declare class GitOperations {
    private git;
    constructor(workingDir: string, gitPath?: string);
    /**
     * Verify repository
     */
    private verifyRepository;
    /**
     * Initialize repository
     * @param bare Create bare repository
     */
    init(bare?: boolean): Promise<void>;
    /**
     * Clone repository
     * @param url Repository URL
     * @param directory Target directory
     */
    clone(url: string, directory: string): Promise<void>;
    /**
     * Get repository status
     */
    status(): Promise<{
        current: string;
        tracking: string;
        ahead: number;
        behind: number;
    }>;
    /**
     * Get commit information
     * @param hash Commit hash
     */
    getCommit(hash: string): Promise<{
        hash: string;
        message: string;
        author_name: string;
        author_email: string;
        date: string;
        refs: string;
    }>;
    /**
     * Get commit changes
     * @param hash Commit hash
     */
    getCommitChanges(hash: string, excludePaths?: string[]): Promise<{
        files: Array<{
            file: string;
            changes: number;
            insertions: number;
            deletions: number;
            binary: boolean;
        }>;
        total: {
            changes: number;
            insertions: number;
            deletions: number;
            files: number;
        };
    }>;
    /**
     * Get file content at commit
     * @param hash Commit hash
     * @param path File path
     */
    getFileAtCommit(hash: string, path: string): Promise<string>;
    /**
     * Get commit history
     * @param options History options
     */
    log(options?: {
        from?: string;
        to?: string;
        file?: string;
        maxCount?: number;
    }): Promise<Array<{
        hash: string;
        date: string;
        message: string;
        refs: string;
        body: string;
        author_name: string;
        author_email: string;
    }>>;
    /**
     * Get branches
     */
    getBranches(): Promise<{
        current: string;
        all: string[];
        branches: {
            [key: string]: {
                current: boolean;
                name: string;
                commit: string;
                label: string;
            };
        };
    }>;
    /**
     * Handle Git errors
     * @param error Error object
     * @param operation Operation name
     */
    private handleError;
    /**
     * Get error code from error
     * @param error Error object
     */
    private getErrorCode;
}
