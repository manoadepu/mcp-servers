# Test Cases

## Core Analysis Test Cases

### 1. Cyclomatic Complexity

#### Basic Control Structures
```typescript
// Test Case: Empty Function
test('Empty function should have complexity of 1', () => {
  const code = `
    function empty() {
      return true;
    }
  `;
  // Expected: complexity = 1
});

// Test Case: Single If Statement
test('Single if statement', () => {
  const code = `
    function singleIf(x: number) {
      if (x > 0) {
        return true;
      }
      return false;
    }
  `;
  // Expected: complexity = 2
});
```

#### Compound Conditions
```typescript
// Test Case: Multiple Logical Operators
test('Multiple logical operators', () => {
  const code = `
    function compound(x: number, y: number) {
      return x > 0 && y > 0 || x < 0 && y < 0;
    }
  `;
  // Expected: complexity = 5 (1 base + 4 operators)
});

// Test Case: Nested Conditions
test('Nested if statements with logical operators', () => {
  const code = `
    function nested(x: number, y: number) {
      if (x > 0) {
        if (y > 0 && x > y) {
          return true;
        }
      }
      return false;
    }
  `;
  // Expected: complexity = 4
});
```

### 2. Cognitive Complexity

#### Nesting Levels
```typescript
// Test Case: Deep Nesting
test('Deeply nested control structures', () => {
  const code = `
    function deepNest(x: number) {
      if (x > 0) {
        for (let i = 0; i < x; i++) {
          if (i % 2 === 0) {
            while (x > i) {
              x--;
            }
          }
        }
      }
      return x;
    }
  `;
  // Expected: cognitive complexity reflects nesting depth
});

// Test Case: Multiple Branches
test('Multiple conditional branches', () => {
  const code = `
    function branches(x: number) {
      if (x > 0) {
        return 1;
      } else if (x < 0) {
        return -1;
      } else if (x === 0) {
        return 0;
      }
      return null;
    }
  `;
  // Expected: cognitive complexity accounts for branching
});
```

### 3. Maintainability Index

#### Code Size Impact
```typescript
// Test Case: Large Function
test('Large function with many lines', () => {
  const code = generateLargeFunction(100); // 100 lines
  // Expected: lower maintainability score
});

// Test Case: Concise Function
test('Small, focused function', () => {
  const code = `
    function add(a: number, b: number) {
      return a + b;
    }
  `;
  // Expected: higher maintainability score
});
```

## Error Handling Test Cases

### 1. File System Errors

#### File Access
```typescript
// Test Case: File Not Found
test('Non-existent file', async () => {
  await expect(
    handler.analyzeComplexity('nonexistent.ts')
  ).rejects.toThrow(FileSystemError);
});

// Test Case: Permission Denied
test('File without read permission', async () => {
  // Setup: Create file with restricted permissions
  await expect(
    handler.analyzeComplexity('restricted.ts')
  ).rejects.toThrow(FileSystemError);
});
```

### 2. Analysis Errors

#### Invalid Code
```typescript
// Test Case: Syntax Error
test('File with syntax error', async () => {
  const code = `
    function invalid {
      return
    }
  `;
  // Expected: appropriate error handling
});

// Test Case: Encoding Issues
test('File with invalid encoding', async () => {
  // Setup: Create file with invalid UTF-8
  // Expected: appropriate error handling
});
```

## Integration Test Cases

### 1. MCP Server Integration

#### Resource Access
```typescript
// Test Case: Valid Resource Request
test('Access complexity analysis resource', async () => {
  const response = await server.handleRequest({
    method: 'read_resource',
    params: {
      uri: 'analysis://complexity/valid.ts'
    }
  });
  // Expected: valid analysis result
});

// Test Case: Invalid Resource
test('Access invalid resource', async () => {
  const response = await server.handleRequest({
    method: 'read_resource',
    params: {
      uri: 'invalid://resource'
    }
  });
  // Expected: appropriate error response
});
```

#### Tool Execution
```typescript
// Test Case: Valid Tool Request
test('Execute complexity analysis tool', async () => {
  const response = await server.handleRequest({
    method: 'call_tool',
    params: {
      name: 'analyze_complexity',
      arguments: {
        path: 'valid.ts'
      }
    }
  });
  // Expected: successful tool execution
});

// Test Case: Invalid Tool
test('Execute unknown tool', async () => {
  const response = await server.handleRequest({
    method: 'call_tool',
    params: {
      name: 'unknown_tool'
    }
  });
  // Expected: appropriate error response
});
```

## Edge Cases

### 1. Code Patterns

#### Special Syntax
```typescript
// Test Case: Generator Functions
test('Generator function complexity', () => {
  const code = `
    function* generator() {
      yield 1;
      yield 2;
      yield 3;
    }
  `;
  // Expected: correct complexity calculation
});

// Test Case: Async/Await
test('Async function complexity', () => {
  const code = `
    async function fetcher() {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        return null;
      }
    }
  `;
  // Expected: correct complexity calculation
});
```

### 2. File Characteristics

#### Content Types
```typescript
// Test Case: Mixed Content
test('File with mixed code and comments', () => {
  const code = `
    // Complex function with detailed comments
    /* Multi-line
       comment block */
    function mixed() {
      // Nested logic
      if (condition) {
        // More comments
        return true;
      }
    }
  `;
  // Expected: comments don't affect complexity
});

// Test Case: Unicode Content
test('File with unicode characters', () => {
  const code = `
    function unicode() {
      const greeting = "こんにちは";
      if (greeting.length > 0) {
        return true;
      }
    }
  `;
  // Expected: correct handling of unicode
});
```

## Performance Test Cases

### 1. Large Files

#### Size Handling
```typescript
// Test Case: Very Large File
test('Analysis of large file', async () => {
  const code = generateLargeFile(10000); // 10K lines
  // Expected: completes within timeout
  // Expected: memory usage within limits
});

// Test Case: Many Small Files
test('Batch analysis of many files', async () => {
  const files = generateManyFiles(1000); // 1K files
  // Expected: efficient batch processing
});
```

### 2. Resource Usage

#### Memory Management
```typescript
// Test Case: Memory Cleanup
test('Memory cleanup after analysis', async () => {
  const initialMemory = process.memoryUsage();
  await analyzeMultipleFiles(100);
  const finalMemory = process.memoryUsage();
  // Expected: no significant memory leak
});

// Test Case: Concurrent Analysis
test('Concurrent file analysis', async () => {
  const promises = files.map(f => handler.analyzeComplexity(f));
  await Promise.all(promises);
  // Expected: efficient concurrent processing
});
```

## Security Test Cases

### 1. Input Validation

#### Path Traversal
```typescript
// Test Case: Directory Traversal Attempt
test('Path traversal prevention', async () => {
  await expect(
    handler.analyzeComplexity('../../../etc/passwd')
  ).rejects.toThrow();
});

// Test Case: Malicious File Content
test('Malicious code handling', async () => {
  const code = generateMaliciousCode();
  // Expected: safe handling of malicious content
});
```

### 2. Resource Limits

#### System Protection
```typescript
// Test Case: Resource Exhaustion
test('Handle excessive complexity', async () => {
  const code = generateHighComplexityCode();
  // Expected: appropriate timeout/limit handling
});

// Test Case: Concurrent Request Limits
test('Handle many concurrent requests', async () => {
  const requests = generateManyRequests(100);
  // Expected: appropriate request throttling
});
