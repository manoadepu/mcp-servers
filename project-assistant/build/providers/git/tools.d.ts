interface McpToolResponse {
    type: 'success' | 'error' | 'progress';
    data?: any;
    error?: string;
}
interface McpToolHandler {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, {
            type: string;
            description: string;
            optional?: boolean;
        }>;
        required: string[];
    };
    handler: (params: Record<string, any>) => Promise<McpToolResponse>;
}
/**
 * Analyze commit tool handler
 */
export declare const analyzeCommitTool: McpToolHandler;
/**
 * Analyze patterns tool handler
 */
export declare const analyzePatternsTools: McpToolHandler;
/**
 * Analyze PR tool handler
 */
export declare const analyzePRTool: McpToolHandler;
/**
 * Summarize PR tool handler
 */
export declare const summarizePRTool: McpToolHandler;
export declare const gitTools: McpToolHandler[];
export {};
