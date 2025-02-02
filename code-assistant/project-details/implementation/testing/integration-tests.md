# Integration Tests

## Overview
This document outlines the test cases and scripts for verifying the integration between the Project Assistant and MCP Inspector.

## Test Suite

### 1. Server Connection Tests

```typescript
// test/integration/server.test.ts
import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';

describe('MCP Server Integration', () => {
  let server: Server;
  let transport: StdioServerTransport;

  beforeEach(async () => {
    transport = new StdioServerTransport();
    server = new Server(
      { name: 'project-assistant', version: '0.1.0' },
      { capabilities: { resources: {}, tools: {} } }
    );
    await server.connect(transport);
  });

  afterEach(async () => {
    await server.close();
  });

  test('server starts successfully', () => {
    expect(server).toBeDefined();
    expect(server.isConnected()).toBe(true);
  });

  test('lists available tools', async () => {
    const tools = await server.listTools();
    expect(tools).toContainEqual(
      expect.objectContaining({
        name: 'analyze_complexity'
      })
    );
  });
});
```

### 2. Analysis Tool Tests

```typescript
// test/integration/analysis.test.ts
describe('Analysis Tool Integration', () => {
  describe('File Analysis', () => {
    test('analyzes simple file', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        method: 'call_tool',
        params: {
          name: 'analyze_complexity',
          arguments: {
            path: 'test/fixtures/simple.ts'
          }
        },
        id: 1
      });

      expect(response.error).toBeUndefined();
      const result = JSON.parse(response.result.content[0].text);
      expect(result.type).toBe('file');
      expect(result.metrics.complexity.cyclomatic).toBeLessThan(10);
      expect(result.metrics.summary.status).toBe('pass');
    });

    test('analyzes complex file', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        method: 'call_tool',
        params: {
          name: 'analyze_complexity',
          arguments: {
            path: 'src/core/analyzers/complexity.ts'
          }
        },
        id: 1
      });

      expect(response.error).toBeUndefined();
      const result = JSON.parse(response.result.content[0].text);
      expect(result.type).toBe('file');
      expect(result.metrics.complexity.cyclomatic).toBeGreaterThan(10);
      expect(result.metrics.summary.status).toBe('fail');
    });
  });

  describe('Directory Analysis', () => {
    test('analyzes directory non-recursively', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        method: 'call_tool',
        params: {
          name: 'analyze_complexity',
          arguments: {
            path: 'src/core/analyzers',
            recursive: false
          }
        },
        id: 1
      });

      expect(response.error).toBeUndefined();
      const result = JSON.parse(response.result.content[0].text);
      expect(result.type).toBe('directory');
      expect(result.metrics.totalFiles).toBeGreaterThan(0);
      expect(result.metrics.averageComplexity).toBeDefined();
      expect(result.metrics.worstFiles.length).toBeLessThanOrEqual(5);
      expect(result.children.every(child => !child.type || child.type === 'file')).toBe(true);
    });

    test('analyzes directory recursively', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        method: 'call_tool',
        params: {
          name: 'analyze_complexity',
          arguments: {
            path: 'src',
            recursive: true
          }
        },
        id: 1
      });

      expect(response.error).toBeUndefined();
      const result = JSON.parse(response.result.content[0].text);
      expect(result.type).toBe('directory');
      expect(result.children).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'directory' }),
          expect.objectContaining({ type: 'file' })
        ])
      );
      expect(result.metrics.worstFiles.length).toBeLessThanOrEqual(5);
    });

    test('handles empty directory', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        method: 'call_tool',
        params: {
          name: 'analyze_complexity',
          arguments: {
            path: 'test/fixtures/empty-dir',
            recursive: true
          }
        },
        id: 1
      });

      expect(response.error).toBeUndefined();
      const result = JSON.parse(response.result.content[0].text);
      expect(result.type).toBe('directory');
      expect(result.metrics.totalFiles).toBe(0);
      expect(result.metrics.worstFiles).toHaveLength(0);
      expect(result.metrics.summary.status).toBe('pass');
    });
  });
});
```

