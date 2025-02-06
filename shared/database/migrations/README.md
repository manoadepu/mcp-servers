# Database Migrations

## Overview
This directory contains all database migrations for the MCP Servers project. Migrations are used to manage database schema changes and populate test data in a consistent, version-controlled manner.

## Migration Files

### 1. Create Migrations Table (20250301000000)
- Creates the migrations tracking table
- Required for migration system to work
- Tracks which migrations have been applied

### 2. Basic Test Data (20250301000001)
Project Management test data including:
- Sample project: "Mobile App Development"
- Team structure with members
- Sprint with tasks
- Sprint and resource metrics

Example data structure:
```sql
-- Project
{
    id: 'proj-001',
    name: 'Mobile App Development',
    status: 'ACTIVE'
}

-- Team Members
{
    name: 'John Doe',
    role: 'Senior Developer',
    skills: {
        technical: ['React Native', 'TypeScript', 'Node.js'],
        domain: ['Mobile Development', 'API Integration'],
        soft: ['Leadership', 'Communication']
    }
}

-- Sprint Metrics
{
    total_points: 10,
    completed_points: 3,
    velocity: 15,
    burndown_data: {
        dataPoints: [...],
        idealLine: [...]
    }
}
```

### 3. Comprehensive Test Data (20250301000002)
Extended test data for complex scenarios:
- Multiple projects and teams
- Cross-project dependencies
- Various sprint states
- Historical metrics

### 4. Task-Specific Data (20250301000003)
Focused test data for task management:
- Task dependencies
- Task labels and categories
- Sprint planning scenarios
- Resource allocation examples

## Migration Guidelines

### File Naming Convention
```
YYYYMMDDHHMMSS_description.sql
```
Example: `20250301000001_insert_test_data.sql`

### File Structure
```sql
-- Migration: [Title]
-- Description: [Detailed description]
-- Timestamp: [Timestamp]

-- Up Migration
[SQL statements for applying migration]

-- Down Migration
[SQL statements for reverting migration]
```

### Best Practices
1. Always include both Up and Down migrations
2. Keep migrations atomic and focused
3. Use consistent naming for test data
4. Include descriptive comments
5. Test both Up and Down migrations

## Running Migrations

### Using CLI
```bash
# Run all pending migrations
npm run migrate

# Run to specific migration
npm run migrate -- --to 20250301000001

# Rollback to specific migration
npm run migrate -- --down --to 20250301000000
```

### Using API
```typescript
import { runMigrations } from 'shared/src/migrations';

// Run all migrations
await runMigrations();

// Run to specific migration
await runMigrations('20250301000001');

// Rollback to specific migration
await runMigrations('20250301000000', true);
```

## Test Data Organization

### Project Management Data
- Projects with different states
- Team structures and hierarchies
- Sprint cycles and metrics
- Task workflows and dependencies

### Code Assistant Data
- Git repositories
- Commit histories
- Code metrics
- Pull request data

## Adding New Migrations

1. Create new migration file:
```bash
npm run create-migration -- "description"
```

2. Add Up migration:
```sql
-- Up Migration
INSERT INTO table (column1, column2)
VALUES ('value1', 'value2');
```

3. Add Down migration:
```sql
-- Down Migration
DELETE FROM table WHERE column1 = 'value1';
```

4. Test migration:
```bash
npm run migrate -- --test
```

## Troubleshooting

### Common Issues

1. Migration Failed
```bash
# Check migration status
sqlite3 data/mcp-servers.db "SELECT * FROM migrations"

# Reset migration state
sqlite3 data/mcp-servers.db "DELETE FROM migrations WHERE version = 'failed_version'"
```

2. Data Inconsistency
```bash
# Verify data integrity
sqlite3 data/mcp-servers.db "PRAGMA integrity_check"

# Reset to clean state
npm run migrate -- --reset
npm run migrate
```

### Recovery Steps
1. Backup current database
2. Rollback to last known good state
3. Review migration logs
4. Fix issues in migration file
5. Retry migration

## Contributing
1. Follow naming convention
2. Include descriptive comments
3. Test both Up and Down migrations
4. Update this README if adding new test data patterns
5. Submit pull request
