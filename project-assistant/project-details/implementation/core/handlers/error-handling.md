# Error Handling System

## Overview
The Project Assistant implements a robust error handling system that provides detailed error information, maintains type safety, and ensures consistent error reporting across all components.

## Error Types

### 1. Base Error Response
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

### 2. Analysis Error
```typescript
export class AnalysisError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'ANALYSIS_ERROR',
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AnalysisError';
  }

  toResponse(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
```

#### Use Cases
- Code parsing failures
- Metric calculation errors
- Invalid analysis parameters
- Threshold validation errors

### 3. File System Error
```typescript
export class FileSystemError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'FILE_SYSTEM_ERROR',
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FileSystemError';
  }

  toResponse(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
```

#### Use Cases
- File not found
- Permission denied
- Invalid path
- Read/Write failures

### 4. Validation Error
```typescript
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'VALIDATION_ERROR',
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  toResponse(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
```

#### Use Cases
- Invalid input parameters
- Schema validation failures
- Configuration errors
- Format validation errors

## Error Handling Patterns

### 1. Try-Catch Pattern
```typescript
try {
  const code = await readFile(filePath, 'utf-8');
  const metrics = analyzer.analyze(code);
  return formatResult(metrics);
} catch (error) {
  if (error instanceof FileSystemError) {
    // Handle file system errors
    logger.error('File system error:', error);
    throw error;
  }
  if (error instanceof AnalysisError) {
    // Handle analysis errors
    logger.error('Analysis error:', error);
    throw error;
  }
  // Handle unknown errors
  throw new AnalysisError(
    'Unknown error during analysis',
    'UNKNOWN_ERROR',
    { originalError: error }
  );
}
```

### 2. Error Transformation
```typescript
private handleError(error: unknown): never {
  // Transform file system errors
  if (error instanceof Error && error.message.includes('ENOENT')) {
    throw new FileSystemError(`File not found: ${error.message}`);
  }

  // Transform analysis errors
  if (error instanceof Error) {
    throw new AnalysisError(error.message, 'ANALYSIS_ERROR', {
      name: error.name,
      stack: error.stack,
    });
  }

  // Handle unknown errors
  throw new AnalysisError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    { error }
  );
}
```

### 3. Error Response Formatting
```typescript
function formatErrorResponse(error: Error): ErrorResponse {
  if (error instanceof AnalysisError ||
      error instanceof FileSystemError ||
      error instanceof ValidationError) {
    return error.toResponse();
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unknown error occurred',
    details: {
      name: error.name,
      stack: error.stack,
    },
  };
}
```

## Best Practices

### 1. Error Creation
- Use descriptive error messages
- Include relevant context
- Maintain error hierarchy
- Add debugging details

```typescript
throw new AnalysisError(
  `Failed to analyze file: ${filePath}`,
  'ANALYSIS_ERROR',
  {
    file: filePath,
    line: lineNumber,
    context: surroundingCode,
  }
);
```

### 2. Error Handling
- Handle errors at appropriate levels
- Transform low-level errors
- Maintain error context
- Log appropriately

```typescript
try {
  await analyzeFile(path);
} catch (error) {
  logger.error('Analysis failed:', {
    error,
    file: path,
    timestamp: new Date(),
  });
  throw error;
}
```

### 3. Error Recovery
- Implement fallback behavior
- Clean up resources
- Maintain system state
- Provide user feedback

```typescript
async function analyzeWithFallback(path: string): Promise<AnalysisResult> {
  try {
    return await analyzeFile(path);
  } catch (error) {
    if (error instanceof FileSystemError) {
      return getDefaultAnalysis(path);
    }
    throw error;
  }
}
```

## Integration with MCP Server

### 1. Error Response Mapping
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const result = await handler.analyze(request.params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(formatErrorResponse(error)),
      }],
      isError: true,
    };
  }
});
```

### 2. Error Logging
```typescript
server.onerror = (error) => {
  logger.error('MCP Server error:', {
    error,
    timestamp: new Date(),
    context: 'server',
  });
};
```

## Future Improvements

### 1. Enhanced Error Types
- Add more specific error types
- Include error categories
- Add error severity levels
- Support error chaining

### 2. Error Reporting
- Implement error aggregation
- Add error analytics
- Generate error reports
- Track error patterns

### 3. Recovery Mechanisms
- Add retry mechanisms
- Implement circuit breakers
- Add fallback strategies
- Support graceful degradation
