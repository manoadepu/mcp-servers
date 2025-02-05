import { createHash } from 'crypto';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { DatabaseConnection } from './connection';

export class MigrationManager {
  private db: DatabaseConnection;
  private migrationsDir: string;

  constructor(migrationsDir: string) {
    this.db = DatabaseConnection.getInstance();
    this.migrationsDir = migrationsDir;
  }

  private async calculateChecksum(content: string): Promise<string> {
    return createHash('sha256').update(content).digest('hex');
  }

  private async getMigrationFiles(): Promise<string[]> {
    const files = await readdir(this.migrationsDir);
    return files
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));
  }

  private async getAppliedMigrations(): Promise<Map<string, string>> {
    const results = await this.db.query<{ name: string; checksum: string }>(
      'SELECT name, checksum FROM migrations ORDER BY id'
    );
    return new Map(results.map(r => [r.name, r.checksum]));
  }

  private async getCurrentBatch(): Promise<number> {
    const result = await this.db.get<{ batch: number }>(
      'SELECT MAX(batch) as batch FROM migrations'
    );
    return (result?.batch || 0) + 1;
  }

  public async validate(): Promise<void> {
    const appliedMigrations = await this.getAppliedMigrations();
    const files = await this.getMigrationFiles();

    for (const file of files) {
      const content = await readFile(join(this.migrationsDir, file), 'utf-8');
      const checksum = await this.calculateChecksum(content);
      const appliedChecksum = appliedMigrations.get(file);

      if (appliedChecksum && appliedChecksum !== checksum) {
        throw new Error(
          `Migration ${file} has been modified after being applied. ` +
          `Expected checksum: ${appliedChecksum}, actual: ${checksum}`
        );
      }
    }
  }

  public async up(): Promise<void> {
    await this.validate();

    const appliedMigrations = await this.getAppliedMigrations();
    const files = await this.getMigrationFiles();
    const batch = await this.getCurrentBatch();

    for (const file of files) {
      if (!appliedMigrations.has(file)) {
        console.log(`Applying migration: ${file}`);
        
        const content = await readFile(join(this.migrationsDir, file), 'utf-8');
        const [upMigration] = content.split('-- Down Migration');
        
        if (!upMigration) {
          throw new Error(`Invalid migration file ${file}: No up migration found`);
        }

        const checksum = await this.calculateChecksum(content);

        await this.db.run('BEGIN TRANSACTION');
        try {
          await this.db.run(upMigration);
          await this.db.run(
            'INSERT INTO migrations (name, batch, checksum) VALUES (?, ?, ?)',
            [file, batch, checksum]
          );
          await this.db.run('COMMIT');
          console.log(`Successfully applied migration: ${file}`);
        } catch (error) {
          await this.db.run('ROLLBACK');
          throw error;
        }
      }
    }
  }

  public async down(steps: number = 1): Promise<void> {
    const lastBatch = await this.db.get<{ batch: number }>(
      'SELECT MAX(batch) as batch FROM migrations'
    );

    if (!lastBatch?.batch) {
      console.log('No migrations to roll back');
      return;
    }

    const toRollback = await this.db.query<{ name: string }>(
      'SELECT name FROM migrations WHERE batch = ? ORDER BY id DESC LIMIT ?',
      [lastBatch.batch, steps]
    );

    for (const migration of toRollback) {
      console.log(`Rolling back migration: ${migration.name}`);
      
      const content = await readFile(
        join(this.migrationsDir, migration.name),
        'utf-8'
      );
      const [, downMigration] = content.split('-- Down Migration');
      
      if (!downMigration) {
        throw new Error(
          `Invalid migration file ${migration.name}: No down migration found`
        );
      }

      await this.db.run('BEGIN TRANSACTION');
      try {
        await this.db.run(downMigration);
        await this.db.run(
          'DELETE FROM migrations WHERE name = ?',
          [migration.name]
        );
        await this.db.run('COMMIT');
        console.log(`Successfully rolled back migration: ${migration.name}`);
      } catch (error) {
        await this.db.run('ROLLBACK');
        throw error;
      }
    }
  }

  public async status(): Promise<{
    applied: string[];
    pending: string[];
    modified: string[];
  }> {
    const appliedMigrations = await this.getAppliedMigrations();
    const files = await this.getMigrationFiles();
    const modified: string[] = [];
    const pending: string[] = [];

    for (const file of files) {
      const content = await readFile(join(this.migrationsDir, file), 'utf-8');
      const checksum = await this.calculateChecksum(content);
      const appliedChecksum = appliedMigrations.get(file);

      if (!appliedChecksum) {
        pending.push(file);
      } else if (appliedChecksum !== checksum) {
        modified.push(file);
      }
    }

    return {
      applied: Array.from(appliedMigrations.keys()),
      pending,
      modified
    };
  }
}

export default new MigrationManager(join(__dirname, '../database/migrations'));
