import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
export class DatabaseConnection {
    constructor() {
        this.db = null;
        this.dbPath = process.env.DB_PATH || '/app/data/mcp-servers.db';
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        if (!this.db) {
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database
            });
            console.log('Connected to SQLite database');
        }
    }
    async disconnect() {
        if (this.db) {
            await this.db.close();
            this.db = null;
            console.log('Disconnected from SQLite database');
        }
    }
    async query(sql, params = []) {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        return this.db.all(sql, params);
    }
    async run(sql, params = []) {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        await this.db.run(sql, params);
    }
    async get(sql, params = []) {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        return this.db.get(sql, params);
    }
    // Code Assistant specific methods
    async getRepository(id) {
        return this.get('SELECT * FROM repositories WHERE id = ?', [id]);
    }
    async getPullRequest(repoId, prNumber) {
        return this.get('SELECT * FROM pull_requests WHERE repository_id = ? AND pr_number = ?', [repoId, prNumber]);
    }
    // Project Management specific methods
    async getProject(id) {
        return this.get('SELECT * FROM projects WHERE id = ?', [id]);
    }
    async getCurrentSprint(projectId) {
        return this.get(`
      SELECT * FROM sprints 
      WHERE project_id = ? AND status = 'ACTIVE'
      ORDER BY start_date DESC
      LIMIT 1
    `, [projectId]);
    }
    async getSprintMetrics(sprintId) {
        return this.get('SELECT * FROM sprint_metrics WHERE sprint_id = ?', [sprintId]);
    }
    async getResourceMetrics(projectId) {
        return this.get(`
      SELECT * FROM resource_metrics 
      WHERE project_id = ?
      ORDER BY date DESC
      LIMIT 1
    `, [projectId]);
    }
}
//# sourceMappingURL=db.js.map