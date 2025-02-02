/**
 * Custom error types for Project Assistant
 */
export interface ErrorResponse {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
export declare class AnalysisError extends Error {
    readonly code: string;
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, code?: string, details?: Record<string, unknown> | undefined);
    toResponse(): ErrorResponse;
}
export declare class FileSystemError extends Error {
    readonly code: string;
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, code?: string, details?: Record<string, unknown> | undefined);
    toResponse(): ErrorResponse;
}
export declare class ValidationError extends Error {
    readonly code: string;
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, code?: string, details?: Record<string, unknown> | undefined);
    toResponse(): ErrorResponse;
}
