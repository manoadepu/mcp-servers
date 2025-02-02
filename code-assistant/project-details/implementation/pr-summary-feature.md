# PR Summary Feature Implementation

## Overview
This document outlines the implementation plan for adding natural language PR summaries to the project-assistant tool. The feature will help users understand PRs quickly by providing clear, high-level insights about changes, purpose, and impact.

## Goals
1. Provide clear, natural language summaries of PRs
2. Surface important insights without diving into code
3. Highlight key areas needing review
4. Make technical analysis more accessible

## Technical Foundation
We build upon existing functionality:
- analyzePR method for metrics and analysis
- Complexity calculations
- Impact assessments
- Code change tracking

## Implementation Plan

### 1. LLM Integration
```
src/providers/git/llm/
├── client.ts        // OpenRouter API client
├── types.ts         // LLM-related types
└── prompts.ts       // Prompt templates
```

#### Types
```typescript
interface LLMConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface PRSummaryResult {
  purpose: string;     // What this PR does
  changes: string;     // Key changes made
  impact: string;      // Technical impact
  review: string[];    // Review focus points
}

interface LLMResponse {
  summary: string;
  purpose: string;
  technicalImpact: string;
  reviewFocus: string[];
  risks: string[];
}
```

### 2. Implementation Steps

#### Phase 1: OpenRouter Setup
1. Add OpenRouter dependencies
2. Create API client
3. Set up configuration
4. Add error handling
5. Implement rate limiting

#### Phase 2: PR Summary Enhancement
1. Extend GitProvider with summarizePR
2. Integrate with existing analyzePR
3. Add LLM processing
4. Implement caching

#### Phase 3: Context Management
1. Add context collection
2. Implement prompt templates
3. Add response formatting

### 3. Data Flow
1. Get PR analysis data from existing methods
2. Collect repository context
3. Format data for LLM
4. Process with OpenRouter
5. Format and return results

### 4. LLM Integration Details

#### Context Provision
```typescript
// Repository Context
- Project structure
- Tech stack
- Dependencies
- Architecture patterns

// PR Context
- Full diff content
- File relationships
- Import/export patterns
- API changes
```

#### Prompt Structure
```
System Context:
"You are analyzing a PR in a ${language} project using ${framework}.
Project follows ${architecture} patterns with ${testing} practices."

Analysis Request:
"Analyze this PR:
1. Code Changes:
   ${prDiff}

2. Existing Analysis:
   - Complexity: ${complexityMetrics}
   - Impact: ${impactScores}
   - Hotspots: ${hotspots}

3. Project Context:
   - Related Files: ${relatedFiles}
   - Dependencies: ${dependencies}
   - API Changes: ${apiChanges}

Provide:
1. Purpose and scope
2. Technical impact
3. Architecture implications
4. Review recommendations
5. Testing requirements"
```

### 5. Testing Strategy
1. Unit tests for:
   - OpenRouter client
   - PR summary logic
   - Context collection
   - Response formatting

2. Integration tests for:
   - End-to-end PR summary
   - LLM integration
   - Error handling
   - Rate limiting

3. Prompt testing:
   - Different PR types
   - Various complexities
   - Edge cases

### 6. Success Metrics
1. Accuracy of summaries
2. User comprehension
3. Time saved in PR review
4. Quality of insights

## Usage Example
```typescript
// Get PR summary
const summary = await gitProvider.summarizePR("123");

// Example output
{
  purpose: "Implements OAuth2 authentication flow with JWT tokens",
  changes: "Added auth middleware, token validation, and user session management",
  impact: "Affects authentication system and API security. Medium complexity increase.",
  review: [
    "Review token validation logic",
    "Check security middleware implementation",
    "Verify error handling"
  ]
}
```

## Future Enhancements
1. Custom prompt templates
2. More detailed security analysis
3. Integration with code review tools
4. Historical PR analysis
5. Team collaboration features

## Dependencies
1. OpenRouter API
2. Existing PR analysis
3. Git integration
4. Caching system

## Timeline
1. Initial Setup: 1-2 days
2. Core Implementation: 2-3 days
3. Context Enhancement: 2-3 days
4. Testing & Refinement: 2-3 days

Total: 7-11 days
