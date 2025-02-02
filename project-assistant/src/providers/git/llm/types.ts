/**
 * LLM integration types for PR analysis
 */

/**
 * PR Summary result
 */
export interface PRSummaryResult {
  purpose: string;     // What this PR does
  changes: string;     // Key changes made
  impact: string;      // Technical impact
  review: string[];    // Review focus points
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

export type LLMErrorType = 
  | 'RATE_LIMIT_EXCEEDED'
  | 'CONTEXT_TOO_LONG'
  | 'INVALID_REQUEST'
  | 'API_ERROR';

/**
 * LLM error
 */
export class LLMError extends Error {
  constructor(
    message: string,
    public type: LLMErrorType
  ) {
    super(message);
    this.name = 'LLMError';
  }
}
