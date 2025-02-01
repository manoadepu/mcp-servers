"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitTools = exports.analyzePRTool = exports.analyzePatternsTools = exports.analyzeCommitTool = void 0;
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
 * Analyze patterns tool handler
 */
exports.analyzePatternsTools = {
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
    handler: async (params) => {
        const typedParams = params;
        const { repoPath, since, until } = typedParams;
        const config = {
            type: 'git',
            workingDir: repoPath,
            gitPath: 'git'
        };
        const provider = new provider_1.GitProvider(config);
        try {
            const repo = await provider.getRepository(repoPath);
            const history = await provider.getCommitHistory(repo, {
                since: since ? new Date(since) : undefined,
                until: until ? new Date(until) : undefined
            });
            // Analyze patterns across commits
            const patterns = await Promise.all(history.map(async (commit) => {
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
            }));
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
            }, {});
            return {
                type: 'success',
                data: {
                    patterns,
                    hotspots: Object.values(hotspots)
                        .sort((a, b) => b.changes - a.changes)
                        .slice(0, 10),
                    summary: {
                        totalCommits: patterns.length,
                        averageComplexity: patterns.reduce((sum, p) => sum + p.complexity.after.cyclomatic, 0) / patterns.length,
                        riskLevel: patterns.some(p => p.impact.level === 'high') ? 'high' :
                            patterns.some(p => p.impact.level === 'medium') ? 'medium' : 'low'
                    }
                }
            };
        }
        catch (error) {
            return {
                type: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
        finally {
            provider.dispose();
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
            const analysis = await provider.analyzePR(prNumber, excludeFolders);
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
exports.gitTools = [
    exports.analyzeCommitTool,
    exports.analyzePatternsTools,
    exports.analyzePRTool
];
//# sourceMappingURL=tools.js.map