import fetch from 'node-fetch';
import { 
  PRAnalysisContext, 
  PRSummaryResult, 
  LLMError, 
  LLMErrorType,
  OpenRouterErrorResponse,
  OpenRouterResponse
} from './types';
import { DEFAULT_PROMPTS } from './prompts';

/**
 * OpenRouter API client for PR analysis
 */
export class LLMClient {
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  /**
   * Set API key
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Analyze PR using LLM
   */
  public async analyzePR(context: PRAnalysisContext): Promise<PRSummaryResult> {
    if (!this.apiKey) {
      throw new LLMError('API key not configured', 'API_ERROR');
    }

    try {
      // Generate prompts
      const systemPrompt = DEFAULT_PROMPTS.system(context);
      const analysisPrompt = DEFAULT_PROMPTS.analysis(context);

      console.error('LLM Prompts:', {
        system: systemPrompt,
        analysis: analysisPrompt
      });

      // Call OpenRouter API
      console.error('Sending request to OpenRouter API...');
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/project-assistant',  // Update with actual domain
        },
        body: JSON.stringify({
          model: 'anthropic/claude-2',  // Default model, can be configured
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.3,  // Lower temperature for more focused responses
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const error = await response.json() as OpenRouterErrorResponse;
        throw new LLMError(
          error.message || 'API request failed',
          this.mapErrorType(response.status)
        );
      }

      const result = await response.json() as OpenRouterResponse;
      console.error('Received response from OpenRouter:', result);
      
      if (!result.choices?.[0]?.message?.content) {
        throw new LLMError(
          'Invalid response format from OpenRouter',
          'API_ERROR'
        );
      }
      
      const content = result.choices[0].message.content;
      console.error('Raw LLM response:', content);
      return this.parseResponse(content);

    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      throw new LLMError(
        error instanceof Error ? error.message : 'Unknown error',
        'API_ERROR'
      );
    }
  }

  /**
   * Parse LLM response into structured format
   */
  private parseResponse(content: string): PRSummaryResult {
    console.error('Parsing LLM response...');
    const lines = content.split('\n');
    const result: Partial<PRSummaryResult> = {
      review: []
    };
    
    let currentSection = '';
    let currentList: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (line.startsWith('PURPOSE:')) {
        result.purpose = line.replace('PURPOSE:', '').trim();
      } else if (line.startsWith('CHANGES:')) {
        currentSection = 'changes';
        currentList = [];
      } else if (line.startsWith('IMPACT:')) {
        // Save changes list before switching to impact
        if (currentList.length > 0) {
          result.changes = currentList.join('\n');
        }
        currentSection = 'impact';
        currentList = [];
      } else if (line.startsWith('REVIEW:')) {
        // Save impact list before switching to review
        if (currentList.length > 0) {
          result.impact = currentList.join('\n');
        }
        currentSection = 'review';
        currentList = [];
      } else if (trimmedLine.startsWith('-')) {
        const item = trimmedLine.substring(1).trim();
        if (currentSection === 'changes') {
          currentList.push(item);
        } else if (currentSection === 'impact') {
          currentList.push(item);
        } else if (currentSection === 'review') {
          result.review?.push(item);
        }
      }
    }
    
    // Handle the last section if it was impact
    if (currentSection === 'impact' && currentList.length > 0) {
      result.impact = currentList.join('\n');
    }

    if (!result.purpose || !result.changes || !result.impact || !result.review) {
      throw new LLMError(
        `Invalid response format from LLM. Missing sections: ${[
          !result.purpose && 'purpose',
          !result.changes && 'changes',
          !result.impact && 'impact',
          !result.review && 'review'
        ].filter(Boolean).join(', ')}`,
        'INVALID_REQUEST'
      );
    }

    console.error('Parsed result:', result);
    return result as PRSummaryResult;
  }

  /**
   * Map HTTP status to error type
   */
  private mapErrorType(status: number): LLMErrorType {
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
