"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitProvider = void 0;
const base_1 = require("../../core/providers/base");
const types_1 = require("./types");
const operations_1 = require("./operations");
const complexity_1 = require("../../core/analyzers/complexity");
/**
 * Git provider implementation
 */
class GitProvider extends base_1.BaseProvider {
    operations;
    analyzer;
    constructor(config) {
        super(config);
        // Use the parent directory of the executable as the working directory
        const workingDir = config.workingDir || process.cwd();
        console.error('Initializing GitProvider with working directory:', workingDir);
        this.operations = new operations_1.GitOperations(workingDir, config.gitPath);
        // Initialize analyzers
        this.analyzer = new complexity_1.ComplexityAnalyzer({
            includeHalstead: true,
            includeMaintainability: true
        });
        // Register Git-specific features
        this.registerFeature('git-operations', this.operations);
    }
    getName() {
        return 'Git';
    }
    getVersion() {
        return '1.0.0';
    }
    getCapabilities() {
        return [...types_1.GIT_CAPABILITIES];
    }
    async getRepository(url) {
        const repoName = url.split('/').pop()?.replace('.git', '') || '';
        return {
            id: repoName,
            name: repoName,
            url,
            defaultBranch: 'main',
            provider: this.info,
            metadata: {}
        };
    }
    async getDefaultBranch(repo) {
        try {
            const status = await this.operations.status();
            return status.current || 'main';
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get default branch: ${errorMessage}`);
        }
    }
    async getBranches(repo) {
        const branchInfo = await this.operations.getBranches();
        return branchInfo.all.map(name => ({
            name,
            commit: branchInfo.branches[name]?.commit || '',
            isDefault: name === branchInfo.current,
            protected: false,
            metadata: {}
        }));
    }
    async getCommit(repo, commitId) {
        const commitInfo = await this.operations.getCommit(commitId);
        return {
            id: commitInfo.hash,
            message: commitInfo.message,
            author: {
                name: commitInfo.author_name,
                email: commitInfo.author_email
            },
            timestamp: new Date(commitInfo.date),
            parents: [],
            repository: repo,
            metadata: {
                refs: commitInfo.refs
            }
        };
    }
    async getCommitHistory(repo, options) {
        const history = await this.operations.log({
            from: options.since?.toISOString(),
            to: options.until?.toISOString(),
            file: options.path,
            maxCount: options.maxCount
        });
        return history.map(entry => ({
            id: entry.hash,
            message: entry.message,
            author: {
                name: entry.author_name,
                email: entry.author_email
            },
            timestamp: new Date(entry.date),
            parents: [],
            repository: repo,
            metadata: {
                refs: entry.refs,
                body: entry.body
            }
        }));
    }
    async getChanges(commit, excludeFolders = ['node_modules']) {
        const excludeFoldersArray = excludeFolders ?
            (Array.isArray(excludeFolders) ? excludeFolders : [excludeFolders]) :
            ['node_modules'];
        const changes = await this.operations.getCommitChanges(commit.id, excludeFoldersArray);
        // Get only JS/TS files and analyze their complexity
        const modifiedFiles = await Promise.all(changes.files
            .filter(file => file.file.match(/\.(ts|js|tsx|jsx)$/))
            .map(async (file) => {
            try {
                const content = await this.operations.getFileAtCommit(commit.id, file.file);
                const metrics = this.analyzer.analyze(content);
                return {
                    path: file.file,
                    metrics: {
                        cyclomatic: metrics.cyclomatic,
                        cognitive: metrics.cognitive,
                        maintainability: metrics.maintainability || 0
                    }
                };
            }
            catch (error) {
                console.error(`Error analyzing ${file.file}:`, error);
                return {
                    path: file.file,
                    metrics: {
                        cyclomatic: 0,
                        cognitive: 0,
                        maintainability: 0
                    }
                };
            }
        }));
        console.error('Analyzed files:', modifiedFiles);
        const analyzedFiles = await Promise.all(changes.files
            .filter(file => file.file.match(/\.(ts|js|tsx|jsx)$/))
            .map(async (file) => {
            try {
                // Get file content after the commit
                const contentAfter = await this.operations.getFileAtCommit(commit.id, file.file);
                let contentBefore = '';
                try {
                    // Try to get content before commit, use empty string if file didn't exist
                    contentBefore = await this.operations.getFileAtCommit(commit.id + '^', file.file);
                }
                catch (error) {
                    // File is likely new, use empty content for "before" state
                    contentBefore = '';
                }
                // Analyze complexity before and after
                const metricsBefore = contentBefore ? this.analyzer.analyze(contentBefore) : { cyclomatic: 0, cognitive: 0, maintainability: 100 };
                const metricsAfter = this.analyzer.analyze(contentAfter);
                console.error(`Analyzed ${file.file}: Before - cyclomatic=${metricsBefore.cyclomatic}, cognitive=${metricsBefore.cognitive}, After - cyclomatic=${metricsAfter.cyclomatic}, cognitive=${metricsAfter.cognitive}`);
                // Calculate risk score based on complexity
                const riskScore = Math.min(100, ((metricsAfter.cyclomatic / 10) + (metricsAfter.cognitive / 15)) * 50);
                // Generate suggestions
                const suggestions = [];
                if (metricsAfter.cyclomatic > 10) {
                    suggestions.push('Consider breaking down complex logic');
                }
                if (metricsAfter.cognitive > 15) {
                    suggestions.push('High cognitive load - simplify code structure');
                }
                if (metricsAfter.maintainability && metricsAfter.maintainability < 50) {
                    suggestions.push('Low maintainability - needs refactoring');
                }
                return {
                    path: file.file,
                    type: 'modified',
                    complexity: metricsAfter,
                    detailedComplexity: {
                        before: metricsBefore,
                        after: metricsAfter,
                        delta: metricsAfter.cyclomatic - metricsBefore.cyclomatic
                    },
                    impact: {
                        score: riskScore,
                        level: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
                        factors: []
                    },
                    riskScore,
                    suggestions
                };
            }
            catch (error) {
                console.error(`Error analyzing ${file.file}:`, error);
                // Return default metrics if file analysis fails
                return {
                    path: file.file,
                    type: 'modified',
                    complexity: { cyclomatic: 0, cognitive: 0 },
                    detailedComplexity: {
                        before: { cyclomatic: 0, cognitive: 0 },
                        after: { cyclomatic: 0, cognitive: 0 },
                        delta: 0
                    },
                    impact: {
                        score: 0,
                        level: 'low',
                        factors: []
                    },
                    riskScore: 0,
                    suggestions: ['Error analyzing file']
                };
            }
        }));
        // Calculate overall risk level
        const avgRiskScore = analyzedFiles.reduce((sum, file) => sum + file.riskScore, 0) / analyzedFiles.length;
        const riskLevel = avgRiskScore > 70 ? 'high' : avgRiskScore > 40 ? 'medium' : 'low';
        // Identify main issues
        const mainIssues = [];
        if (analyzedFiles.some(f => f.complexity.cyclomatic > 10)) {
            mainIssues.push('High cyclomatic complexity detected');
        }
        if (analyzedFiles.some(f => f.complexity.cognitive > 15)) {
            mainIssues.push('High cognitive complexity detected');
        }
        if (analyzedFiles.length > 10) {
            mainIssues.push('Large number of files changed');
        }
        return {
            files: analyzedFiles,
            summary: {
                totalFiles: changes.total.files,
                riskLevel: riskLevel,
                mainIssues
            },
            modifiedFiles
        };
    }
    async analyzeCommit(commit, excludeFolders = ['node_modules']) {
        console.error('Analyzing commit:', commit.id);
        const changes = await this.getChanges(commit, excludeFolders);
        console.error('Got changes:', changes);
        // Use the already analyzed files from getChanges
        const fileMetrics = changes.files.map(file => ({
            file: file.path,
            before: file.detailedComplexity.before,
            after: file.detailedComplexity.after
        }));
        // Calculate overall complexity metrics
        const totalComplexity = {
            cyclomatic: fileMetrics.reduce((sum, file) => sum + (file.after?.cyclomatic || 0), 0),
            cognitive: fileMetrics.reduce((sum, file) => sum + (file.after?.cognitive || 0), 0)
        };
        console.error('Total complexity:', totalComplexity);
        // Calculate complexity delta
        const complexityDelta = fileMetrics.reduce((sum, file) => sum + ((file.after?.cyclomatic || 0) - (file.before?.cyclomatic || 0)), 0);
        console.error('Complexity delta:', complexityDelta);
        // Calculate impact score based on changes and complexity
        const impactScore = Math.min(100, (changes.files.length * 10) +
            Math.abs(complexityDelta * 5) +
            (totalComplexity.cyclomatic * 2));
        // Determine impact level
        const impactLevel = impactScore > 70 ? 'high' : impactScore > 40 ? 'medium' : 'low';
        // Identify impact factors
        const factors = [];
        if (changes.files.length > 10) {
            factors.push('Large number of files modified');
        }
        if (totalComplexity.cyclomatic > 50) {
            factors.push('Significant increase in cyclomatic complexity');
        }
        if (totalComplexity.cognitive > 75) {
            factors.push('High cognitive complexity impact');
        }
        // Generate recommendations
        const recommendations = [];
        if (changes.files.length > 10) {
            recommendations.push('Consider breaking changes into smaller commits');
        }
        if (totalComplexity.cyclomatic > 50) {
            recommendations.push('Review complex logic for potential simplification');
        }
        if (totalComplexity.cognitive > 75) {
            recommendations.push('Consider refactoring to reduce cognitive load');
        }
        return {
            commit,
            complexity: {
                before: {
                    cyclomatic: 0, // We don't have previous state
                    cognitive: 0
                },
                after: {
                    cyclomatic: totalComplexity.cyclomatic,
                    cognitive: totalComplexity.cognitive
                },
                delta: totalComplexity.cyclomatic // Simplified delta calculation
            },
            impact: {
                score: impactScore,
                level: impactLevel,
                factors
            },
            recommendations,
            modifiedFiles: changes.modifiedFiles
        };
    }
    async analyzePR(prNumber, excludeFolders = ['node_modules'], baseBranch, headBranch) {
        try {
            // Get PR information
            let prInfo;
            try {
                prInfo = await this.operations.getPRInfo(prNumber, baseBranch, headBranch);
            }
            catch (error) {
                console.error('Failed to get PR info:', error);
                throw error;
            }
            // Get PR changes
            let changes;
            try {
                changes = await this.operations.getPRChanges(prNumber, prInfo.baseBranch, prInfo.headBranch, excludeFolders);
            }
            catch (error) {
                console.error('Failed to get PR changes:', error);
                throw new Error(`Failed to analyze changes for PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            console.error('Analyzing PR:', {
                info: prInfo,
                changes: {
                    totalFiles: changes.files.length,
                    totalChanges: changes.total.changes
                }
            });
            // Get file contents for complexity analysis
            const fileAnalyses = await Promise.all(changes.files
                .filter((f) => f.file.match(/\.(ts|js|tsx|jsx)$/))
                .map(async (file) => {
                try {
                    // Get content before and after
                    let beforeContent = '';
                    let afterContent = '';
                    // Get content before and after
                    beforeContent = await this.operations.getFileAtCommit(prInfo.baseBranch, file.file);
                    afterContent = await this.operations.getFileAtCommit(prInfo.headBranch, file.file);
                    // Analyze complexity
                    const beforeMetrics = beforeContent ? this.analyzer.analyze(beforeContent) : { cyclomatic: 0, cognitive: 0 };
                    const afterMetrics = afterContent ? this.analyzer.analyze(afterContent) : { cyclomatic: 0, cognitive: 0 };
                    const riskScore = Math.min(100, ((afterMetrics.cyclomatic / 10) + (afterMetrics.cognitive / 15)) * 50);
                    const suggestions = [];
                    if (afterMetrics.cyclomatic > 10) {
                        suggestions.push('Consider breaking down complex logic');
                    }
                    if (afterMetrics.cognitive > 15) {
                        suggestions.push('High cognitive load - simplify code structure');
                    }
                    return {
                        path: file.file,
                        type: 'modified',
                        complexity: afterMetrics,
                        detailedComplexity: {
                            before: beforeMetrics,
                            after: afterMetrics,
                            delta: afterMetrics.cyclomatic - beforeMetrics.cyclomatic
                        },
                        impact: {
                            score: riskScore,
                            level: (riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low'),
                            factors: []
                        },
                        riskScore,
                        suggestions
                    };
                }
                catch (error) {
                    console.error(`Error analyzing file ${file.file}:`, error);
                    return null;
                }
            }));
            // Filter out failed analyses
            const validAnalyses = fileAnalyses.filter((analysis) => analysis !== null);
            // Analyze each commit in the PR
            const commitAnalyses = await Promise.all(prInfo.commits.map(async (hash) => ({
                hash,
                analysis: await this.analyzeCommitFiles(hash, changes.files.map((f) => f.file))
            })));
            // Calculate overall complexity metrics
            const complexityMetrics = this.calculatePRComplexityMetrics(commitAnalyses);
            // Calculate impact score
            const impactScore = this.calculatePRImpactScore(changes, complexityMetrics);
            // Generate recommendations
            const recommendations = this.generatePRRecommendations(changes, complexityMetrics);
            // Identify hotspots
            const hotspots = await this.identifyPRHotspots(changes.files, prInfo.commits);
            return {
                pr: prInfo,
                commits: commitAnalyses,
                impact: {
                    score: impactScore,
                    level: impactScore > 70 ? 'high' : impactScore > 40 ? 'medium' : 'low',
                    factors: this.determinePRImpactFactors(changes, complexityMetrics)
                },
                complexity: complexityMetrics,
                recommendations,
                hotspots
            };
        }
        catch (error) {
            console.error('Error analyzing PR:', error);
            throw error;
        }
    }
    async analyzeCommitFiles(hash, files) {
        const analyses = [];
        for (const file of files) {
            if (!file.match(/\.(ts|js|tsx|jsx)$/))
                continue;
            const contentAfter = await this.operations.getFileAtCommit(hash, file);
            let contentBefore = '';
            try {
                contentBefore = await this.operations.getFileAtCommit(`${hash}^`, file);
            }
            catch (error) {
                // File is likely new
            }
            const metricsBefore = contentBefore ? this.analyzer.analyze(contentBefore) : { cyclomatic: 0, cognitive: 0, maintainability: 100 };
            const metricsAfter = this.analyzer.analyze(contentAfter);
            analyses.push({
                path: file,
                type: 'modified',
                complexity: metricsAfter,
                detailedComplexity: {
                    before: metricsBefore,
                    after: metricsAfter,
                    delta: metricsAfter.cyclomatic - metricsBefore.cyclomatic
                },
                impact: this.calculateFileImpact(metricsBefore, metricsAfter),
                riskScore: this.calculateRiskScore(metricsBefore, metricsAfter),
                suggestions: this.generateFileSuggestions(metricsAfter)
            });
        }
        return analyses;
    }
    calculatePRComplexityMetrics(commitAnalyses) {
        const before = {
            cyclomatic: 0,
            cognitive: 0
        };
        const after = {
            cyclomatic: 0,
            cognitive: 0
        };
        for (const commit of commitAnalyses) {
            for (const file of commit.analysis) {
                before.cyclomatic += file.detailedComplexity.before.cyclomatic;
                before.cognitive += file.detailedComplexity.before.cognitive;
                after.cyclomatic += file.detailedComplexity.after.cyclomatic;
                after.cognitive += file.detailedComplexity.after.cognitive;
            }
        }
        return {
            before,
            after,
            delta: (after.cyclomatic + after.cognitive) - (before.cyclomatic + before.cognitive)
        };
    }
    calculatePRImpactScore(changes, complexity) {
        return Math.min(100, (changes.total.changes / 100) * 30 + // Size impact (30%)
            (changes.total.files * 5) + // File count impact
            Math.abs(complexity.delta * 2) // Complexity impact
        );
    }
    generatePRRecommendations(changes, complexity) {
        const recommendations = [];
        if (changes.total.files > 10) {
            recommendations.push('Consider breaking down the PR into smaller, focused changes');
        }
        if (changes.total.changes > 500) {
            recommendations.push('Large change set detected - thorough review recommended');
        }
        if (complexity.delta > 20) {
            recommendations.push('Significant complexity increase - consider refactoring opportunities');
        }
        return recommendations;
    }
    async identifyPRHotspots(files, commits) {
        const hotspots = [];
        for (const { file } of files) {
            if (!file.match(/\.(ts|js|tsx|jsx)$/))
                continue;
            const complexityTrend = await Promise.all(commits.map(async (commit) => ({
                commit,
                complexity: this.analyzer.analyze(await this.operations.getFileAtCommit(commit, file))
            })));
            hotspots.push({
                path: file,
                changeFrequency: commits.length,
                complexityTrend
            });
        }
        return hotspots;
    }
    determinePRImpactFactors(changes, complexity) {
        const factors = [];
        if (changes.total.files > 10) {
            factors.push('Large number of files modified');
        }
        if (changes.total.changes > 500) {
            factors.push('Significant code churn');
        }
        if (complexity.delta > 20) {
            factors.push('High complexity impact');
        }
        return factors;
    }
    calculateFileImpact(before, after) {
        const complexityDelta = after.cyclomatic - before.cyclomatic;
        const cognitiveDelta = after.cognitive - before.cognitive;
        const score = Math.min(100, (Math.abs(complexityDelta) * 10) +
            (Math.abs(cognitiveDelta) * 15));
        const factors = [];
        if (complexityDelta > 5)
            factors.push('Significant cyclomatic complexity increase');
        if (cognitiveDelta > 5)
            factors.push('High cognitive complexity impact');
        return {
            score,
            level: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
            factors
        };
    }
    calculateRiskScore(before, after) {
        return Math.min(100, ((after.cyclomatic / 10) + (after.cognitive / 15)) * 50);
    }
    generateFileSuggestions(metrics) {
        const suggestions = [];
        if (metrics.cyclomatic > 10) {
            suggestions.push('Consider breaking down complex logic');
        }
        if (metrics.cognitive > 15) {
            suggestions.push('High cognitive load - simplify code structure');
        }
        if (metrics.maintainability && metrics.maintainability < 50) {
            suggestions.push('Low maintainability - needs refactoring');
        }
        return suggestions;
    }
    async analyzeChanges(changes) {
        // This is a placeholder implementation
        // Real implementation would analyze the changes and provide insights
        return {
            commit: {}, // This should be provided by the caller
            complexity: {
                before: {
                    cyclomatic: 0,
                    cognitive: 0
                },
                after: {
                    cyclomatic: 0,
                    cognitive: 0
                },
                delta: 0
            },
            impact: {
                score: 0,
                level: 'low',
                factors: []
            },
            recommendations: []
        };
    }
}
exports.GitProvider = GitProvider;
//# sourceMappingURL=provider.js.map