import { db, DatabaseError } from '../index';
import globalSetup from './setup';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('Shared Database Module', () => {
  beforeAll(async () => {
    await globalSetup();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  describe('Project Management', () => {
    it('should fetch project details', async () => {
      const project = await db.getProject('proj-001');
      expect(project).toBeDefined();
      expect(project?.name).toBe('Mobile App Development');
      expect(project?.status).toBe('ACTIVE');
    });

    it('should fetch current sprint', async () => {
      const sprint = await db.getCurrentSprint('proj-001');
      expect(sprint).toBeDefined();
      expect(sprint?.name).toBe('Sprint 1');
      expect(sprint?.status).toBe('ACTIVE');
    });

    it('should fetch sprint metrics', async () => {
      const metrics = await db.getSprintMetrics('sprint-001');
      expect(metrics).toBeDefined();
      expect(metrics?.total_points).toBe(10);
      expect(metrics?.completed_points).toBe(3);
      expect(metrics?.remaining_points).toBe(7);
    });

    it('should handle missing data gracefully', async () => {
      const project = await db.getProject('non-existent');
      expect(project).toBeUndefined();

      const sprint = await db.getCurrentSprint('non-existent');
      expect(sprint).toBeUndefined();

      const metrics = await db.getSprintMetrics('non-existent');
      expect(metrics).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid project ID', async () => {
      const project = await db.getProject('invalid-id');
      expect(project).toBeUndefined();
    });

    it('should handle database errors', async () => {
      await expect(db.run('INVALID SQL')).rejects.toThrow(DatabaseError);
    });

    it('should handle disconnected state', async () => {
      await db.disconnect();
      await expect(db.query('SELECT 1')).rejects.toThrow('Database not connected');
      await db.connect(); // Reconnect for other tests
    });
  });

  describe('Query Builder', () => {
    it('should execute parameterized queries', async () => {
      const result = await db.query<{ id: string; name: string }>(
        'SELECT id, name FROM projects WHERE id = ?',
        ['proj-001']
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Mobile App Development');
    });

    it('should handle empty results', async () => {
      const result = await db.query(
        'SELECT * FROM projects WHERE id = ?',
        ['non-existent']
      );
      expect(result).toHaveLength(0);
    });

    it('should handle multiple parameters', async () => {
      const result = await db.query<{ id: string; name: string }>(
        'SELECT id, name FROM projects WHERE id = ? AND status = ?',
        ['proj-001', 'ACTIVE']
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('proj-001');
    });
  });

  describe('Transaction Support', () => {
    it('should rollback failed transactions', async () => {
      const countBefore = (await db.query<{ count: number }>(
        'SELECT COUNT(*) as count FROM projects'
      ))[0].count;

      try {
        await db.run('BEGIN TRANSACTION');
        await db.run(
          "INSERT INTO projects (id, name, status, start_date, target_date) VALUES ('test-1', 'Test Project', 'ACTIVE', '2025-01-01', '2025-12-31')"
        );
        await db.run('INVALID SQL'); // This should fail
        await db.run('COMMIT');
      } catch (error) {
        await db.run('ROLLBACK');
      }

      const countAfter = (await db.query<{ count: number }>(
        'SELECT COUNT(*) as count FROM projects'
      ))[0].count;

      expect(countAfter).toBe(countBefore);
    });

    it('should commit successful transactions', async () => {
      const countBefore = (await db.query<{ count: number }>(
        'SELECT COUNT(*) as count FROM projects'
      ))[0].count;

      try {
        await db.run('BEGIN TRANSACTION');
        await db.run(
          "INSERT INTO projects (id, name, status, start_date, target_date) VALUES ('test-2', 'Test Project 2', 'ACTIVE', '2025-01-01', '2025-12-31')"
        );
        await db.run('COMMIT');

        const countAfter = (await db.query<{ count: number }>(
          'SELECT COUNT(*) as count FROM projects'
        ))[0].count;

        expect(countAfter).toBe(countBefore + 1);

        // Clean up
        await db.run('DELETE FROM projects WHERE id = ?', ['test-2']);
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    });
  });
});
