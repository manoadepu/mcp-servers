/**
 * Custom error types for Project Assistant
 */

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

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
