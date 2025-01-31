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
    handler: (params: Record<string, any>) => Promise<{
        type: 'success' | 'error';
        data?: any;
        error?: string;
    }>;
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
export declare const gitTools: McpToolHandler[];
export {};
