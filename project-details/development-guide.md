# MCP Servers Development Guide

## Development Principles

### 1. Server Architecture
- Each MCP server should focus on a specific domain
- Follow single responsibility principle
- Implement clear interfaces
- Use dependency injection
- Maintain loose coupling between components

### 2. Code Organization
```
my-server/
├── src/
│   ├── core/              # Core server functionality
│   │   ├── providers/     # Provider implementations
│   │   ├── handlers/      # Request handlers
│   │   └── types/         # Type definitions
│   ├── tools/             # Tool implementations
│   │   ├── definitions/   # Tool definitions
│   │   └── handlers/      # Tool handlers
│   ├── resources/         # Resource implementations
│   │   ├── definitions/   # Resource definitions
│   │   └── handlers/      # Resource handlers
│   └── utils/             # Utility functions
├── test/
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
└── project-details/      # Server-specific documentation
```

### 3. Coding Standards

#### TypeScript Best Practices
```typescript
// Use explicit types
interface ConfigOptions {
  port: number;
  host: string;
  timeout: number;
}

// Use type guards
function isConfigValid(config: unknown): config is ConfigOptions {
  return (
    typeof config === 'object' &&
    config !== null &&
    'port' in config &&
    'host' in config &&
    'timeout' in config
  );
}

// Use async/await consistently
async function handleRequest(req: Request): Promise<Response> {
  try {
    const data = await processRequest(req);
    return createResponse(data);
  } catch (error) {
    handleError(error);
  }
}
```

#### Error Handling
```typescript
// Define custom errors
class MCPError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

// Use error factories
function createError(type: string, message: string): MCPError {
  return new MCPError(type, message);
}

// Handle errors appropriately
try {
  await processRequest();
} catch (error) {
  if (error instanceof MCPError) {
    // Handle known errors
    handleMCPError(error);
  } else {
    // Handle unknown errors
    handleUnknownError(error);
  }
}
```

## Implementation Guidelines

### 1. Creating New Tools

```typescript
// Tool definition
interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
}

// Tool implementation
class MyTool implements ToolHandler {
  async execute(args: any): Promise<ToolResult> {
    // Validate arguments
    this.validateArgs(args);
    
    // Execute tool logic
    const result = await this.processArgs(args);
    
    // Return results
    return {
      status: 'success',
      data: result
    };
  }
}

// Tool registration
server.registerTool('my-tool', new MyTool());
```

### 2. Creating New Resources

```typescript
// Resource definition
interface Resource {
  uri: string;
  type: string;
  content: any;
}

// Resource handler
class MyResourceHandler implements ResourceHandler {
  async getResource(uri: string): Promise<Resource> {
    // Validate URI
    this.validateUri(uri);
    
    // Get resource
    const content = await this.fetchContent(uri);
    
    return {
      uri,
      type: 'my-resource',
      content
    };
  }
}

// Resource registration
server.registerResource('my-resource', new MyResourceHandler());
```

### 3. Adding Event Handlers

```typescript
// Event definition
interface ServerEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

// Event handler
class EventHandler {
  async handleEvent(event: ServerEvent): Promise<void> {
    switch (event.type) {
      case 'resource.updated':
        await this.handleResourceUpdate(event.payload);
        break;
      case 'tool.executed':
        await this.handleToolExecution(event.payload);
        break;
    }
  }
}

// Event registration
server.on('resource.updated', handler.handleEvent.bind(handler));
```

## Testing Guidelines

### 1. Unit Testing

```typescript
// Tool test
describe('MyTool', () => {
  let tool: MyTool;
  
  beforeEach(() => {
    tool = new MyTool();
  });
  
  it('should process valid arguments', async () => {
    const args = { param: 'value' };
    const result = await tool.execute(args);
    expect(result.status).toBe('success');
  });
  
  it('should validate arguments', async () => {
    const args = { invalid: true };
    await expect(tool.execute(args)).rejects.toThrow();
  });
});
```

### 2. Integration Testing

```typescript
// Server integration test
describe('Server Integration', () => {
  let server: MCPServer;
  
  beforeAll(async () => {
    server = await createTestServer();
  });
  
  afterAll(async () => {
    await server.close();
  });
  
  it('should handle tool execution', async () => {
    const request = createToolRequest('my-tool', { param: 'value' });
    const response = await server.handleRequest(request);
    expect(response.status).toBe('success');
  });
});
```

### 3. Performance Testing

```typescript
// Performance test
describe('Performance', () => {
  it('should handle concurrent requests', async () => {
    const startTime = Date.now();
    const requests = Array(100).fill(null).map(() => 
      server.handleRequest(createTestRequest())
    );
    
    await Promise.all(requests);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(5000); // 5 seconds
  });
});
```

## Documentation Guidelines

### 1. Code Documentation
```typescript
/**
 * Processes a tool request with the given arguments
 * @param args - Tool arguments following the input schema
 * @returns Tool execution result
 * @throws {ValidationError} If arguments are invalid
 * @throws {ExecutionError} If tool execution fails
 */
async function processTool(args: ToolArgs): Promise<ToolResult> {
  // Implementation
}
```

### 2. API Documentation
```typescript
/**
 * @api {post} /tools/:name Execute Tool
 * @apiName ExecuteTool
 * @apiGroup Tools
 * @apiVersion 1.0.0
 *
 * @apiParam {String} name Tool name
 * @apiParam {Object} args Tool arguments
 *
 * @apiSuccess {String} status Execution status
 * @apiSuccess {Object} data Result data
 *
 * @apiError {String} code Error code
 * @apiError {String} message Error message
 */
```

### 3. README Documentation
```markdown
# My MCP Server

## Overview
Brief description of server purpose and capabilities

## Features
- Feature 1: Description
- Feature 2: Description

## Usage
Example usage code or commands

## Configuration
Available configuration options

## Development
Steps for local development
```

## Deployment Guidelines

### 1. Environment Configuration
```env
# Server Configuration
SERVER_PORT=3000
SERVER_HOST=localhost
LOG_LEVEL=info

# Feature Flags
ENABLE_CACHE=true
ENABLE_METRICS=true

# Security
AUTH_SECRET=your-secret
RATE_LIMIT=100
```

### 2. Docker Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Health Checks
```typescript
// Health check implementation
async function healthCheck(): Promise<HealthStatus> {
  return {
    status: 'healthy',
    timestamp: new Date(),
    checks: {
      database: await checkDatabase(),
      cache: await checkCache(),
      dependencies: await checkDependencies()
    }
  };
}
```

## Maintenance Guidelines

### 1. Logging
```typescript
// Structured logging
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    json()
  )
});

logger.info('Tool executed', {
  tool: 'my-tool',
  duration: 123,
  status: 'success'
});
```

### 2. Monitoring
```typescript
// Metrics collection
const metrics = {
  requests: new Counter('requests_total'),
  duration: new Histogram('request_duration_ms'),
  errors: new Counter('errors_total')
};

async function trackRequest(fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    metrics.requests.inc();
  } catch (error) {
    metrics.errors.inc();
    throw error;
  } finally {
    metrics.duration.observe(Date.now() - start);
  }
}
```

### 3. Error Tracking
```typescript
// Error tracking setup
const errorTracker = createErrorTracker({
  dsn: process.env.ERROR_TRACKING_DSN,
  environment: process.env.NODE_ENV
});

// Error tracking middleware
async function errorTracking(
  error: Error,
  request: Request,
  response: Response
): Promise<void> {
  await errorTracker.captureException(error, {
    extra: {
      requestId: request.id,
      path: request.path
    }
  });
}
