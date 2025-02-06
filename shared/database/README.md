# MCP Servers Database

## Overview
The MCP Servers project uses SQLite as its database engine, with schemas organized by server functionality. The database setup is containerized using Docker for consistent development and deployment environments.

## Directory Structure
```
shared/database/
├── schema/                 # Database schema definitions
│   ├── init.sql           # Main initialization script
│   ├── code-assistant.sql # Code Assistant schema
│   └── project-management.sql # Project Management schema
├── migrations/            # Database migrations
│   ├── 20250301000000_create_migrations_table.sql
│   ├── 20250301000001_insert_test_data.sql
│   ├── 20250301000002_insert_comprehensive_test_data.sql
│   └── 20250301000003_insert_task_data.sql
└── README.md             # This file
```

## Database Setup

### Using Docker
1. Start the database container:
```bash
docker-compose up -d
```

This will:
- Create a SQLite database in the mounted data volume
- Initialize the schema using init.sql
- Start SQLite browser UI at http://localhost:3001

### Manual Setup
1. Create database:
```bash
sqlite3 data/mcp-servers.db
```

2. Initialize schema:
```bash
cd shared/database/schema
sqlite3 ../../data/mcp-servers.db < init.sql
```

## Schema Organization

### Code Assistant Schema
- repositories: Git repository information
- commits: Git commit tracking
- file_metrics: Code analysis metrics
- file_changes: Change tracking
- hotspots: Frequently changed files
- pull_requests: PR tracking and analysis

### Project Management Schema
- projects: Project information
- teams: Team management
- team_members: Team member details
- sprints: Sprint tracking
- tasks: Task management
- task_dependencies: Task relationships
- task_labels: Task categorization
- sprint_metrics: Sprint performance
- resource_metrics: Resource utilization

## Database Configuration
The database uses the following SQLite settings (configured in init.sql):
```sql
PRAGMA foreign_keys = ON;      -- Enforce referential integrity
PRAGMA journal_mode = WAL;     -- Write-Ahead Logging for better concurrency
PRAGMA synchronous = NORMAL;   -- Balance between safety and performance
```

## Working with Migrations

### Migration Files
- Located in shared/database/migrations/
- Named with timestamp prefix for ordering
- Each migration is atomic and reversible

### Running Migrations
1. Using CLI tool:
```bash
npm run migrate
```

2. Using TypeScript API:
```typescript
import { runMigrations } from 'shared/src/migrations';
await runMigrations();
```

## Test Data

### Loading Test Data
Test data is loaded through migrations:
```bash
# Load basic test data
npm run migrate -- --to 20250301000001

# Load comprehensive test data
npm run migrate -- --to 20250301000002

# Load task-specific data
npm run migrate -- --to 20250301000003
```

### Test Data Contents
1. Basic Test Data (20250301000001):
   - Sample repositories
   - Basic commits and metrics
   - Example projects and teams

2. Comprehensive Test Data (20250301000002):
   - Extended repository data
   - Complex code metrics
   - Project scenarios

3. Task Data (20250301000003):
   - Sprint examples
   - Task relationships
   - Resource allocations

## Development Guidelines

### Adding New Tables
1. Create migration file:
```sql
-- YYYYMMDDHHMMSS_description.sql
CREATE TABLE new_table (
    id INTEGER PRIMARY KEY,
    ...
);
```

2. Update schema file:
- Add table definition to appropriate schema file
- Add indexes if needed
- Update this README

### Modifying Existing Tables
1. Create migration file:
```sql
-- Add new column
ALTER TABLE existing_table ADD COLUMN new_column TEXT;

-- Create new index
CREATE INDEX idx_name ON existing_table(column);
```

2. Update schema file to reflect changes

## Troubleshooting

### Common Issues

1. Database Locked
```bash
# Reset WAL files
sqlite3 data/mcp-servers.db "PRAGMA wal_checkpoint(TRUNCATE)"
```

2. Migration Failed
```bash
# Check migration status
sqlite3 data/mcp-servers.db "SELECT * FROM migrations"

# Reset to specific migration
npm run migrate -- --to YYYYMMDDHHMMSS
```

3. Corrupt Database
```bash
# Backup existing data
sqlite3 data/mcp-servers.db ".backup 'backup.db'"

# Recreate database
rm data/mcp-servers.db*
docker-compose restart
```

## Monitoring & Maintenance

### Health Checks
```sql
-- Check database integrity
PRAGMA integrity_check;

-- Check foreign key constraints
PRAGMA foreign_key_check;
```

### Performance Optimization
```sql
-- Analyze tables
ANALYZE;

-- Rebuild indexes
REINDEX;

-- Compact database
VACUUM;
```

## Contributing
1. Create migration for changes
2. Update schema files
3. Add tests in shared/src/__tests__/
4. Update documentation
5. Submit pull request
