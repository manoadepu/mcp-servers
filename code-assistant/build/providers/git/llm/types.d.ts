/**
 * LLM integration types for PR analysis
 */
/**
 * PR Summary result
 */
export interface PRSummaryResult {
    purpose: string;
    changes: string;
    impact: string;
    review: string[];
}
/**
 * Context for LLM analysis
 */
export interface PRAnalysisContext {
    repository: {
        language: string;
        framework: string;
        architecture: string;
    };
    changes: {
        diff: string;
        files: string[];
        dependencies: string[];
        apiChanges: string[];
    };
    metrics: {
        complexity: string;
        impact: string;
        hotspots: string;
    };
}
/**
 * LLM error types
 */
/**
 * OpenRouter API types
 */
export interface OpenRouterErrorResponse {
    message: string;
    type: string;
}
export interface OpenRouterChoice {
    message: {
        content: string;
        role: string;
    };
    finish_reason: string;
}
export interface OpenRouterResponse {
    choices: OpenRouterChoice[];
}
export type LLMErrorType = 'RATE_LIMIT_EXCEEDED' | 'CONTEXT_TOO_LONG' | 'INVALID_REQUEST' | 'API_ERROR';
/**
 * LLM error
 */
export declare class LLMError extends Error {
    type: LLMErrorType;
    constructor(message: string, type: LLMErrorType);
}
