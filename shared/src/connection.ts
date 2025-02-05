import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import { DatabaseError } from './index';

export interface CodeAssistantQueries {
  getRepository(id: number): Promise<{
    id: number;
    name: string;
    path: string;
    created_at: string;
    updated_at: string;
  } | undefined>;

  getPullRequest(repoId: number, prNumber: number): Promise<{
    id: number;
    repository_id: number;
    pr_number: number;
    title: string;
    description: string;
    author: string;
    status: string;
    created_at: string;
    updated_at: string;
    complexity_score: number;
    risk_score: number;
  } | undefined>;
}

export interface ProjectManagementQueries {
  getProject(id: string): Promise<{
    id: string;
    name: string;
    description: string;
    status: string;
    start_date: string;
    target_date: string;
    created_at: string;
    updated_at: string;
  } | undefined>;

  getCurrentSprint(projectId: string): Promise<{
    id: string;
    project_id: string;
    name: string;
    start_date: string;
    end_date: string;
    goals: string;
    status: string;
  } | undefined>;

  getSprintMetrics(sprintId: string): Promise<{
    id: string;
    sprint_id: string;
    total_points: number;
    completed_points: number;
    remaining_points: number;
    velocity: number;
    burndown_data: string;
  } | undefined>;
}

export class DatabaseConnection implements CodeAssistantQueries, ProjectManagementQueries {
  private static instance: DatabaseConnection;
  private db: Database | null = null;
  private dbPath: string;

  private constructor() {
    // Default to a local database file in the data directory
    const defaultPath = join(__dirname, '../../../data/mcp-servers.db');
    this.dbPath = process.env.DB_PATH || defaultPath;
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (!this.db) {
      // Create database directory if it doesn't exist
      const dbDir = dirname(this.dbPath);
      try {
        mkdirSync(dbDir, { recursive: true });
      } catch (error: any) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
      }

      try {
        this.db = await open({
          filename: this.dbPath,
          driver: sqlite3.Database
        });
        await this.db.exec('PRAGMA foreign_keys = ON');
        console.log('Connected to SQLite database');
      } catch (error: any) {
        throw new DatabaseError('Failed to connect to database', error);
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
        this.db = null;
        console.log('Disconnected from SQLite database');
      } catch (error: any) {
        throw new DatabaseError('Failed to disconnect from database', error);
      }
    }
  }

  public async query<T extends Record<string, any>>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new DatabaseError('Database not connected');
    }
    try {
      const results = await this.db.all(sql, params);
      return results as T[];
    } catch (error: any) {
      throw new DatabaseError(`Query failed: ${error.message}`, error);
    }
  }

  public async run(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) {
      throw new DatabaseError('Database not connected');
    }
    try {
      await this.db.run(sql, params);
    } catch (error: any) {
      throw new DatabaseError(`Failed to execute SQL: ${error.message}`, error);
    }
  }

  public async get<T extends Record<string, any>>(sql: string, params: any[] = []): Promise<T | undefined> {
    if (!this.db) {
      throw new DatabaseError('Database not connected');
    }
    try {
      const result = await this.db.get(sql, params);
      return result as T | undefined;
    } catch (error: any) {
      throw new DatabaseError(`Failed to get record: ${error.message}`, error);
    }
  }

  // Code Assistant Methods
  public async getRepository(id: number) {
    return this.get<{
      id: number;
      name: string;
      path: string;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM repositories WHERE id = ?', [id]);
  }

  public async getPullRequest(repoId: number, prNumber: number) {
    return this.get<{
      id: number;
      repository_id: number;
      pr_number: number;
      title: string;
      description: string;
      author: string;
      status: string;
      created_at: string;
      updated_at: string;
      complexity_score: number;
      risk_score: number;
    }>('SELECT * FROM pull_requests WHERE repository_id = ? AND pr_number = ?', [repoId, prNumber]);
  }

  // Project Management Methods
  public async getProject(id: string) {
    return this.get<{
      id: string;
      name: string;
      description: string;
      status: string;
      start_date: string;
      target_date: string;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM projects WHERE id = ?', [id]);
  }

  public async getCurrentSprint(projectId: string) {
    return this.get<{
      id: string;
      project_id: string;
      name: string;
      start_date: string;
      end_date: string;
      goals: string;
      status: string;
    }>(`
      SELECT * FROM sprints 
      WHERE project_id = ? AND status = 'ACTIVE'
      ORDER BY start_date DESC
      LIMIT 1
    `, [projectId]);
  }

  public async getSprintMetrics(sprintId: string) {
    return this.get<{
      id: string;
      sprint_id: string;
      total_points: number;
      completed_points: number;
      remaining_points: number;
      velocity: number;
      burndown_data: string;
    }>('SELECT * FROM sprint_metrics WHERE sprint_id = ?', [sprintId]);
  }
}

export default DatabaseConnection.getInstance();
