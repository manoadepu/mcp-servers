export interface FileAnalysisResult {
    type: 'file';
    path: string;
    metrics: {
        complexity: {
            cyclomatic: number;
            cognitive: number;
            maintainability?: number;
        };
        summary: {
            status: 'pass' | 'warn' | 'fail';
            issues: string[];
        };
    };
}
export interface DirectoryAnalysisResult {
    type: 'directory';
    path: string;
    metrics: {
        totalFiles: number;
        averageComplexity: {
            cyclomatic: number;
            cognitive: number;
            maintainability?: number;
        };
        worstFiles: {
            path: string;
            metrics: {
                cyclomatic: number;
                cognitive: number;
                maintainability?: number;
            };
        }[];
        summary: {
            status: 'pass' | 'warn' | 'fail';
            issues: string[];
        };
    };
    children: (FileAnalysisResult | DirectoryAnalysisResult)[];
}
export type AnalysisResult = FileAnalysisResult | DirectoryAnalysisResult;
export interface AnalysisOptions {
    recursive?: boolean;
    format?: 'detailed' | 'summary';
}
export declare class AnalysisHandler {
    private analyzer;
    constructor();
    /**
     * Analyze code complexity for a given file
     */
    analyzeComplexity(path: string, options?: AnalysisOptions): Promise<AnalysisResult>;
    /**
     * Generate analysis summary with status and issues
     */
    /**
     * Analyze a single file
     */
    private analyzeFile;
    /**
     * Analyze a directory recursively
     */
    private analyzeDirectory;
    /**
     * Get all file results from a directory tree
     */
    private getAllFileResults;
    /**
     * Calculate average of numbers
     */
    private average;
    /**
     * Generate summary for a single file
     */
    private generateFileSummary;
    /**
     * Handle and transform errors
     */
    /**
     * Generate summary for a directory
     */
    private generateDirectorySummary;
    private handleError;
}
