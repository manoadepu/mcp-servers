#!/bin/bash

# Get the directory containing this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set paths relative to script directory
PROD_DB_PATH="$SCRIPT_DIR/../../data/mcp-servers.db"
TEST_DB_PATH="$SCRIPT_DIR/../../data/test.db"
SCHEMA_DIR="$SCRIPT_DIR/../database/schema"
MIGRATIONS_DIR="$SCRIPT_DIR/../database/migrations"

echo "Initializing Production database at $PROD_DB_PATH"

# Drop and initialize production database
sqlite3 "$PROD_DB_PATH" << EOF
PRAGMA journal_mode=WAL;
DROP TABLE IF EXISTS task_dependencies;
DROP TABLE IF EXISTS task_labels;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS sprint_metrics;
DROP TABLE IF EXISTS sprints;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS projects;
.read ${SCHEMA_DIR}/project-management.sql
EOF
echo "Production database initialized successfully"

echo "Initializing Test database at $TEST_DB_PATH"

# Drop and initialize test database
sqlite3 "$TEST_DB_PATH" << EOF
PRAGMA journal_mode=WAL;
DROP TABLE IF EXISTS task_dependencies;
DROP TABLE IF EXISTS task_labels;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS sprint_metrics;
DROP TABLE IF EXISTS sprints;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS projects;
.read ${SCHEMA_DIR}/project-management.sql
EOF
echo "Test database initialized successfully"

echo "Inserting test data into database"

# Apply only the comprehensive test data and task data
sqlite3 "$TEST_DB_PATH" ".read $MIGRATIONS_DIR/20250301000002_insert_comprehensive_test_data.sql"
sqlite3 "$TEST_DB_PATH" ".read $MIGRATIONS_DIR/20250301000003_insert_task_data.sql"
sqlite3 "$PROD_DB_PATH" ".read $MIGRATIONS_DIR/20250301000002_insert_comprehensive_test_data.sql"
sqlite3 "$PROD_DB_PATH" ".read $MIGRATIONS_DIR/20250301000003_insert_task_data.sql"

echo "Test data inserted successfully"
