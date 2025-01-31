#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const analysis_js_1 = require("./handlers/analysis.js");
const errors_js_1 = require("./utils/errors.js");
const tools_js_1 = require("./providers/git/tools.js");
/**
 * Project Assistant MCP Server
 * Phase 1 MVP Implementation
 */
// Initialize handlers
const analysisHandler = new analysis_js_1.AnalysisHandler();
// Initialize server
const server = new index_js_1.Server({
    name: "project-assistant",
    version: "0.1.0",
}, {
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Resource handlers
server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => ({
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
server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
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
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
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
        ...tools_js_1.gitTools
    ],
}));
// Tool execution handler
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    // Handle Git analysis tools
    const gitTool = tools_js_1.gitTools.find(tool => tool.name === name);
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
        }
        catch (error) {
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
                format: format || 'detailed'
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            if (error instanceof errors_js_1.AnalysisError || error instanceof errors_js_1.FileSystemError) {
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
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Project Assistant MCP server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map