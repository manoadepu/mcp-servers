"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const provider_1 = require("../provider");
async function main() {
    // Get API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('Please set OPENROUTER_API_KEY environment variable');
        process.exit(1);
    }
    // Get PR number from command line
    const prNumber = process.argv[2];
    if (!prNumber) {
        console.error('Please provide PR number as argument');
        console.error('Usage: ts-node summarize-pr.ts <pr-number>');
        process.exit(1);
    }
    // Initialize provider
    const config = {
        type: 'git',
        workingDir: process.cwd(),
        llmConfig: {
            apiKey,
            model: 'anthropic/claude-2',
            temperature: 0.3,
            maxTokens: 1000
        }
    };
    const provider = new provider_1.GitProvider(config);
    try {
        console.log(`Analyzing PR #${prNumber}...`);
        const summary = await provider.summarizePR(prNumber);
        console.log('\nPR Summary:');
        console.log('===========');
        console.log(`\nPurpose:`);
        console.log(summary.purpose);
        console.log(`\nChanges:`);
        console.log(summary.changes);
        console.log(`\nImpact:`);
        console.log(summary.impact);
        console.log(`\nReview Focus:`);
        summary.review.forEach(point => console.log(`- ${point}`));
    }
    catch (error) {
        console.error('Error analyzing PR:', error);
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=summarize-pr.js.map