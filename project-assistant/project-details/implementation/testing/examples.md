# Testing Examples

## Setting Up Test Environment

### 1. Basic Test Setup
```typescript
// test/setup.ts
import { ComplexityAnalyzer } from '../src/core/analyzers/complexity';
import { AnalysisHandler } from '../src/handlers/analysis';
import { MockTransport } from './mocks/transport';

let analyzer: ComplexityAnalyzer;
let handler: AnalysisHandler;
let transport: MockTransport;

beforeEach(() => {
  analyzer = new ComplexityAnalyzer();
  handler = new AnalysisHandler();
  transport = new MockTransport();
});

afterEach(() => {
  jest.clearAllMocks();
});
```

## Unit Test Examples

### 1. Complexity Analyzer Tests
```typescript
// test/core/analyzers/complexity.test.ts
import { ComplexityAnalyzer } from '../../../src/core/analyzers/complexity';

describe('ComplexityAnalyzer', () => {
  let analyzer: ComplexityAnalyzer;

  beforeEach(() => {
    analyzer = new ComplexityAnalyzer({
      includeMaintainability: true,
      maxComplexity: 10,
      maxCognitive: 15,
    });
  });

  describe('analyze', () => {
    it('calculates cyclomatic complexity correctly', () => {
      const code = `
        function example(x: number, y: number): number {
          if (x > 0) {
            if (y > 0) {
              return x + y;
            }
            return x;
          }
          return y;
        }
      `;

      const result = analyzer.analyze(code);
      expect(result.cyclomatic).toBe(3);
    });

    it('calculates cognitive complexity correctly', () => {
      const code = `
        function example(arr: number[]): number {
          let sum = 0;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i] > 0) {
              sum += arr[i];
            }
          }
          return sum;
        }
      `;

      const result = analyzer.analyze(code);
      expect(result.cognitive).toBe(3);
    });
  });
});
```

### 2. Analysis Handler Tests
```typescript
// test/handlers/analysis.test.ts
import { AnalysisHandler } from '../../src/handlers/analysis';
import { FileSystemError } from '../../src/utils/errors';

describe('AnalysisHandler', () => {
  let handler: AnalysisHandler;

  beforeEach(() => {
    handler = new AnalysisHandler();
  });

  describe('analyzeComplexity', () => {
    it('handles file system errors', async () => {
      const nonexistentFile = 'nonexistent.ts';

      await expect(
        handler.analyzeComplexity(nonexistentFile)
      ).rejects.toThrow(FileSystemError);
    });

    it('generates correct summary for high complexity', async () => {
      // Mock file system
      jest.spyOn(fs, 'readFile').mockResolvedValue(`
        function complex(x: number): number {
          if (x > 0) {
            if (x > 10) {
              if (x > 20) {
                return 3;
              }
              return 2;
            }
            return 1;
          }
          return 0;
        }
      `);

      const result = await handler.analyzeComplexity('complex.ts');
      expect(result.metrics.summary.status).toBe('warn');
      expect(result.metrics.summary.issues).toHaveLength(2);
    });
  });
});
```

## Integration Test Examples

### 1. MCP Server Integration Tests
```typescript
// test/integration/server.test.ts
import { Server } from '@modelcontextprotocol/sdk/server';
import { MockTransport } from '../mocks/transport';

describe('MCP Server Integration', () => {
  let server: Server;
  let transport: MockTransport;

  beforeEach(async () => {
    transport = new MockTransport();
    server = new Server(
      { name: 'test-server', version: '1.0.0' },
      { capabilities: { resources: {}, tools: {} } }
    );
    await server.connect(transport);
  });

  afterEach(async () => {
    await server.close();
  });

  describe('analyze_complexity tool', () => {
    it('analyzes valid TypeScript file', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        method: 'call_tool',
        params: {
          name: 'analyze_complexity',
          arguments: {
            path: 'test/fixtures/valid.ts'
          }
        },
        id: 1
      });

      expect(response.error).toBeUndefined();
      expect(response.result).toHaveProperty('content');
      const result = JSON.parse(response.result.content[0].text);
      expect(result).toHaveProperty('metrics.complexity');
    });

    it('handles invalid file paths', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        method: 'call_tool',
        params: {
          name: 'analyze_complexity',
          arguments: {
            path: 'nonexistent.ts'
          }
        },
        id: 1
      });

      expect(response.result.isError).toBe(true);
      const error = JSON.parse(response.result.content[0].text);
      expect(error.code).toBe('FILE_SYSTEM_ERROR');
    });
  });
});
```

## End-to-End Test Examples

### 1. CLI Testing
```typescript
// test/e2e/cli.test.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('CLI End-to-End', () => {
  it('analyzes file and outputs results', async () => {
    const { stdout, stderr } = await execAsync(
      'node build/index.js analyze test/fixtures/example.ts'
    );

    expect(stderr).toBe('');
    const result = JSON.parse(stdout);
    expect(result).toHaveProperty('metrics');
    expect(result.metrics).toHaveProperty('complexity');
    expect(result.metrics).toHaveProperty('summary');
  });

  it('handles analysis errors gracefully', async () => {
    try {
      await execAsync('node build/index.js analyze nonexistent.ts');
    } catch (error) {
      expect(error.stderr).toContain('File not found');
    }
  });
});
```

## Performance Test Examples

### 1. Large File Analysis
```typescript
// test/performance/large-files.test.ts
import { generateLargeFile } from '../utils/generators';

describe('Performance Tests', () => {
  jest.setTimeout(30000); // 30 second timeout

  it('handles large files efficiently', async () => {
    const code = generateLargeFile(10000); // 10K lines
    const startTime = process.hrtime();
    const result = await handler.analyzeComplexity('large.ts');
    const [seconds, nanoseconds] = process.hrtime(startTime);
    
    // Performance assertions
    expect(seconds).toBeLessThan(5); // Should complete within 5 seconds
    expect(result).toBeDefined();
  });

  it('manages memory efficiently', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    await handler.analyzeComplexity('large.ts');
    const finalMemory = process.memoryUsage().heapUsed;
    
    // Memory usage should not increase dramatically
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
  });
});
```

## Test Utilities

### 1. Test Generators
```typescript
// test/utils/generators.ts
export function generateLargeFunction(lines: number): string {
  let code = 'function largeFunction() {\n';
  for (let i = 0; i < lines; i++) {
    code += `  const var${i} = ${i};\n`;
    if (i % 5 === 0) {
      code += `  if (var${i} > ${i-1}) {\n`;
      code += `    console.log(var${i});\n`;
      code += '  }\n';
    }
  }
  code += '}\n';
  return code;
}

export function generateMaliciousCode(): string {
  return `
    function malicious() {
      eval('alert("xss")');
      require('fs').readFile('/etc/passwd');
      process.exit(1);
    }
  `;
}
```

### 2. Test Fixtures
```typescript
// test/fixtures/index.ts
export const fixtures = {
  simpleFunction: `
    function add(a: number, b: number): number {
      return a + b;
    }
  `,
  
  complexFunction: `
    function processData(data: any[]): any[] {
      return data
        .filter(item => item !== null)
        .map(item => {
          if (typeof item === 'number') {
            return item * 2;
          } else if (typeof item === 'string') {
            return item.toUpperCase();
          }
          return item;
        })
        .reduce((acc, item) => {
          if (Array.isArray(item)) {
            return [...acc, ...item];
          }
          return [...acc, item];
        }, []);
    }
  `,
};
