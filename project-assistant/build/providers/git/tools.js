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
            }
        },
        required: ['commitId', 'repoPath']
    },
    handler: async (params) => {
        const typedParams = params;
        const { commitId, repoPath } = typedParams;
        const config = {
            type: 'git',
            workingDir: repoPath,
            gitPath: 'git'
        };
        const provider = new provider_1.GitProvider(config);
        try {
            const repo = await provider.getRepository(repoPath);
            const commit = await provider.getCommit(repo, commitId);
            const analysis = await provider.analyzeCommit(commit);
            return {
                type: 'success',
                data: analysis
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
    description: 'Analyze Git pull request impact',
    inputSchema: {
        type: 'object',
        properties: {
            repoPath: {
                type: 'string',
                description: 'Path to Git repository'
            },
            baseCommit: {
                type: 'string',
                description: 'Base commit hash'
            },
            headCommit: {
                type: 'string',
                description: 'Head commit hash'
            }
        },
        required: ['repoPath', 'baseCommit', 'headCommit']
    },
    handler: async (params) => {
        const typedParams = params;
        const { repoPath, baseCommit, headCommit } = typedParams;
        const config = {
            type: 'git',
            workingDir: repoPath,
            gitPath: 'git'
        };
        const provider = new provider_1.GitProvider(config);
        try {
            const repo = await provider.getRepository(repoPath);
            // Analyze base and head commits
            const baseCommitObj = await provider.getCommit(repo, baseCommit);
            const headCommitObj = await provider.getCommit(repo, headCommit);
            const baseAnalysis = await provider.analyzeCommit(baseCommitObj);
            const headAnalysis = await provider.analyzeCommit(headCommitObj);
            // Get changes between commits
            const baseChanges = await provider.getChanges(baseCommitObj);
            const headChanges = await provider.getChanges(headCommitObj);
            // Calculate impact
            const changedFiles = new Set([
                ...baseChanges.files.map(f => f.path),
                ...headChanges.files.map(f => f.path)
            ]);
            const fileAnalysis = Array.from(changedFiles).map(path => {
                const baseFile = baseChanges.files.find(f => f.path === path);
                const headFile = headChanges.files.find(f => f.path === path);
                return {
                    path,
                    complexityDelta: (headFile?.complexity.cyclomatic || 0) -
                        (baseFile?.complexity.cyclomatic || 0),
                    riskScore: headFile?.riskScore || 0,
                    suggestions: headFile?.suggestions || []
                };
            });
            return {
                type: 'success',
                data: {
                    files: fileAnalysis,
                    complexity: {
                        before: baseAnalysis.complexity,
                        after: headAnalysis.complexity,
                        delta: headAnalysis.complexity.after.cyclomatic -
                            baseAnalysis.complexity.after.cyclomatic
                    },
                    impact: headAnalysis.impact,
                    recommendations: [
                        ...headAnalysis.recommendations,
                        ...(Math.abs(headAnalysis.complexity.delta) > 10 ?
                            ['Consider breaking changes into smaller PRs'] : []),
                        ...(fileAnalysis.length > 10 ?
                            ['PR affects many files - careful review needed'] : [])
                    ]
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
exports.gitTools = [
    exports.analyzeCommitTool,
    exports.analyzePatternsTools,
    exports.analyzePRTool
];
//# sourceMappingURL=tools.js.map