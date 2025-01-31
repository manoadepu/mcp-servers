"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitProviderError = exports.GIT_CAPABILITIES = void 0;
/**
 * Git provider capabilities
 */
exports.GIT_CAPABILITIES = [
    'local-repository',
    'commit-signing',
    'branch-protection',
    'git-hooks',
    'file-history',
    'blame',
    'worktree'
];
/**
 * Git provider error
 */
class GitProviderError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'GitProviderError';
    }
}
exports.GitProviderError = GitProviderError;
//# sourceMappingURL=types.js.map