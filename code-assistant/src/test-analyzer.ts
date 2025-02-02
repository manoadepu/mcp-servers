import { readFile } from 'fs/promises';
import { ComplexityAnalyzer } from './core/analyzers/complexity.js';
import { AnalysisHandler } from './handlers/analysis.js';

async function testAnalyzer() {
  try {
    // Log current working directory
    console.log('Current working directory:', process.cwd());
    
    // Test direct analyzer
    console.log('\nTesting ComplexityAnalyzer directly:');
    const analyzer = new ComplexityAnalyzer({
      includeMaintainability: true,
      maxComplexity: 10,
      maxCognitive: 15,
    });

    const filePath = './src/core/analyzers/complexity.ts';
    console.log('Attempting to read file:', filePath);
    const code = await readFile(filePath, 'utf-8');
    const metrics = analyzer.analyze(code);
    console.log('Direct Analysis Results:', JSON.stringify(metrics, null, 2));

    // Test through handler
    console.log('\nTesting AnalysisHandler:');
    const handler = new AnalysisHandler();
    const analysisPath = './src/core/analyzers/complexity.ts';
    console.log('Analyzing file:', analysisPath);
    const result = await handler.analyzeComplexity(analysisPath);
    console.log('Handler Analysis Results:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

testAnalyzer().catch(console.error);
