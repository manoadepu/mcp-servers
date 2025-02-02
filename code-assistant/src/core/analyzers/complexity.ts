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

export class ComplexityAnalyzer {
  constructor(private options: AnalysisOptions = {}) {
    this.options = {
      includeHalstead: false,
      includeMaintainability: true,
      maxComplexity: 10,
      maxCognitive: 15,
      ...options,
    };
  }

  /**
   * Analyze code complexity
   * @param code Source code to analyze
   * @returns Complexity metrics
   */
  public analyze(code: string): ComplexityMetrics {
    try {
      // Basic validation of code structure
      if (!code.trim()) {
        return {
          cyclomatic: 0,
          cognitive: 0,
          halstead: this.options.includeHalstead ? {
            operators: 0,
            operands: 0,
            uniqueOperators: 0,
            uniqueOperands: 0,
            programLength: 0,
            vocabulary: 0,
            volume: 0,
            difficulty: 0,
            effort: 0
          } : undefined,
          maintainability: this.options.includeMaintainability ? 100 : undefined
        };
      }

      const metrics: ComplexityMetrics = {
        cyclomatic: this.calculateCyclomaticComplexity(code),
        cognitive: this.calculateCognitiveComplexity(code),
      };

      if (this.options.includeHalstead) {
        try {
          metrics.halstead = this.calculateHalsteadMetrics(code);
        } catch (error) {
          console.error('Error calculating Halstead metrics:', error);
          metrics.halstead = {
            operators: 0,
            operands: 0,
            uniqueOperators: 0,
            uniqueOperands: 0,
            programLength: 0,
            vocabulary: 0,
            volume: 0,
            difficulty: 0,
            effort: 0
          };
        }
      }

      if (this.options.includeMaintainability) {
        try {
          metrics.maintainability = this.calculateMaintainabilityIndex(
            metrics,
            code.split('\n').length
          );
        } catch (error) {
          console.error('Error calculating maintainability:', error);
          metrics.maintainability = 0;
        }
      }

      return metrics;
    } catch (error) {
      console.error('Error analyzing code complexity:', error);
      return {
        cyclomatic: 0,
        cognitive: 0,
        halstead: this.options.includeHalstead ? {
          operators: 0,
          operands: 0,
          uniqueOperators: 0,
          uniqueOperands: 0,
          programLength: 0,
          vocabulary: 0,
          volume: 0,
          difficulty: 0,
          effort: 0
        } : undefined,
        maintainability: this.options.includeMaintainability ? 0 : undefined
      };
    }
  }

  /**
   * Calculate cyclomatic complexity
   * Based on number of decision points in code
   */
  private calculateCyclomaticComplexity(code: string): number {
    let complexity = 1; // Base complexity

    // Count decision points
    const decisions = [
      /\bif\b/g,
      /\belse\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b(&&|\|\|)\b/g,
      /\?/g,
    ];

    for (const pattern of decisions) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * Calculate cognitive complexity
   * Based on code nesting and structural complexity
   */
  private calculateCognitiveComplexity(code: string): number {
    let complexity = 0;
    let nesting = 0;

    const lines = code.split('\n');
    for (const line of lines) {
      // Increment nesting level
      if (line.match(/{/g)) {
        nesting++;
      }

      // Decrement nesting level
      if (line.match(/}/g)) {
        nesting = Math.max(0, nesting - 1);
      }

      // Add complexity for control structures
      if (line.match(/\b(if|while|for|foreach|catch)\b/)) {
        complexity += 1 + nesting;
      }

      // Add complexity for boolean operators
      const booleanOps = line.match(/\b(&&|\|\|)\b/g);
      if (booleanOps) {
        complexity += booleanOps.length;
      }
    }

    return complexity;
  }

  /**
   * Calculate Halstead metrics
   * Based on operators and operands in code
   */
  private calculateHalsteadMetrics(code: string): HalsteadMetrics {
    const operators = new Set<string>();
    const operands = new Set<string>();
    let totalOperators = 0;
    let totalOperands = 0;

    // Simple tokenization for demonstration
    const tokens = code.match(/\b\w+\b|[+\-*/%=<>!&|^~(){}[\];,.]|\b\d+(\.\d+)?\b/g) || [];

    for (const token of tokens) {
      if (token.match(/^[+\-*/%=<>!&|^~(){}[\];,.]$/)) {
        operators.add(token);
        totalOperators++;
      } else {
        operands.add(token);
        totalOperands++;
      }
    }

    const n1 = operators.size;
    const n2 = operands.size;
    const N1 = totalOperators;
    const N2 = totalOperands;

    const programLength = N1 + N2;
    const vocabulary = n1 + n2;
    const volume = programLength * Math.log2(vocabulary);
    const difficulty = (n1 / 2) * (N2 / n2);
    const effort = difficulty * volume;

    return {
      operators: N1,
      operands: N2,
      uniqueOperators: n1,
      uniqueOperands: n2,
      programLength,
      vocabulary,
      volume,
      difficulty,
      effort,
    };
  }

  /**
   * Calculate maintainability index
   * Based on Halstead Volume, Cyclomatic Complexity, and Lines of Code
   */
  private calculateMaintainabilityIndex(
    metrics: ComplexityMetrics,
    linesOfCode: number
  ): number {
    if (!metrics.halstead) {
      return -1;
    }

    const HV = metrics.halstead.volume;
    const CC = metrics.cyclomatic;
    const LOC = linesOfCode;

    // Maintainability Index formula
    const MI =
      171 -
      5.2 * Math.log(HV) -
      0.23 * CC -
      16.2 * Math.log(LOC);

    // Normalize to 0-100 scale
    return Math.max(0, Math.min(100, MI * 100 / 171));
  }
}
