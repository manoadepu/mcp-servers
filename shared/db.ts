import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: Database | null = null;
  private dbPath: string;

  private constructor() {
    this.dbPath = process.env.DB_PATH || '/app/data/mcp-servers.db';
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (!this.db) {
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });
      console.log('Connected to SQLite database');
    }
  }

  public async disconnect(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('Disconnected from SQLite database');
    }
  }

  public async query<T extends Record<string, any>>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    const results = await this.db.all(sql, params);
    return results as T[];
  }

  public async run(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    await this.db.run(sql, params);
  }

  public async get<T extends Record<string, any>>(sql: string, params: any[] = []): Promise<T | undefined> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    const result = await this.db.get(sql, params);
    return result as T | undefined;
  }

  // Code Assistant specific methods
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

  // Project Management specific methods
  public async getProject(id: number) {
    return this.get<{
      id: number;
      name: string;
      description: string;
      status: string;
      start_date: string;
      target_date: string;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM projects WHERE id = ?', [id]);
  }

  public async getCurrentSprint(projectId: number) {
    return this.get<{
      id: number;
      project_id: number;
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

  public async getSprintMetrics(sprintId: number) {
    return this.get<{
      id: number;
      sprint_id: number;
      total_points: number;
      completed_points: number;
      remaining_points: number;
      velocity: number;
      burndown_data: string;
      completion_forecast: string;
    }>('SELECT * FROM sprint_metrics WHERE sprint_id = ?', [sprintId]);
  }

  public async getResourceMetrics(projectId: number) {
    return this.get<{
      id: number;
      project_id: number;
      date: string;
      utilization: number;
      availability: number;
      skills_data: string;
      forecast_data: string;
    }>(`
      SELECT * FROM resource_metrics 
      WHERE project_id = ?
      ORDER BY date DESC
      LIMIT 1
    `, [projectId]);
  }
}
