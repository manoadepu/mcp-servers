# Database Migrations

This directory contains database migration files for managing schema changes across MCP servers.

## Migration File Format

Each migration file should:
1. Be named with a timestamp prefix: `YYYYMMDDHHMMSS_description.sql`
2. Include both `up` and `down` migrations
3. Be idempotent (safe to run multiple times)

Example:
```sql
-- 20250301000000_add_task_labels.sql

-- Up Migration
CREATE TABLE IF NOT EXISTS task_labels (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Down Migration
DROP TABLE IF EXISTS task_labels;
```

## Migration Process

1. Create a new migration file:
```bash
npm run migration:create -- "description_of_change"
```

2. Apply pending migrations:
```bash
npm run migration:up
```

3. Rollback last migration:
```bash
npm run migration:down
```

## Migration Table

Migrations are tracked in the `migrations` table:
```sql
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Best Practices

1. **Atomic Changes**: Each migration should handle one schema change
2. **Backwards Compatible**: Ensure changes don't break existing code
3. **Data Preservation**: Handle existing data appropriately
4. **Idempotency**: Migrations should be safe to run multiple times
5. **Documentation**: Comment complex migrations
6. **Testing**: Test both up and down migrations

## Example Migrations

### Adding a Column
```sql
-- Up
ALTER TABLE tasks ADD COLUMN priority TEXT;
UPDATE tasks SET priority = 'MEDIUM' WHERE priority IS NULL;

-- Down
CREATE TABLE tasks_backup AS SELECT id, name, description FROM tasks;
DROP TABLE tasks;
ALTER TABLE tasks_backup RENAME TO tasks;
```

### Modifying Constraints
```sql
-- Up
CREATE TABLE new_tasks (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE'))
);
INSERT INTO new_tasks SELECT * FROM tasks;
DROP TABLE tasks;
ALTER TABLE new_tasks RENAME TO tasks;

-- Down
CREATE TABLE old_tasks (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL
);
INSERT INTO old_tasks SELECT * FROM tasks;
DROP TABLE tasks;
ALTER TABLE old_tasks RENAME TO tasks;
```

## Troubleshooting

1. **Failed Migration**
   - Check migration logs
   - Run down migration
   - Fix issues
   - Retry up migration

2. **Corrupted State**
   - Backup database
   - Check migrations table
   - Manually fix state
   - Resume migrations

3. **Version Conflicts**
   - Ensure all migrations are committed
   - Check migration order
   - Resolve conflicts
   - Test thoroughly

## Future Improvements

1. Automated testing for migrations
2. Migration dry-run mode
3. Data validation steps
4. Automatic backups before migrations
5. Migration dependencies tracking
