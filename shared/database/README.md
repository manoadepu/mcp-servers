# Database Setup Guide

This guide explains how to set up and manage the SQLite databases for both development and testing environments.

## Prerequisites

- SQLite3 command-line tool
- Bash shell

## Directory Structure

```
shared/
├── database/
│   ├── schema/
│   │   ├── init.sql
│   │   ├── code-assistant.sql
│   │   └── project-management.sql
│   └── migrations/
│       ├── 20250301000000_create_migrations_table.sql
│       └── 20250301000001_insert_test_data.sql
├── scripts/
│   └── setup-db.sh
└── data/
    ├── mcp-servers.db
    └── test.db
```

## Quick Start

1. Make the setup script executable:
```bash
chmod +x shared/scripts/setup-db.sh
```

2. Run the setup script:
```bash
./shared/scripts/setup-db.sh
```

This will:
- Create both production and test databases
- Initialize the schema for both databases
- Insert test data into the test database

## Manual Setup Steps

If you prefer to set up the databases manually, follow these steps:

1. Create the data directory:
```bash
mkdir -p data
```

2. Initialize the production database:
```bash
sqlite3 data/mcp-servers.db <<EOF
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

$(cat shared/database/schema/project-management.sql)
$(cat shared/database/schema/code-assistant.sql)
EOF
```

3. Initialize the test database:
```bash
sqlite3 data/test.db <<EOF
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

$(cat shared/database/schema/project-management.sql)
$(cat shared/database/schema/code-assistant.sql)
EOF
```

4. Insert test data (for test database only):
```bash
sqlite3 data/test.db <<EOF
BEGIN TRANSACTION;

INSERT INTO projects (id, name, description, status, start_date, target_date)
VALUES (
    'proj-001',
    'Mobile App Development',
    'Cross-platform mobile app development project',
    'ACTIVE',
    '2025-01-01',
    '2025-06-30'
);

INSERT INTO teams (id, project_id, name, capacity)
VALUES (
    'team-001',
    'proj-001',
    'Mobile Team',
    40
);

INSERT INTO team_members (id, team_id, name, role, skills, availability)
VALUES 
(
    'user-001',
    'team-001',
    'John Doe',
    'Senior Developer',
    '{"technical":["React Native","TypeScript","Node.js"],"domain":["Mobile Development","API Integration"],"soft":["Leadership","Communication"]}',
    100
),
(
    'user-002',
    'team-001',
    'Jane Smith',
    'UI/UX Designer',
    '{"technical":["Figma","Adobe XD","CSS"],"domain":["Mobile Design","User Research"],"soft":["Creativity","Collaboration"]}',
    80
);

INSERT INTO sprints (id, project_id, name, status, start_date, end_date, goals)
VALUES (
    'sprint-001',
    'proj-001',
    'Sprint 1',
    'ACTIVE',
    '2025-01-15',
    '2025-01-29',
    '{"objectives":["Complete user authentication","Implement basic navigation"],"successCriteria":["All unit tests passing","UI/UX review approved"]}'
);

INSERT INTO sprint_metrics (id, sprint_id, total_points, completed_points, remaining_points, velocity, burndown_data)
VALUES (
    'metrics-001',
    'sprint-001',
    10,
    3,
    7,
    15,
    '{"dataPoints":[{"date":"2025-01-15","remainingPoints":10,"completedPoints":0},{"date":"2025-01-20","remainingPoints":7,"completedPoints":3}],"idealLine":[{"date":"2025-01-15","expectedPoints":10},{"date":"2025-01-29","expectedPoints":0}]}'
);

COMMIT;
EOF
```

## Running Tests

The test suite uses its own database file (`test.db`) to avoid interfering with the production database. To run the tests:

```bash
cd shared
npm test
```

The test setup will:
1. Create a fresh test database if it doesn't exist
2. Initialize the schema
3. Insert test data
4. Run the tests
5. Clean up the test data

## Database Files

- `data/mcp-servers.db`: Production database
- `data/test.db`: Test database

Both databases use SQLite's Write-Ahead Logging (WAL) mode for better concurrency and reliability. This creates additional files with extensions `.db-shm` and `.db-wal` alongside the main database files.

## Schema Updates

When updating the schema:

1. Create a new migration file in `shared/database/migrations/`
2. Update the corresponding schema file in `shared/database/schema/`
3. Run the setup script to apply changes:
```bash
./shared/scripts/setup-db.sh
```

## Troubleshooting

If you encounter database issues:

1. Stop any running processes that might be using the database
2. Remove the database files:
```bash
rm -f data/*.db*
```
3. Run the setup script again:
```bash
./shared/scripts/setup-db.sh
