import { db } from '../index';
import { execSync } from 'child_process';
import { join } from 'path';
import { readFileSync } from 'fs';

// Use a local test database file
const dbPath = join(__dirname, '../../../data/test.db');
process.env.DB_PATH = dbPath;

// Global setup - runs once before all tests
export default async function globalSetup() {
  try {
    // Connect to test database
    await db.connect();

    // Initialize schema
    await db.run('PRAGMA foreign_keys = ON');
    await db.run('PRAGMA journal_mode = WAL');
    await db.run('PRAGMA synchronous = NORMAL');
    
    // Start transaction
    await db.run('BEGIN TRANSACTION');
    
    // Drop existing tables if they exist
    await db.run('DROP TABLE IF EXISTS task_dependencies');
    await db.run('DROP TABLE IF EXISTS task_labels');
    await db.run('DROP TABLE IF EXISTS tasks');
    await db.run('DROP TABLE IF EXISTS sprint_metrics');
    await db.run('DROP TABLE IF EXISTS sprints');
    await db.run('DROP TABLE IF EXISTS team_members');
    await db.run('DROP TABLE IF EXISTS teams');
    await db.run('DROP TABLE IF EXISTS projects');
    
    // Create tables
    await db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK(status IN ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED')),
        start_date TEXT NOT NULL,
        target_date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        skills JSON NOT NULL,
        availability INTEGER NOT NULL DEFAULT 100,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS sprints (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        goals JSON,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS sprint_metrics (
        id TEXT PRIMARY KEY,
        sprint_id TEXT NOT NULL,
        total_points INTEGER NOT NULL DEFAULT 0,
        completed_points INTEGER NOT NULL DEFAULT 0,
        remaining_points INTEGER NOT NULL DEFAULT 0,
        velocity REAL NOT NULL DEFAULT 0,
        burndown_data JSON,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sprint_id) REFERENCES sprints(id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        sprint_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE')),
        priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        assignee_id TEXT,
        story_points INTEGER,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sprint_id) REFERENCES sprints(id),
        FOREIGN KEY (assignee_id) REFERENCES team_members(id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        depends_on_task_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS task_labels (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id)
      )
    `);

    // Insert test data from migration files
    const projectData = readFileSync(join(__dirname, '../../database/migrations/20250301000002_insert_comprehensive_test_data.sql'), 'utf-8');
    await db.run(projectData);

    const taskData = readFileSync(join(__dirname, '../../database/migrations/20250301000003_insert_task_data.sql'), 'utf-8');
    await db.run(taskData);

    // Commit transaction
    await db.run('COMMIT');

  } catch (error) {
    console.error('Setup error:', error);
    await db.run('ROLLBACK').catch(() => {});
    throw error;
  }
}

// Global teardown - runs once after all tests
export async function globalTeardown() {
  try {
    // Clean up test data
    await db.run('BEGIN TRANSACTION');
    await db.run('DROP TABLE IF EXISTS task_dependencies');
    await db.run('DROP TABLE IF EXISTS task_labels');
    await db.run('DROP TABLE IF EXISTS tasks');
    await db.run('DROP TABLE IF EXISTS sprint_metrics');
    await db.run('DROP TABLE IF EXISTS sprints');
    await db.run('DROP TABLE IF EXISTS team_members');
    await db.run('DROP TABLE IF EXISTS teams');
    await db.run('DROP TABLE IF EXISTS projects');
    await db.run('COMMIT');
  } catch (error) {
    console.error('Teardown error:', error);
    await db.run('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await db.disconnect();
  }
}

// Before each test
export async function beforeEach() {
  await db.connect();
}

// After each test
export async function afterEach() {
  await db.disconnect();
}
