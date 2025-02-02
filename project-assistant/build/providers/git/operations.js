"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitOperations = void 0;
const simple_git_1 = __importDefault(require("simple-git"));
const types_1 = require("./types");
/**
 * Git operations utility class
 */
class GitOperations {
    git;
    constructor(workingDir, gitPath) {
        try {
            // Normalize path to use forward slashes
            const normalizedDir = workingDir.replace(/\\/g, '/');
            console.error('Initializing git operations with directory:', normalizedDir);
            // Verify directory exists
            if (!require('fs').existsSync(normalizedDir)) {
                throw new Error(`Directory does not exist: ${normalizedDir}`);
            }
            const options = {
                baseDir: normalizedDir,
                binary: gitPath || 'git',
                maxConcurrentProcesses: 6,
                trimmed: true
            };
            this.git = (0, simple_git_1.default)(options);
        }
        catch (error) {
            console.error('Error initializing git:', error);
            throw this.handleError(error, 'constructor');
        }
    }
    /**
     * Verify repository
     */
    async verifyRepository() {
        try {
            await this.git.revparse(['--git-dir']);
        }
        catch (error) {
            console.error('Repository verification failed:', error);
            throw this.handleError(error, 'verifyRepository');
        }
    }
    /**
     * Initialize repository
     * @param bare Create bare repository
     */
    async init(bare = false) {
        try {
            await this.git.init(bare);
        }
        catch (error) {
            throw this.handleError(error, 'init');
        }
    }
    /**
     * Clone repository
     * @param url Repository URL
     * @param directory Target directory
     */
    async clone(url, directory) {
        try {
            await this.git.clone(url, directory, {});
        }
        catch (error) {
            throw this.handleError(error, 'clone');
        }
    }
    /**
     * Get repository status
     */
    async status() {
        try {
            const status = await this.git.status();
            return {
                current: status.current || '',
                tracking: status.tracking || '',
                ahead: status.ahead || 0,
                behind: status.behind || 0
            };
        }
        catch (error) {
            throw this.handleError(error, 'status');
        }
    }
    /**
     * Get commit information
     * @param hash Commit hash
     */
    async getCommit(hash) {
        try {
            await this.verifyRepository();
            console.error('Fetching commit:', hash);
            const log = await this.git.show([
                '--no-patch',
                '--format=%H%n%s%n%an%n%ae%n%ai%n%D',
                hash
            ]);
            console.error('Got commit log');
            const [hash_, message, author_name, author_email, date, refs] = log
                .trim()
                .split('\n');
            return {
                hash: hash_,
                message,
                author_name,
                author_email,
                date,
                refs
            };
        }
        catch (error) {
            throw this.handleError(error, 'getCommit');
        }
    }
    /**
     * Get commit changes
     * @param hash Commit hash
     */
    async getCommitChanges(hash, excludePaths = ['node_modules']) {
        try {
            await this.verifyRepository();
            console.error('Analysis parameters:', {
                commitHash: hash,
                repoPath: this.git.cwd,
                excludeFolders: excludePaths
            });
            // Prepare exclude paths for git command
            const excludeArgs = excludePaths.map(path => `:^${path}`);
            // Get numstat directly with exclusions
            const stats = await this.git.raw([
                'show',
                '--numstat', // Get number stats
                '--pretty=', // No commit info, just stats
                '--no-renames', // Don't show renames as delete+add
                hash, // The commit
                '--', // Start of pathspec
                '.', // Include all files
                ...excludeArgs // Exclude specified paths
            ]);
            if (!stats || !stats.trim()) {
                console.error('No changes found in commit');
                return { files: [], total: { changes: 0, insertions: 0, deletions: 0, files: 0 } };
            }
            // Process tab-delimited output
            const fileChanges = stats
                .trim()
                .split('\n')
                .filter(Boolean)
                .map(line => {
                const [insertions = '0', deletions = '0', file = ''] = line.split('\t');
                const binary = insertions === '-' && deletions === '-';
                return {
                    file,
                    changes: binary ? 0 : Number(insertions) + Number(deletions),
                    insertions: binary ? 0 : Number(insertions),
                    deletions: binary ? 0 : Number(deletions),
                    binary
                };
            });
            const total = fileChanges.reduce((acc, file) => ({
                changes: acc.changes + file.changes,
                insertions: acc.insertions + file.insertions,
                deletions: acc.deletions + file.deletions,
                files: acc.files + 1
            }), { changes: 0, insertions: 0, deletions: 0, files: 0 });
            return { files: fileChanges, total };
        }
        catch (error) {
            throw this.handleError(error, 'getCommitChanges');
        }
    }
    /**
     * Get file content at commit
     * @param hash Commit hash
     * @param path File path
     */
    async getFileAtCommit(commitOrRef, path) {
        try {
            await this.verifyRepository();
            console.error(`Getting file ${path} at ${commitOrRef}`);
            // Skip build directory files
            if (path.startsWith('build/')) {
                console.error('Skipping build directory file:', path);
                return '';
            }
            // Try to get file content
            try {
                const content = await this.git.show([`${commitOrRef}:${path}`]);
                console.error('Successfully retrieved file content');
                return content;
            }
            catch (error) {
                console.error('Error getting file content:', error);
                // Return empty content for any error
                return '';
            }
        }
        catch (error) {
            throw this.handleError(error, 'getFileAtCommit');
        }
    }
    /**
     * Get commit history
     * @param options History options
     */
    async log(options = {}) {
        try {
            const args = ['log', '--format=%H%n%ai%n%s%n%D%n%b%n%an%n%ae%n==='];
            if (options.maxCount) {
                args.push(`-n${options.maxCount}`);
            }
            if (options.from && options.to) {
                args.push(`${options.from}..${options.to}`);
            }
            else if (options.from) {
                args.push(options.from);
            }
            if (options.file) {
                args.push('--', options.file);
            }
            const log = await this.git.raw(args);
            return log
                .trim()
                .split('\n===\n')
                .filter((entry) => Boolean(entry))
                .map((entry) => {
                const [hash, date, message, refs, body, author_name, author_email] = entry.trim().split('\n');
                return {
                    hash,
                    date,
                    message,
                    refs,
                    body,
                    author_name,
                    author_email
                };
            });
        }
        catch (error) {
            throw this.handleError(error, 'log');
        }
    }
    /**
     * Get branches
     */
    async getBranches() {
        try {
            return await this.git.branch();
        }
        catch (error) {
            throw this.handleError(error, 'getBranches');
        }
    }
    /**
     * Handle Git errors
     * @param error Error object
     * @param operation Operation name
     */
    /**
     * Get pull request information
     * @param prNumber PR number
     */
    async getPRInfo(prNumber, baseBranch, headBranch) {
        try {
            await this.verifyRepository();
            // Handle remote PR lookup
            if (!baseBranch || !headBranch) {
                try {
                    // Validate PR number format
                    if (isNaN(parseInt(prNumber))) {
                        throw new Error('Invalid PR number format');
                    }
                    const prBranch = await this.git.raw(['ls-remote', 'origin', `refs/pull/${prNumber}/head`]);
                    if (!prBranch || !prBranch.trim()) {
                        throw new Error(`PR #${prNumber} not found or inaccessible`);
                    }
                    // Create temporary branch name
                    const tempBranch = `pr-${prNumber}-temp`;
                    try {
                        // Fetch PR into temporary branch
                        console.error(`Fetching PR #${prNumber} into temporary branch ${tempBranch}`);
                        await this.git.fetch(['origin', `pull/${prNumber}/head:${tempBranch}`]);
                        // Get PR commit info
                        const prCommit = await this.git.show([
                            '--no-patch',
                            '--format=%s%n%b%n%an%n%ai',
                            tempBranch
                        ]);
                        const [title, ...rest] = prCommit.split('\n');
                        const author = rest[rest.length - 2];
                        const date = rest[rest.length - 1];
                        const description = rest.slice(0, -2).join('\n');
                        const defaultBranch = await this.git.raw(['symbolic-ref', '--short', 'HEAD']);
                        const commits = await this.git.log([`${defaultBranch}..${tempBranch}`]);
                        const commitHashes = commits.all.map(commit => commit.hash);
                        console.error('Found commits in remote PR:', commitHashes);
                        const remotePRInfo = {
                            isRemote: true,
                            remote: 'origin',
                            number: parseInt(prNumber),
                            title,
                            description,
                            author,
                            baseBranch: defaultBranch.trim(),
                            headBranch: tempBranch,
                            commits: commitHashes,
                            createdAt: new Date(date),
                            updatedAt: new Date(date),
                            state: 'open'
                        };
                        return remotePRInfo;
                    }
                    catch (error) {
                        // Clean up temporary branch in case of error
                        try {
                            await this.git.raw(['branch', '-D', tempBranch]);
                        }
                        catch (cleanupError) {
                            // Ignore cleanup errors
                        }
                        throw error;
                    }
                }
                catch (error) {
                    console.error('Remote PR lookup failed:', error);
                    throw new Error(`PR #${prNumber} not found or inaccessible`);
                }
            }
            // Handle local branch analysis
            try {
                // Verify both branches exist
                const branches = await this.git.branch();
                if (!branches.all.includes(baseBranch)) {
                    throw new Error(`Base branch "${baseBranch}" not found`);
                }
                if (!branches.all.includes(headBranch)) {
                    throw new Error(`Head branch "${headBranch}" not found`);
                }
                // Get head commit info
                const headCommit = await this.git.raw(['rev-parse', headBranch]);
                const prCommit = await this.git.show([
                    '--no-patch',
                    '--format=%s%n%b%n%an%n%ai',
                    headCommit
                ]);
                const [title, ...rest] = prCommit.split('\n');
                const author = rest[rest.length - 2];
                const date = rest[rest.length - 1];
                const description = rest.slice(0, -2).join('\n');
                // Get all commits between base and head
                const commits = await this.git.log([`${baseBranch}..${headBranch}`]);
                const commitHashes = commits.all.map(commit => commit.hash);
                if (commitHashes.length === 0) {
                    throw new Error(`No commits found between ${baseBranch} and ${headBranch}`);
                }
                console.error('Found commits between branches:', commitHashes);
                const localPRInfo = {
                    isLocal: true,
                    number: parseInt(prNumber),
                    title,
                    description,
                    author,
                    baseBranch,
                    headBranch,
                    commits: commitHashes,
                    createdAt: new Date(date),
                    updatedAt: new Date(date),
                    state: 'open'
                };
                return localPRInfo;
            }
            catch (error) {
                console.error('Local branch analysis failed:', error);
                throw error;
            }
        }
        catch (error) {
            throw this.handleError(error, 'getPRInfo');
        }
    }
    /**
     * Get PR file changes
     * @param prNumber PR number
     * @param excludePaths Paths to exclude
     */
    async getPRChanges(prNumber, baseBranch, headBranch, excludePaths = ['node_modules']) {
        try {
            await this.verifyRepository();
            let diffBase;
            let diffHead;
            // Handle local branches if provided
            if (baseBranch && headBranch) {
                try {
                    // Verify both branches exist
                    const branches = await this.git.branch();
                    if (!branches.all.includes(baseBranch)) {
                        throw new Error(`Base branch "${baseBranch}" not found`);
                    }
                    if (!branches.all.includes(headBranch)) {
                        throw new Error(`Head branch "${headBranch}" not found`);
                    }
                    // Get commit hashes for both branches
                    const baseCommit = await this.git.raw(['rev-parse', baseBranch]);
                    const headCommit = await this.git.raw(['rev-parse', headBranch]);
                    diffBase = baseCommit.trim();
                    diffHead = headCommit.trim();
                    console.error('Using local branches:', {
                        base: { branch: baseBranch, commit: diffBase },
                        head: { branch: headBranch, commit: diffHead }
                    });
                }
                catch (error) {
                    console.error('Local branch validation failed:', error);
                    throw error;
                }
            }
            else {
                // Try remote PR if no local branches provided
                try {
                    // Validate PR number format
                    if (isNaN(parseInt(prNumber))) {
                        throw new Error('Invalid PR number format');
                    }
                    // Get default branch
                    const defaultBranch = await this.git.raw(['symbolic-ref', '--short', 'HEAD']);
                    diffBase = defaultBranch.trim();
                    // Create temporary branch name
                    const tempBranch = `pr-${prNumber}-temp`;
                    try {
                        // Fetch PR into temporary branch
                        console.error(`Fetching PR #${prNumber} into temporary branch ${tempBranch}`);
                        await this.git.fetch(['origin', `pull/${prNumber}/head:${tempBranch}`]);
                        // Use the temporary branch
                        diffHead = tempBranch;
                        console.error('Using remote PR:', {
                            base: { branch: diffBase },
                            head: { branch: diffHead }
                        });
                        // Get changes
                        const excludeArgs = excludePaths.map(path => `:^${path}`);
                        const stats = await this.git.raw([
                            'diff',
                            '--numstat',
                            `${diffBase}...${diffHead}`,
                            '--',
                            '.',
                            ...excludeArgs
                        ]);
                        // Process results
                        const result = this.processGitStats(stats);
                        // Clean up temporary branch
                        console.error(`Cleaning up temporary branch ${tempBranch}`);
                        await this.git.raw(['branch', '-D', tempBranch]);
                        return result;
                    }
                    catch (error) {
                        // Clean up temporary branch in case of error
                        try {
                            await this.git.raw(['branch', '-D', tempBranch]);
                        }
                        catch (cleanupError) {
                            // Ignore cleanup errors
                        }
                        throw error;
                    }
                }
                catch (error) {
                    console.error('Remote PR lookup failed:', error);
                    throw new Error(`PR #${prNumber} not found or inaccessible`);
                }
            }
            if (!diffBase || !diffHead) {
                throw new Error('Failed to determine base and head references for comparison');
            }
            console.error('Analyzing changes between:', {
                base: diffBase,
                head: diffHead
            });
            // Prepare exclude paths for git command
            const excludeArgs = excludePaths.map(path => `:^${path}`);
            // Get diff stats between base and head
            const stats = await this.git.raw([
                'diff',
                '--numstat',
                `${diffBase}...${diffHead}`,
                '--',
                '.',
                ...excludeArgs
            ]);
            // Process results
            return this.processGitStats(stats);
        }
        catch (error) {
            throw this.handleError(error, 'getPRChanges');
        }
    }
    /**
     * Get commit hash for a branch or reference
     */
    async getCommitHash(ref) {
        try {
            const hash = await this.git.raw(['rev-parse', ref]);
            return hash.trim();
        }
        catch (error) {
            throw this.handleError(error, 'getCommitHash');
        }
    }
    handleError(error, operation) {
        const details = {
            code: this.getErrorCode(error),
            command: error?.git?.command,
            stderr: error?.git?.stderr,
            operation
        };
        return new types_1.GitProviderError(error?.message || 'Git operation failed', details);
    }
    /**
     * Get error code from error
     * @param error Error object
     */
    /**
     * Process git diff stats output
     */
    processGitStats(stats) {
        if (!stats || !stats.trim()) {
            return { files: [], total: { changes: 0, insertions: 0, deletions: 0, files: 0 } };
        }
        // Process tab-delimited output
        const fileChanges = stats
            .trim()
            .split('\n')
            .filter(Boolean)
            .map(line => {
            const [insertions = '0', deletions = '0', file = ''] = line.split('\t');
            const binary = insertions === '-' && deletions === '-';
            return {
                file,
                changes: binary ? 0 : Number(insertions) + Number(deletions),
                insertions: binary ? 0 : Number(insertions),
                deletions: binary ? 0 : Number(deletions),
                binary
            };
        });
        const total = fileChanges.reduce((acc, file) => ({
            changes: acc.changes + file.changes,
            insertions: acc.insertions + file.insertions,
            deletions: acc.deletions + file.deletions,
            files: acc.files + 1
        }), { changes: 0, insertions: 0, deletions: 0, files: 0 });
        return { files: fileChanges, total };
    }
    getErrorCode(error) {
        const message = (error?.message || '').toLowerCase();
        const stderr = (error?.git?.stderr || '').toLowerCase();
        if (message.includes('repository not found') || stderr.includes('not a git repository')) {
            return 'REPOSITORY_NOT_FOUND';
        }
        if (message.includes('did not match any file(s) known to git') ||
            stderr.includes('unknown revision')) {
            return 'INVALID_REFERENCE';
        }
        if (message.includes('merge conflict') || stderr.includes('conflict')) {
            return 'MERGE_CONFLICT';
        }
        if (message.includes('uncommitted changes') ||
            stderr.includes('uncommitted changes')) {
            return 'UNCOMMITTED_CHANGES';
        }
        if (message.includes('hook failed') || stderr.includes('hook failed')) {
            return 'HOOK_FAILED';
        }
        if (message.includes('pathspec') || stderr.includes('pathspec')) {
            return 'INVALID_PATH';
        }
        if (message.includes('lock') || stderr.includes('lock')) {
            return 'LOCK_ERROR';
        }
        if (message.includes('authentication') || stderr.includes('authentication')) {
            return 'AUTHENTICATION_FAILED';
        }
        if (message.includes('remote') || stderr.includes('remote')) {
            return 'REMOTE_ERROR';
        }
        return 'OPERATION_FAILED';
    }
}
exports.GitOperations = GitOperations;
//# sourceMappingURL=operations.js.map