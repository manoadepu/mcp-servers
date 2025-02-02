import { PRAnalysisContext, PRSummaryResult } from './types';
/**
 * OpenRouter API client for PR analysis
 */
export declare class LLMClient {
    private readonly baseUrl;
    private apiKey;
    constructor(apiKey?: string);
    /**
     * Set API key
     */
    setApiKey(apiKey: string): void;
    /**
     * Analyze PR using LLM
     */
    analyzePR(context: PRAnalysisContext): Promise<PRSummaryResult>;
    /**
     * Parse LLM response into structured format
     */
    private parseResponse;
    /**
     * Map HTTP status to error type
     */
    private mapErrorType;
}
