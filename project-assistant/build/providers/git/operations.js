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
        // Normalize path to use forward slashes
        const normalizedDir = workingDir.replace(/\\/g, '/');
        const options = {
            baseDir: normalizedDir,
            binary: gitPath,
            maxConcurrentProcesses: 6,
            trimmed: true
        };
        this.git = (0, simple_git_1.default)(options);
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
            const log = await this.git.show([
                '--no-patch',
                '--format=%H%n%s%n%an%n%ae%n%ai%n%D',
                hash
            ]);
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
    async getCommitChanges(hash) {
        try {
            const stats = await this.git.raw([
                'diff-tree',
                '--no-commit-id',
                '--numstat',
                '-r',
                hash
            ]);
            const files = stats
                .trim()
                .split('\n')
                .filter((line) => Boolean(line))
                .map((line) => {
                const [insertions, deletions, file] = line.split('\t');
                const binary = insertions === '-' && deletions === '-';
                return {
                    file,
                    changes: binary ? 0 : Number(insertions) + Number(deletions),
                    insertions: binary ? 0 : Number(insertions),
                    deletions: binary ? 0 : Number(deletions),
                    binary
                };
            });
            const total = files.reduce((acc, file) => ({
                changes: acc.changes + file.changes,
                insertions: acc.insertions + file.insertions,
                deletions: acc.deletions + file.deletions,
                files: acc.files + 1
            }), { changes: 0, insertions: 0, deletions: 0, files: 0 });
            return { files, total };
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
    async getFileAtCommit(hash, path) {
        try {
            return await this.git.show([`${hash}:${path}`]);
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