"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisHandler = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const complexity_js_1 = require("../core/analyzers/complexity.js");
const errors_js_1 = require("../utils/errors.js");
class AnalysisHandler {
    analyzer;
    constructor() {
        this.analyzer = new complexity_js_1.ComplexityAnalyzer({
            includeMaintainability: true,
            maxComplexity: 10,
            maxCognitive: 15,
        });
    }
    /**
     * Analyze code complexity for a given file
     */
    async analyzeComplexity(path, options = {}) {
        try {
            const stats = await (0, promises_1.stat)(path);
            if (stats.isDirectory()) {
                return this.analyzeDirectory(path, options);
            }
            else {
                return this.analyzeFile(path);
            }
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Generate analysis summary with status and issues
     */
    /**
     * Analyze a single file
     */
    async analyzeFile(filePath) {
        // Only analyze TypeScript/JavaScript files
        if (!filePath.match(/\.(ts|js|tsx|jsx)$/)) {
            throw new errors_js_1.AnalysisError(`Unsupported file type: ${filePath}`, 'INVALID_FILE_TYPE');
        }
        const code = await (0, promises_1.readFile)(filePath, 'utf-8');
        const metrics = this.analyzer.analyze(code);
        return {
            type: 'file',
            path: filePath,
            metrics: {
                complexity: {
                    cyclomatic: metrics.cyclomatic,
                    cognitive: metrics.cognitive,
                    maintainability: metrics.maintainability,
                },
                summary: this.generateFileSummary(metrics),
            },
        };
    }
    /**
     * Analyze a directory recursively
     */
    async analyzeDirectory(dirPath, options) {
        const entries = await (0, promises_1.readdir)(dirPath);
        const children = [];
        // Analyze each entry in the directory
        for (const entry of entries) {
            const fullPath = (0, path_1.join)(dirPath, entry);
            const stats = await (0, promises_1.stat)(fullPath);
            if (stats.isDirectory() && options.recursive) {
                children.push(await this.analyzeDirectory(fullPath, options));
            }
            else if (stats.isFile() && fullPath.match(/\.(ts|js|tsx|jsx)$/)) {
                children.push(await this.analyzeFile(fullPath));
            }
        }
        // Calculate directory metrics
        const fileResults = this.getAllFileResults(children);
        const totalFiles = fileResults.length;
        if (totalFiles === 0) {
            return {
                type: 'directory',
                path: dirPath,
                metrics: {
                    totalFiles: 0,
                    averageComplexity: { cyclomatic: 0, cognitive: 0, maintainability: 0 },
                    worstFiles: [],
                    summary: { status: 'pass', issues: [] }
                },
                children
            };
        }
        // Calculate averages
        const averageComplexity = {
            cyclomatic: this.average(fileResults.map(r => r.metrics.complexity.cyclomatic)),
            cognitive: this.average(fileResults.map(r => r.metrics.complexity.cognitive)),
            maintainability: this.average(fileResults.map(r => r.metrics.complexity.maintainability || 0))
        };
        // Find worst files
        const worstFiles = fileResults
            .sort((a, b) => (b.metrics.complexity.cyclomatic + b.metrics.complexity.cognitive) -
            (a.metrics.complexity.cyclomatic + a.metrics.complexity.cognitive))
            .slice(0, 5)
            .map(result => ({
            path: result.path,
            metrics: result.metrics.complexity
        }));
        return {
            type: 'directory',
            path: dirPath,
            metrics: {
                totalFiles,
                averageComplexity,
                worstFiles,
                summary: this.generateDirectorySummary(averageComplexity, totalFiles)
            },
            children
        };
    }
    /**
     * Get all file results from a directory tree
     */
    getAllFileResults(results) {
        const fileResults = [];
        for (const result of results) {
            if (result.type === 'file') {
                fileResults.push(result);
            }
            else {
                fileResults.push(...this.getAllFileResults(result.children));
            }
        }
        return fileResults;
    }
    /**
     * Calculate average of numbers
     */
    average(numbers) {
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }
    /**
     * Generate summary for a single file
     */
    generateFileSummary(metrics) {
        const issues = [];
        let status = 'pass';
        // Check cyclomatic complexity
        if (metrics.cyclomatic > 10) {
            issues.push(`High cyclomatic complexity (${metrics.cyclomatic})`);
            status = metrics.cyclomatic > 15 ? 'fail' : 'warn';
        }
        // Check cognitive complexity
        if (metrics.cognitive > 15) {
            issues.push(`High cognitive complexity (${metrics.cognitive})`);
            status = metrics.cognitive > 20 ? 'fail' : 'warn';
        }
        // Check maintainability index
        if (metrics.maintainability !== undefined && metrics.maintainability < 65) {
            issues.push(`Low maintainability index (${metrics.maintainability.toFixed(2)})`);
            status = metrics.maintainability < 50 ? 'fail' : 'warn';
        }
        return {
            status,
            issues,
        };
    }
    /**
     * Handle and transform errors
     */
    /**
     * Generate summary for a directory
     */
    generateDirectorySummary(averageComplexity, totalFiles) {
        const issues = [];
        let status = 'pass';
        if (averageComplexity.cyclomatic > 8) {
            issues.push(`High average cyclomatic complexity (${averageComplexity.cyclomatic.toFixed(2)})`);
            status = averageComplexity.cyclomatic > 12 ? 'fail' : 'warn';
        }
        if (averageComplexity.cognitive > 12) {
            issues.push(`High average cognitive complexity (${averageComplexity.cognitive.toFixed(2)})`);
            status = averageComplexity.cognitive > 18 ? 'fail' : 'warn';
        }
        if (averageComplexity.maintainability !== undefined && averageComplexity.maintainability < 70) {
            issues.push(`Low average maintainability index (${averageComplexity.maintainability.toFixed(2)})`);
            status = averageComplexity.maintainability < 55 ? 'fail' : 'warn';
        }
        return { status, issues };
    }
    handleError(error) {
        if (error instanceof Error) {
            if (error.message.includes('ENOENT')) {
                throw new errors_js_1.FileSystemError(`File not found: ${error.message}`);
            }
            throw new errors_js_1.AnalysisError(error.message, 'ANALYSIS_ERROR', {
                name: error.name,
                stack: error.stack,
            });
        }
        throw new errors_js_1.AnalysisError('An unknown error occurred during analysis', 'UNKNOWN_ERROR', { error });
    }
}
exports.AnalysisHandler = AnalysisHandler;
//# sourceMappingURL=analysis.js.map