// Error types for Project Management MCP server

export enum ValidationErrorType {
  INVALID_PROJECT_ID = 'INVALID_PROJECT_ID',
  INVALID_SPRINT_ID = 'INVALID_SPRINT_ID',
  INVALID_TASK_ID = 'INVALID_TASK_ID',
  INVALID_TEAM_ID = 'INVALID_TEAM_ID',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  INVALID_STATUS = 'INVALID_STATUS',
  INVALID_PRIORITY = 'INVALID_PRIORITY'
}

export enum DatabaseErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  DEADLOCK = 'DEADLOCK'
}

export enum IntegrationErrorType {
  JIRA_API_ERROR = 'JIRA_API_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  SYNC_ERROR = 'SYNC_ERROR'
}

export enum BusinessErrorType {
  SPRINT_ALREADY_STARTED = 'SPRINT_ALREADY_STARTED',
  SPRINT_ALREADY_COMPLETED = 'SPRINT_ALREADY_COMPLETED',
  INSUFFICIENT_CAPACITY = 'INSUFFICIENT_CAPACITY',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION'
}

export interface ErrorDetails {
  field?: string;
  reason?: string;
  suggestion?: string;
  context?: any;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: ErrorDetails;
  timestamp: string;
  requestId?: string;
}

export class ProjectManagementError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: ErrorDetails
  ) {
    super(message);
    this.name = 'ProjectManagementError';
  }

  public toResponse(requestId?: string): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString(),
      requestId
    };
  }
}

export class ValidationError extends ProjectManagementError {
  constructor(
    code: ValidationErrorType,
    message: string,
    details?: ErrorDetails
  ) {
    super(code, message, details);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends ProjectManagementError {
  constructor(
    code: DatabaseErrorType,
    message: string,
    details?: ErrorDetails
  ) {
    super(code, message, details);
    this.name = 'DatabaseError';
  }
}

export class IntegrationError extends ProjectManagementError {
  constructor(
    code: IntegrationErrorType,
    message: string,
    details?: ErrorDetails
  ) {
    super(code, message, details);
    this.name = 'IntegrationError';
  }
}

export class BusinessError extends ProjectManagementError {
  constructor(
    code: BusinessErrorType,
    message: string,
    details?: ErrorDetails
  ) {
    super(code, message, details);
    this.name = 'BusinessError';
  }
}
