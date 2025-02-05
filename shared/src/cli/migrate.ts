#!/usr/bin/env node
import { program } from 'commander';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import migrations from '../migrations';
import db from '../connection';

interface DownOptions {
  steps: string;
}

program
  .name('migrate')
  .description('Database migration management tool');

program
  .command('status')
  .description('Show migration status')
  .action(async () => {
    try {
      await db.connect();
      const status = await migrations.status();
      
      console.log('\nMigration Status:');
      console.log('================\n');
      
      console.log('Applied Migrations:');
      status.applied.forEach(m => console.log(`  ✓ ${m}`));
      
      if (status.pending.length > 0) {
        console.log('\nPending Migrations:');
        status.pending.forEach(m => console.log(`  • ${m}`));
      }
      
      if (status.modified.length > 0) {
        console.log('\nModified Migrations (WARNING):');
        status.modified.forEach(m => console.log(`  ! ${m}`));
      }
      
      console.log('');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unknown error occurred');
      }
      process.exit(1);
    } finally {
      await db.disconnect();
    }
  });

program
  .command('up')
  .description('Apply pending migrations')
  .action(async () => {
    try {
      await db.connect();
      await migrations.up();
      console.log('Migrations completed successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unknown error occurred');
      }
      process.exit(1);
    } finally {
      await db.disconnect();
    }
  });

program
  .command('down')
  .description('Rollback migrations')
  .option('-s, --steps <number>', 'Number of migrations to roll back', '1')
  .action(async (options: DownOptions) => {
    try {
      await db.connect();
      await migrations.down(parseInt(options.steps, 10));
      console.log('Rollback completed successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unknown error occurred');
      }
      process.exit(1);
    } finally {
      await db.disconnect();
    }
  });

program
  .command('create <name>')
  .description('Create a new migration file')
  .action(async (name: string) => {
    try {
      const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
      const filename = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}.sql`;
      const path = join(__dirname, '../../database/migrations', filename);
      
      const content = `-- Migration: ${name}
-- Description: [Add description here]
-- Timestamp: ${new Date().toISOString()}

-- Up Migration
-- Add your up migration SQL here


-- Down Migration
-- Add your down migration SQL here

`;
      
      await writeFile(path, content, 'utf-8');
      console.log(`Created migration file: ${filename}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unknown error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate migration checksums')
  .action(async () => {
    try {
      await db.connect();
      await migrations.validate();
      console.log('All migrations are valid');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unknown error occurred');
      }
      process.exit(1);
    } finally {
      await db.disconnect();
    }
  });

program.parse();
