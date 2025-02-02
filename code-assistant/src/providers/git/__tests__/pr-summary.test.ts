import { GitProvider } from '../provider';
import { GitProviderConfig } from '../types';
import { PRSummaryResult } from '../llm/types';

describe('PR Summary', () => {
  let provider: GitProvider;

  beforeEach(() => {
    const config: GitProviderConfig = {
      type: 'git',
      workingDir: process.cwd(),
      llmConfig: {
        apiKey: process.env.OPENROUTER_API_KEY || 'test-key'
      }
    };
    provider = new GitProvider(config);
  });

  describe('summarizePR', () => {
    it('should provide a summary of PR changes', async () => {
      // Mock PR number for testing
      const prNumber = '123';
      
      const summary = await provider.summarizePR(prNumber);
      
      // Verify summary structure
      expect(summary).toBeDefined();
      expect(summary.purpose).toBeDefined();
      expect(summary.changes).toBeDefined();
      expect(summary.impact).toBeDefined();
      expect(Array.isArray(summary.review)).toBe(true);
      
      // Verify content
      expect(typeof summary.purpose).toBe('string');
      expect(summary.purpose.length).toBeGreaterThan(0);
      expect(typeof summary.changes).toBe('string');
      expect(summary.changes.length).toBeGreaterThan(0);
      expect(typeof summary.impact).toBe('string');
      expect(summary.impact.length).toBeGreaterThan(0);
      expect(summary.review.length).toBeGreaterThan(0);
    });

    it('should handle PRs with no changes', async () => {
      const prNumber = '456'; // Mock empty PR
      
      const summary = await provider.summarizePR(prNumber);
      
      expect(summary).toBeDefined();
      expect(summary.purpose).toBeDefined();
      expect(summary.changes).toBe('No changes detected');
      expect(summary.impact).toBe('No impact');
      expect(summary.review).toEqual(['No review needed']);
    });

    it('should handle invalid PR numbers', async () => {
      const invalidPR = 'invalid';
      
      await expect(provider.summarizePR(invalidPR))
        .rejects
        .toThrow('Invalid PR number format');
    });

    it('should handle missing API key', async () => {
      const config: GitProviderConfig = {
        type: 'git',
        workingDir: process.cwd()
      };
      const providerNoKey = new GitProvider(config);
      
      await expect(providerNoKey.summarizePR('123'))
        .rejects
        .toThrow('API key not configured');
    });

    it('should include complexity metrics in analysis', async () => {
      const prNumber = '789';
      
      const summary = await provider.summarizePR(prNumber);
      
      expect(summary.impact).toContain('complexity');
    });

    it('should provide review suggestions', async () => {
      const prNumber = '101';
      
      const summary = await provider.summarizePR(prNumber);
      
      expect(summary.review.length).toBeGreaterThan(0);
      expect(summary.review[0]).toMatch(/^[A-Z].*[.!?]$/); // Proper sentence format
    });
  });
});
