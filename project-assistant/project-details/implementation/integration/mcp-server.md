# MCP Server Integration

## Overview
The Project Assistant integrates with the Model Context Protocol (MCP) to expose code analysis capabilities through a standardized interface. This document details how our analysis functionality is made available through MCP resources and tools.

## Server Implementation

### Basic Setup
```typescript
const server = new Server(
  {
    name: "project-assistant",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);
```

## Resources

### 1. Analysis Resources
```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "analysis://complexity",
      name: "Code Complexity Analysis",
      mimeType: "application/json",
      description: "Analyzes code complexity metrics",
    },
  ],
}));
```

### 2. Resource Handler
```typescript
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  if (url.protocol !== "analysis:") {
    throw new Error(`Unsupported protocol: ${url.protocol}`);
  }

  const path = decodeURIComponent(url.pathname).replace(/^\//, "");
  const result = await analysisHandler.analyzeComplexity(path);

  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: "application/json",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
});
```

## Tools

### 1. Tool Registration
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "analyze_complexity",
      description: "Analyze code complexity",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path to the file to analyze",
          },
        },
        required: ["path"],
      },
    },
  ],
}));
```

### 2. Tool Handler
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "analyze_complexity") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const path = String(request.params.arguments?.path);
  if (!path) {
    throw new Error("Path is required");
  }

  try {
    const result = await analysisHandler.analyzeComplexity(path);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof AnalysisError || error instanceof FileSystemError) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(error.toResponse(), null, 2),
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
});
```

## Transport Configuration

### Stdio Transport
```typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Project Assistant MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```

## Response Formats

### 1. Success Response
```typescript
{
  content: [
    {
      type: "text",
      text: JSON.stringify({
        filePath: "src/example.ts",
        metrics: {
          complexity: {
            cyclomatic: 5,
            cognitive: 8,
            maintainability: 85
          },
          summary: {
            status: "pass",
            issues: []
          }
        }
      })
    }
  ]
}
```

### 2. Error Response
```typescript
{
  content: [
    {
      type: "text",
      text: JSON.stringify({
        code: "ANALYSIS_ERROR",
        message: "Failed to analyze file",
        details: {
          file: "src/example.ts",
          error: "Parse error"
        }
      })
    }
  ],
  isError: true
}
```

## Usage Examples

### 1. Using Resources
```bash
# Get complexity analysis via resource
mcp-inspector access analysis://complexity/src/example.ts
```

### 2. Using Tools
```bash
# Run complexity analysis via tool
mcp-inspector call analyze_complexity --path src/example.ts
```

## Best Practices

### 1. Error Handling
- Use custom error types
- Provide detailed error messages
- Include context in errors
- Format errors consistently

### 2. Response Formatting
- Use consistent JSON structure
- Include all relevant metadata
- Format output for readability
- Validate response format

### 3. Resource Management
- Clean up resources properly
- Handle connection errors
- Implement timeouts
- Monitor server health

## Future Improvements

### 1. Enhanced Tools
- Batch analysis support
- Directory analysis
- Custom configuration
- Analysis profiles

### 2. Additional Resources
- Historical analysis data
- Trend information
- Project statistics
- Team metrics

### 3. Performance
- Response caching
- Incremental analysis
- Parallel processing
- Resource pooling

### 4. Integration
- IDE plugins
- CI/CD integration
- Dashboard integration
- Reporting tools
