#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { AnalysisHandler } from "./handlers/analysis.js";
import { AnalysisError, FileSystemError } from "./utils/errors.js";
import { gitTools } from "./providers/git/tools.js";

/**
 * Project Assistant MCP Server
 * Phase 1 MVP Implementation
 */

// Initialize handlers
const analysisHandler = new AnalysisHandler();

// Initialize server
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

// Resource handlers
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

// Read resource handler
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

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "analyze_complexity",
      description: "Analyze code complexity for files and directories",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path to the file or directory to analyze",
          },
          recursive: {
            type: "boolean",
            description: "Whether to analyze subdirectories (for directory analysis)",
            default: true
          },
          format: {
            type: "string",
            description: "Output format (detailed or summary)",
            enum: ["detailed", "summary"],
            default: "detailed"
          }
        },
        required: ["path"],
      },
    },
    ...gitTools
  ],
}));

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Handle Git analysis tools
  const gitTool = gitTools.find(tool => tool.name === name);
  if (gitTool) {
    try {
      const result = await gitTool.handler(args || {});
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: result.type === 'error'
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            }, null, 2),
          },
        ],
        isError: true
      };
    }
  }

  // Handle complexity analysis tool
  if (name === "analyze_complexity") {
    const { path, recursive, format } = args || {};
    if (!path) {
      throw new Error("Path is required");
    }

    try {
      const result = await analysisHandler.analyzeComplexity(String(path), {
        recursive: recursive !== false,
        format: (format as 'detailed' | 'summary') || 'detailed'
      });
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
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Project Assistant MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
