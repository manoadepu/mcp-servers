"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const complexity_js_1 = require("./core/analyzers/complexity.js");
const analysis_js_1 = require("./handlers/analysis.js");
async function testAnalyzer() {
    try {
        // Log current working directory
        console.log('Current working directory:', process.cwd());
        // Test direct analyzer
        console.log('\nTesting ComplexityAnalyzer directly:');
        const analyzer = new complexity_js_1.ComplexityAnalyzer({
            includeMaintainability: true,
            maxComplexity: 10,
            maxCognitive: 15,
        });
        const filePath = './src/core/analyzers/complexity.ts';
        console.log('Attempting to read file:', filePath);
        const code = await (0, promises_1.readFile)(filePath, 'utf-8');
        const metrics = analyzer.analyze(code);
        console.log('Direct Analysis Results:', JSON.stringify(metrics, null, 2));
        // Test through handler
        console.log('\nTesting AnalysisHandler:');
        const handler = new analysis_js_1.AnalysisHandler();
        const analysisPath = './src/core/analyzers/complexity.ts';
        console.log('Analyzing file:', analysisPath);
        const result = await handler.analyzeComplexity(analysisPath);
        console.log('Handler Analysis Results:', JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.error('Error during analysis:', error);
    }
}
testAnalyzer().catch(console.error);
//# sourceMappingURL=test-analyzer.js.map