describe('Error Handling Integration', () => {
  describe('File Errors', () => {
    test('handles non-existent file', async () => {
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

    test('handles invalid file content', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        method: 'call_tool',
        params: {
          name: 'analyze_complexity',
          arguments: {
            path: 'test/fixtures/invalid.ts'
          }
        },
        id: 1
      });

      expect(response.result.isError).toBe(true);
      const error = JSON.parse(response.result.content[0].text);
      expect(error.code).toBe('ANALYSIS_ERROR');
    });

    test('handles unsupported file type', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        method: 'call_tool',
        params: {
          name: 'analyze_complexity',
          arguments: {
            path: 'test/fixtures/file.txt'
          }
        },
        id: 1
      });

      expect(response.result.isError).toBe(true);
      const error = JSON.parse(response.result.content[0].text);
      expect(error.code).toBe('INVALID_FILE_TYPE');
    });
  });

  describe('Directory Errors', () => {
    test('handles non-existent directory', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        method: 'call_tool',
        params: {
          name: 'analyze_complexity',
          arguments: {
            path: 'nonexistent-dir',
            recursive: true
          }
        },
        id: 1
      });

      expect(response.result.isError).toBe(true);
      const error = JSON.parse(response.result.content[0].text);
      expect(error.code).toBe('FILE_SYSTEM_ERROR');
    });

    test('handles permission denied', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        method: 'call_tool',
        params: {
          name: 'analyze_complexity',
          arguments: {
            path: '/root/protected-dir',
            recursive: true
          }
        },
        id: 1
      });

      expect(response.result.isError).toBe(true);
      const error = JSON.parse(response.result.content[0].text);
      expect(error.code).toBe('FILE_SYSTEM_ERROR');
      expect(error.message).toContain('permission denied');
    });
  });
});
```

## Manual Test Cases

### 1. Inspector Connection

1. Start Server:
```bash
cd project-assistant
node build/index.js
```

2. Start Inspector:
```bash
cd project-assistant
npx @modelcontextprotocol/inspector gui
```

3. Verify:
- Inspector opens at http://localhost:5173
- Can connect to server
- Tools are listed
- No connection errors

### 2. File Analysis

1. Simple File:
```bash
# Create test file
echo "function add(a: number, b: number): number { return a + b; }" > test.ts

# Analyze
npx @modelcontextprotocol/inspector --transport stdio --server "node build/index.js" call analyze_complexity --path test.ts
```

Expected:
- Low complexity scores
- Pass status

2. Complex File:
```bash
# Analyze complexity analyzer
npx @modelcontextprotocol/inspector --transport stdio --server "node build/index.js" call analyze_complexity --path src/core/analyzers/complexity.ts
```

Expected:
- High complexity scores
- Fail status
- Multiple issues listed

### 3. Error Cases

1. Missing File:
```bash
npx @modelcontextprotocol/inspector --transport stdio --server "node build/index.js" call analyze_complexity --path nonexistent.ts
```

Expected:
- FileSystemError
- Clear error message

2. Invalid File:
```bash
# Create invalid file
echo "function invalid {" > invalid.ts

# Analyze
npx @modelcontextprotocol/inspector --transport stdio --server "node build/index.js" call analyze_complexity --path invalid.ts
```

Expected:
- AnalysisError
- Syntax error message

## Test Results Documentation

### Recording Results

For each test run:
1. Date and time
2. Test environment details
3. Test cases executed
4. Pass/fail status
5. Error messages if any
6. Performance metrics

Example:
```json
{
  "testRun": {
    "date": "2025-01-30T19:45:00Z",
    "environment": {
      "nodeVersion": "v22.13.1",
      "os": "Windows 11",
      "projectVersion": "0.1.0"
    },
    "results": {
      "serverConnection": "pass",
      "simpleFileAnalysis": "pass",
      "complexFileAnalysis": "pass",
      "errorHandling": "pass"
    },
    "metrics": {
      "averageResponseTime": "120ms",
      "peakMemoryUsage": "156MB"
    }
  }
}
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Integration Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm run test:integration
```

## Troubleshooting Guide

### Common Issues

1. Connection Failures
- Check server is running
- Verify port availability
- Check network permissions

2. Analysis Errors
- Verify file paths
- Check file permissions
- Validate TypeScript syntax

3. Performance Issues
- Monitor memory usage
- Check file sizes
- Verify system resources

### Solutions

1. Reset Environment
```bash
# Kill processes
taskkill /F /IM node.exe

# Clear port
netstat -ano | findstr :5173
taskkill /PID [PID] /F

# Restart services
node build/index.js
```

2. Debug Mode
```bash
# Start server with debug logging
DEBUG=* node build/index.js

# Start inspector with debug logging
DEBUG=* npx @modelcontextprotocol/inspector gui
