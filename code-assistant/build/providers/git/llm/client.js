"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const types_1 = require("./types");
const prompts_1 = require("./prompts");
/**
 * OpenRouter API client for PR analysis
 */
class LLMClient {
    baseUrl = 'https://openrouter.ai/api/v1';
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    /**
     * Set API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
    /**
     * Analyze PR using LLM
     */
    async analyzePR(context) {
        if (!this.apiKey) {
            throw new types_1.LLMError('API key not configured', 'API_ERROR');
        }
        try {
            // Generate prompts
            const systemPrompt = prompts_1.DEFAULT_PROMPTS.system(context);
            const analysisPrompt = prompts_1.DEFAULT_PROMPTS.analysis(context);
            console.error('LLM Prompts:', {
                system: systemPrompt,
                analysis: analysisPrompt
            });
            // Call OpenRouter API
            console.error('Sending request to OpenRouter API...');
            const response = await (0, node_fetch_1.default)(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/project-assistant', // Update with actual domain
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-2', // Default model, can be configured
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: analysisPrompt }
                    ],
                    temperature: 0.3, // Lower temperature for more focused responses
                    max_tokens: 1000
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new types_1.LLMError(error.message || 'API request failed', this.mapErrorType(response.status));
            }
            const result = await response.json();
            console.error('Received response from OpenRouter:', result);
            if (!result.choices?.[0]?.message?.content) {
                throw new types_1.LLMError('Invalid response format from OpenRouter', 'API_ERROR');
            }
            const content = result.choices[0].message.content;
            console.error('Raw LLM response:', content);
            return this.parseResponse(content);
        }
        catch (error) {
            if (error instanceof types_1.LLMError) {
                throw error;
            }
            throw new types_1.LLMError(error instanceof Error ? error.message : 'Unknown error', 'API_ERROR');
        }
    }
    /**
     * Parse LLM response into structured format
     */
    parseResponse(content) {
        console.error('Parsing LLM response...');
        const lines = content.split('\n');
        const result = {
            review: []
        };
        let currentSection = '';
        let currentList = [];
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (line.startsWith('PURPOSE:')) {
                result.purpose = line.replace('PURPOSE:', '').trim();
            }
            else if (line.startsWith('CHANGES:')) {
                currentSection = 'changes';
                currentList = [];
            }
            else if (line.startsWith('IMPACT:')) {
                // Save changes list before switching to impact
                if (currentList.length > 0) {
                    result.changes = currentList.join('\n');
                }
                currentSection = 'impact';
                currentList = [];
            }
            else if (line.startsWith('REVIEW:')) {
                // Save impact list before switching to review
                if (currentList.length > 0) {
                    result.impact = currentList.join('\n');
                }
                currentSection = 'review';
                currentList = [];
            }
            else if (trimmedLine.startsWith('-')) {
                const item = trimmedLine.substring(1).trim();
                if (currentSection === 'changes') {
                    currentList.push(item);
                }
                else if (currentSection === 'impact') {
                    currentList.push(item);
                }
                else if (currentSection === 'review') {
                    result.review?.push(item);
                }
            }
        }
        // Handle the last section if it was impact
        if (currentSection === 'impact' && currentList.length > 0) {
            result.impact = currentList.join('\n');
        }
        if (!result.purpose || !result.changes || !result.impact || !result.review) {
            throw new types_1.LLMError(`Invalid response format from LLM. Missing sections: ${[
                !result.purpose && 'purpose',
                !result.changes && 'changes',
                !result.impact && 'impact',
                !result.review && 'review'
            ].filter(Boolean).join(', ')}`, 'INVALID_REQUEST');
        }
        console.error('Parsed result:', result);
        return result;
    }
    /**
     * Map HTTP status to error type
     */
    mapErrorType(status) {
        switch (status) {
            case 429:
                return 'RATE_LIMIT_EXCEEDED';
            case 413:
                return 'CONTEXT_TOO_LONG';
            case 400:
                return 'INVALID_REQUEST';
            default:
                return 'API_ERROR';
        }
    }
}
exports.LLMClient = LLMClient;
//# sourceMappingURL=client.js.map