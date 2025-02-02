import { readFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { ComplexityAnalyzer } from '../core/analyzers/complexity.js';
import { ErrorResponse, AnalysisError, FileSystemError } from '../utils/errors.js';

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

export class AnalysisHandler {
  private analyzer: ComplexityAnalyzer;

  constructor() {
    this.analyzer = new ComplexityAnalyzer({
      includeMaintainability: true,
      maxComplexity: 10,
      maxCognitive: 15,
    });
  }

  /**
   * Analyze code complexity for a given file
   */
  public async analyzeComplexity(path: string, options: AnalysisOptions = {}): Promise<AnalysisResult> {
    try {
      const stats = await stat(path);
      
      if (stats.isDirectory()) {
        return this.analyzeDirectory(path, options);
      } else {
        return this.analyzeFile(path);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate analysis summary with status and issues
   */
  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string): Promise<FileAnalysisResult> {
    // Only analyze TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|js|tsx|jsx)$/)) {
      throw new AnalysisError(`Unsupported file type: ${filePath}`, 'INVALID_FILE_TYPE');
    }

    const code = await readFile(filePath, 'utf-8');
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
  private async analyzeDirectory(dirPath: string, options: AnalysisOptions): Promise<DirectoryAnalysisResult> {
    const entries = await readdir(dirPath);
    const children: (FileAnalysisResult | DirectoryAnalysisResult)[] = [];
    
    // Analyze each entry in the directory
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory() && options.recursive) {
        children.push(await this.analyzeDirectory(fullPath, options));
      } else if (stats.isFile() && fullPath.match(/\.(ts|js|tsx|jsx)$/)) {
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
      .sort((a, b) => 
        (b.metrics.complexity.cyclomatic + b.metrics.complexity.cognitive) -
        (a.metrics.complexity.cyclomatic + a.metrics.complexity.cognitive)
      )
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
  private getAllFileResults(results: (FileAnalysisResult | DirectoryAnalysisResult)[]): FileAnalysisResult[] {
    const fileResults: FileAnalysisResult[] = [];
    
    for (const result of results) {
      if (result.type === 'file') {
        fileResults.push(result);
      } else {
        fileResults.push(...this.getAllFileResults(result.children));
      }
    }
    
    return fileResults;
  }

  /**
   * Calculate average of numbers
   */
  private average(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Generate summary for a single file
   */
  private generateFileSummary(metrics: {
    cyclomatic: number;
    cognitive: number;
    maintainability?: number;
  }): AnalysisResult['metrics']['summary'] {
    const issues: string[] = [];
    let status: 'pass' | 'warn' | 'fail' = 'pass';

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
      issues.push(
        `Low maintainability index (${metrics.maintainability.toFixed(2)})`
      );
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
  private generateDirectorySummary(
    averageComplexity: {
      cyclomatic: number;
      cognitive: number;
      maintainability?: number;
    },
    totalFiles: number
  ): { status: 'pass' | 'warn' | 'fail'; issues: string[] } {
    const issues: string[] = [];
    let status: 'pass' | 'warn' | 'fail' = 'pass';

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

  private handleError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new FileSystemError(`File not found: ${error.message}`);
      }
      throw new AnalysisError(error.message, 'ANALYSIS_ERROR', {
        name: error.name,
        stack: error.stack,
      });
    }

    throw new AnalysisError(
      'An unknown error occurred during analysis',
      'UNKNOWN_ERROR',
      { error }
    );
  }
}
