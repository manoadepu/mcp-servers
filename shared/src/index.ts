export { default as db } from './connection';
export { DatabaseConnection } from './connection';
export type { CodeAssistantQueries, ProjectManagementQueries } from './connection';

export { default as migrations } from './migrations';
export { MigrationManager } from './migrations';

// Export common types
export interface BaseRecord {
  id: string | number;
  created_at: string;
  updated_at: string;
}

// Common error types
export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'ConnectionError';
  }
}

export class QueryError extends DatabaseError {
  constructor(message: string, public query: string, public params: any[], cause?: Error) {
    super(message, cause);
    this.name = 'QueryError';
  }
}

export class MigrationError extends DatabaseError {
  constructor(message: string, public migrationName: string, cause?: Error) {
    super(message, cause);
    this.name = 'MigrationError';
  }
}

// Common utility types
export type DateString = string; // ISO 8601 format
export type JSONString = string; // Stringified JSON
export type UUID = string;       // UUID v4

// Common status types
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Common interfaces
export interface Timestamps {
  created_at: DateString;
  updated_at: DateString;
}

export interface WithId<T extends string | number = string> {
  id: T;
}

export interface BaseEntity extends WithId, Timestamps {}

// Re-export database schema paths for use in Docker setup
export const SCHEMA_PATHS = {
  CODE_ASSISTANT: '/app/schema/code-assistant.sql',
  PROJECT_MANAGEMENT: '/app/schema/project-management.sql',
  INIT: '/app/schema/init.sql'
} as const;

// Re-export migration paths
export const MIGRATION_PATHS = {
  DIR: '/app/database/migrations',
  INITIAL: '/app/database/migrations/20250301000000_create_migrations_table.sql'
} as const;
