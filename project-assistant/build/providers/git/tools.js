"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitTools = exports.summarizePRTool = exports.analyzePRTool = exports.analyzeCommitTool = void 0;
const provider_1 = require("./provider");
/**
 * Analyze commit tool handler
 */
exports.analyzeCommitTool = {
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
    handler: async (params) => {
        try {
            const typedParams = params;
            const { commitId, repoPath } = typedParams;
            console.error('Analyzing commit:', commitId, 'in repo:', repoPath);
            console.error('Raw excludeFolders:', JSON.stringify(params.excludeFolders));
            let excludeFolders;
            try {
                if (typeof params.excludeFolders === 'string') {
                    excludeFolders = JSON.parse(params.excludeFolders);
                }
                else {
                    excludeFolders = params.excludeFolders;
                }
            }
            catch (e) {
                excludeFolders = params.excludeFolders;
            }
            excludeFolders = Array.isArray(excludeFolders) ? excludeFolders : excludeFolders ? [excludeFolders] : ['node_modules'];
            console.error('Processed excludeFolders:', JSON.stringify(excludeFolders));
            const config = {
                type: 'git',
                workingDir: repoPath,
                gitPath: 'git'
            };
            console.error('Initializing Git provider with config:', JSON.stringify(config));
            const provider = new provider_1.GitProvider(config);
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
        }
        catch (error) {
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
 * Analyze PR tool handler
 */
exports.analyzePRTool = {
    name: 'git/analyze/pr',
    description: 'Analyze Git pull request complexity and impact',
    inputSchema: {
        type: 'object',
        properties: {
            prNumber: {
                type: 'string',
                description: 'Pull request number'
            },
            repoPath: {
                type: 'string',
                description: 'Path to Git repository'
            },
            baseBranch: {
                type: 'string',
                description: 'Base branch name (for local PRs)',
                optional: true
            },
            headBranch: {
                type: 'string',
                description: 'Head branch name (for local PRs)',
                optional: true
            },
            excludeFolders: {
                type: 'array',
                description: 'Folders to exclude from analysis (e.g., ["node_modules", "dist"])',
                optional: true
            }
        },
        required: ['prNumber', 'repoPath']
    },
    handler: async (params) => {
        try {
            const typedParams = params;
            const { prNumber, repoPath } = typedParams;
            console.error('Analyzing PR:', prNumber, 'in repo:', repoPath);
            let excludeFolders;
            try {
                if (typeof params.excludeFolders === 'string') {
                    excludeFolders = JSON.parse(params.excludeFolders);
                }
                else {
                    excludeFolders = params.excludeFolders;
                }
            }
            catch (e) {
                excludeFolders = params.excludeFolders;
            }
            excludeFolders = Array.isArray(excludeFolders) ? excludeFolders : excludeFolders ? [excludeFolders] : ['node_modules'];
            console.error('Processed excludeFolders:', JSON.stringify(excludeFolders));
            const config = {
                type: 'git',
                workingDir: repoPath,
                gitPath: 'git'
            };
            console.error('Initializing Git provider with config:', JSON.stringify(config));
            const provider = new provider_1.GitProvider(config);
            console.error('Starting PR analysis...');
            const analysis = await provider.analyzePR(prNumber, excludeFolders, params.baseBranch, params.headBranch);
            console.error('Analysis complete');
            return {
                type: 'success',
                data: analysis
            };
        }
        catch (error) {
            console.error('Error in git/analyze/pr:', error);
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
 * Summarize PR tool handler
 */
exports.summarizePRTool = {
    name: 'git/summarize/pr',
    description: 'Get a natural language summary of a pull request',
    inputSchema: {
        type: 'object',
        properties: {
            prNumber: {
                type: 'string',
                description: 'Pull request number'
            },
            repoPath: {
                type: 'string',
                description: 'Path to Git repository'
            },
            apiKey: {
                type: 'string',
                description: 'OpenRouter API key'
            },
            baseBranch: {
                type: 'string',
                description: 'Base branch name (for local PRs)',
                optional: true
            },
            headBranch: {
                type: 'string',
                description: 'Head branch name (for local PRs)',
                optional: true
            }
        },
        required: ['prNumber', 'repoPath', 'apiKey']
    },
    handler: async (params) => {
        try {
            const { prNumber, repoPath, apiKey } = params;
            console.error('Summarizing PR:', prNumber, 'in repo:', repoPath);
            const config = {
                type: 'git',
                workingDir: repoPath,
                gitPath: 'git',
                llmConfig: {
                    apiKey,
                    model: 'anthropic/claude-2',
                    temperature: 0.3,
                    maxTokens: 1000
                }
            };
            console.error('Initializing Git provider with config:', JSON.stringify(config));
            const provider = new provider_1.GitProvider(config);
            console.error('Starting PR summary...');
            const summary = await provider.summarizePR(prNumber, ['node_modules'], params.baseBranch, params.headBranch);
            console.error('Summary complete');
            return {
                type: 'success',
                data: summary
            };
        }
        catch (error) {
            console.error('Error in git/summarize/pr:', error);
            return {
                type: 'error',
                error: error instanceof Error ?
                    `PR summary error: ${error.message}` :
                    'Unknown error during PR summary'
            };
        }
    }
};
exports.gitTools = [
    exports.analyzeCommitTool,
    exports.analyzePRTool,
    exports.summarizePRTool
];
//# sourceMappingURL=tools.js.map