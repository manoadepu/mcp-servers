import { PRAnalysisContext } from './types';
/**
 * Generate system prompt for PR analysis
 */
export declare function generateSystemPrompt(context: PRAnalysisContext): string;
/**
 * Generate analysis prompt for PR
 */
export declare function generateAnalysisPrompt(context: PRAnalysisContext): string;
/**
 * Default prompt templates
 */
export declare const DEFAULT_PROMPTS: {
    system: typeof generateSystemPrompt;
    analysis: typeof generateAnalysisPrompt;
};
