/**
 * Code Complexity Analyzer
 * Analyzes cyclomatic complexity and other complexity metrics
 */
export interface ComplexityMetrics {
    cyclomatic: number;
    cognitive: number;
    halstead?: HalsteadMetrics;
    maintainability?: number;
}
export interface HalsteadMetrics {
    operators: number;
    operands: number;
    uniqueOperators: number;
    uniqueOperands: number;
    programLength: number;
    vocabulary: number;
    volume: number;
    difficulty: number;
    effort: number;
}
export interface AnalysisOptions {
    includeHalstead?: boolean;
    includeMaintainability?: boolean;
    maxComplexity?: number;
    maxCognitive?: number;
}
export declare class ComplexityAnalyzer {
    private options;
    constructor(options?: AnalysisOptions);
    /**
     * Analyze code complexity
     * @param code Source code to analyze
     * @returns Complexity metrics
     */
    analyze(code: string): ComplexityMetrics;
    /**
     * Calculate cyclomatic complexity
     * Based on number of decision points in code
     */
    private calculateCyclomaticComplexity;
    /**
     * Calculate cognitive complexity
     * Based on code nesting and structural complexity
     */
    private calculateCognitiveComplexity;
    /**
     * Calculate Halstead metrics
     * Based on operators and operands in code
     */
    private calculateHalsteadMetrics;
    /**
     * Calculate maintainability index
     * Based on Halstead Volume, Cyclomatic Complexity, and Lines of Code
     */
    private calculateMaintainabilityIndex;
}
