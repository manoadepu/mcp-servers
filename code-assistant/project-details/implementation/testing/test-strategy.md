# Testing Strategy

## Overview
This document outlines the testing strategy for the Project Assistant, covering unit tests, integration tests, and end-to-end testing approaches.

## Test Structure

### 1. Unit Tests

#### Complexity Analyzer Tests
```typescript
describe('ComplexityAnalyzer', () => {
  const analyzer = new ComplexityAnalyzer();

  describe('calculateCyclomaticComplexity', () => {
    test('should return 1 for empty function', () => {
      const code = `
        function empty() {
          return true;
        }
      `;
      expect(analyzer.analyze(code).cyclomatic).toBe(1);
    });

    test('should count if statements', () => {
      const code = `
        function conditional(x: number) {
          if (x > 0) {
            return 1;
          }
          return 0;
        }
      `;
      expect(analyzer.analyze(code).cyclomatic).toBe(2);
    });

    test('should count logical operators', () => {
      const code = `
        function complex(x: number, y: number) {
          return x > 0 && y > 0 || x < 0;
        }
      `;
      expect(analyzer.analyze(code).cyclomatic).toBe(4);
    });
  });

  describe('calculateCognitiveComplexity', () => {
    test('should count nesting levels', () => {
      const code = `
        function nested(x: number) {
          if (x > 0) {
            if (x > 10) {
              return 2;
            }
          }
          return 1;
        }
      `;
      expect(analyzer.analyze(code).cognitive).toBe(3);
    });
  });
});
```

#### Analysis Handler Tests
```typescript
describe('AnalysisHandler', () => {
  const handler = new AnalysisHandler();

  describe('analyzeComplexity', () => {
    test('should handle file not found', async () => {
      await expect(
        handler.analyzeComplexity('nonexistent.ts')
      ).rejects.toThrow(FileSystemError);
    });

    test('should analyze valid file', async () => {
      const result = await handler.analyzeComplexity('src/example.ts');
      expect(result).toHaveProperty('metrics.complexity');
      expect(result).toHaveProperty('metrics.summary');
    });
  });

  describe('generateSummary', () => {
    test('should identify high complexity', () => {
      const metrics = {
        cyclomatic: 20,
        cognitive: 25,
        maintainability: 45
      };
      const summary = handler.generateSummary(metrics);
      expect(summary.status).toBe('fail');
      expect(summary.issues).toHaveLength(3);
    });
  });
});
```

### 2. Integration Tests

#### MCP Server Integration
```typescript
describe('MCP Server Integration', () => {
  let server: Server;
  let transport: MockTransport;

  beforeEach(() => {
    transport = new MockTransport();
    server = new Server(
      { name: 'test-server', version: '1.0.0' },
      { capabilities: { resources: {}, tools: {} } }
    );
    server.connect(transport);
  });

  afterEach(async () => {
    await server.close();
  });

  test('should handle analyze_complexity tool', async () => {
    const response = await server.handleRequest({
      jsonrpc: '2.0',
      method: 'call_tool',
      params: {
        name: 'analyze_complexity',
        arguments: {
          path: 'test/fixtures/example.ts'
        }
      },
      id: 1
    });

    expect(response).toHaveProperty('result.content');
    expect(response.error).toBeUndefined();
  });

  test('should handle analysis resource', async () => {
    const response = await server.handleRequest({
      jsonrpc: '2.0',
      method: 'read_resource',
      params: {
        uri: 'analysis://complexity/test/fixtures/example.ts'
      },
      id: 1
    });

    expect(response).toHaveProperty('result.contents');
    expect(response.error).toBeUndefined();
  });
});
```

### 3. End-to-End Tests

#### CLI Testing
```typescript
describe('CLI End-to-End', () => {
  test('should analyze file from command line', async () => {
    const { stdout, stderr } = await exec(
      'node build/index.js analyze test/fixtures/example.ts'
    );
    
    expect(stderr).toBe('');
    expect(JSON.parse(stdout)).toHaveProperty('metrics');
  });

  test('should handle invalid file path', async () => {
    const { stderr } = await exec(
      'node build/index.js analyze nonexistent.ts'
    ).catch(e => e);
    
    expect(stderr).toContain('File not found');
  });
});
```

## Test Categories

### 1. Functionality Tests
- Core analysis algorithms
- File handling
- Error handling
- Configuration handling

### 2. Edge Cases
- Empty files
- Large files
- Invalid syntax
- Special characters
- Unicode content

### 3. Performance Tests
- Large codebase analysis
- Memory usage
- Response time
- Resource cleanup

### 4. Error Cases
- Invalid inputs
- System errors
- Resource limits
- Network issues

## Test Data

### 1. Test Fixtures
```typescript
// test/fixtures/simple.ts
function simple() {
  return true;
}

// test/fixtures/complex.ts
function complex(x: number, y: number) {
  if (x > 0) {
    if (y > 0) {
      return x * y;
    } else if (y < 0) {
      return x / Math.abs(y);
    }
  }
  return 0;
}

// test/fixtures/error.ts
function invalid {
  // Syntax error
  return
}
```

### 2. Mock Data
```typescript
const mockMetrics = {
  cyclomatic: 5,
  cognitive: 8,
  maintainability: 75,
};

const mockAnalysisResult = {
  filePath: 'test.ts',
  metrics: {
    complexity: mockMetrics,
    summary: {
      status: 'pass',
      issues: [],
    },
  },
};
```

## Test Environment

### 1. Setup
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};

// test/setup.ts
import { MockTransport } from './mocks/transport';
import { mockFs } from './mocks/fs';

beforeEach(() => {
  mockFs.reset();
});

afterEach(() => {
  jest.clearAllMocks();
});
```

### 2. Mocks
```typescript
// test/mocks/transport.ts
export class MockTransport implements Transport {
  public messages: any[] = [];

  async send(message: any): Promise<void> {
    this.messages.push(message);
  }

  async receive(): Promise<any> {
    return this.messages.shift();
  }
}

// test/mocks/fs.ts
export const mockFs = {
  files: new Map<string, string>(),
  reset() {
    this.files.clear();
  },
  addFile(path: string, content: string) {
    this.files.set(path, content);
  },
};
```

## CI/CD Integration

### 1. GitHub Actions
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

### 2. Test Reports
```typescript
// jest.config.js
module.exports = {
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports',
      outputName: 'junit.xml',
    }],
  ],
  coverageReporters: ['text', 'html'],
  collectCoverageFrom: ['src/**/*.ts'],
};
```

## Best Practices

### 1. Test Organization
- Group related tests
- Use descriptive names
- Maintain test independence
- Clean up after tests

### 2. Test Coverage
- Aim for high coverage
- Focus on critical paths
- Test edge cases
- Include error cases

### 3. Test Maintenance
- Keep tests simple
- Update with code changes
- Remove obsolete tests
- Document test purpose

## Future Improvements

### 1. Test Framework
- Add property-based testing
- Implement snapshot testing
- Add performance benchmarks
- Improve test isolation

### 2. Test Coverage
- Add more edge cases
- Expand integration tests
- Add stress tests
- Add security tests

### 3. Test Automation
- Automate test data generation
- Add visual regression tests
- Implement continuous testing
- Add load testing
