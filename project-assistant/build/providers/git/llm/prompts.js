"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROMPTS = void 0;
exports.generateSystemPrompt = generateSystemPrompt;
exports.generateAnalysisPrompt = generateAnalysisPrompt;
/**
 * Generate system prompt for PR analysis
 */
function generateSystemPrompt(context) {
    console.error('Generating system prompt with context:', {
        language: context.repository.language,
        framework: context.repository.framework,
        architecture: context.repository.architecture
    });
    return `You are analyzing a Pull Request in a ${context.repository.language} project 
using ${context.repository.framework}. The project follows ${context.repository.architecture} patterns.

Your task is to:
1. Understand the PR's purpose and scope
2. Identify key technical changes and their impact
3. Highlight important areas for code review
4. Provide clear, concise summaries for developers

Focus on providing actionable insights that help reviewers understand:
- What changed and why
- Technical impact and risks
- Key areas needing attention
- Testing considerations`;
}
/**
 * Generate analysis prompt for PR
 */
function generateAnalysisPrompt(context) {
    console.error('Generating analysis prompt with context:', {
        files: context.changes.files,
        dependencies: context.changes.dependencies,
        apiChanges: context.changes.apiChanges,
        metrics: {
            complexity: context.metrics.complexity,
            impact: context.metrics.impact
        }
    });
    return `Analyze this Pull Request:

Code Changes:
${context.changes.diff}

Modified Files:
${context.changes.files.join('\n')}

Dependency Changes:
${context.changes.dependencies.join('\n')}

API Changes:
${context.changes.apiChanges.join('\n')}

Technical Metrics:
- Complexity: ${context.metrics.complexity}
- Impact: ${context.metrics.impact}
- Hotspots: ${context.metrics.hotspots}

Provide a concise summary including:
1. The main purpose of this PR
2. Key technical changes made
3. Impact on the system
4. Specific areas that need careful review

Format your response as:
PURPOSE: [Brief description of PR purpose]
CHANGES: [Key technical changes]
IMPACT: [System impact and risks]
REVIEW: [Bulleted list of review focus points]`;
}
/**
 * Default prompt templates
 */
exports.DEFAULT_PROMPTS = {
    system: generateSystemPrompt,
    analysis: generateAnalysisPrompt
};
//# sourceMappingURL=prompts.js.map