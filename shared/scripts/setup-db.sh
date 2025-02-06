#!/bin/bash

# Get the directory containing this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set paths relative to script directory
PROD_DB_PATH="$SCRIPT_DIR/../../data/mcp-servers.db"
TEST_DB_PATH="$SCRIPT_DIR/../../data/test.db"
SCHEMA_DIR="$SCRIPT_DIR/../database/schema"
MIGRATIONS_DIR="$SCRIPT_DIR/../database/migrations"

echo "Setting up databases..."

# Function to initialize a database
init_database() {
    local db_path=$1
    local db_name=$2
    
    echo "Initializing $db_name database at $db_path"
    
    # Create database directory if it doesn't exist
    mkdir -p "$(dirname "$db_path")"
    
    # Drop existing database if it exists
    rm -f "$db_path"
    
    # Initialize database with schema
    sqlite3 "$db_path" << EOF
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
PRAGMA synchronous=NORMAL;

-- Initialize schema using combined init.sql
.read ${SCHEMA_DIR}/init.sql
EOF
    
    if [ $? -eq 0 ]; then
        echo "$db_name database initialized successfully"
    else
        echo "Error initializing $db_name database"
        exit 1
    fi
}

# Function to apply migrations
apply_migrations() {
    local db_path=$1
    local db_name=$2
    
    echo "Applying migrations to $db_name database"
    
    # Apply migrations in order
    for migration in "$MIGRATIONS_DIR"/*.sql; do
        echo "Applying migration: $(basename "$migration")"
        sqlite3 "$db_path" ".read $migration"
        if [ $? -ne 0 ]; then
            echo "Error applying migration: $(basename "$migration")"
            exit 1
        fi
    done
    
    echo "Migrations applied successfully to $db_name database"
}

# Initialize production database
init_database "$PROD_DB_PATH" "Production"

# Initialize test database
init_database "$TEST_DB_PATH" "Test"

# Apply migrations to production database
apply_migrations "$PROD_DB_PATH" "Production"

# Apply migrations to test database
apply_migrations "$TEST_DB_PATH" "Test"

echo "Database setup completed successfully"

# Verify setup
echo "Verifying database setup..."

check_database() {
    local db_path=$1
    local db_name=$2
    
    echo "Checking $db_name database integrity"
    sqlite3 "$db_path" "PRAGMA integrity_check;"
    
    echo "Checking $db_name database foreign keys"
    sqlite3 "$db_path" "PRAGMA foreign_key_check;"
    
    echo "Checking $db_name database tables"
    sqlite3 "$db_path" ".tables"
}

check_database "$PROD_DB_PATH" "Production"
check_database "$TEST_DB_PATH" "Test"

echo "Database verification completed"
