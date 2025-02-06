#!/bin/sh

# Exit on error
set -e

echo "Setting up MCP Servers Database..."

# Create database directory if it doesn't exist
mkdir -p /app/data

# Initialize database if it doesn't exist
if [ ! -f "$DB_PATH" ]; then
    echo "Creating new database at $DB_PATH"
    touch "$DB_PATH"
    
    # Initialize database with schema
    echo "Initializing database schema..."
    sqlite3 "$DB_PATH" << EOF
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
PRAGMA synchronous=NORMAL;

-- Initialize schema using combined init.sql
.read /app/schema/init.sql
EOF
    
    if [ $? -eq 0 ]; then
        echo "Database schema initialized successfully"
    else
        echo "Error initializing database schema"
        exit 1
    fi
    
    # Apply migrations
    echo "Applying migrations..."
    for migration in /app/migrations/*.sql; do
        echo "Applying migration: $(basename "$migration")"
        sqlite3 "$DB_PATH" ".read $migration"
        if [ $? -ne 0 ]; then
            echo "Error applying migration: $(basename "$migration")"
            exit 1
        fi
    done
    
    echo "Migrations applied successfully"
    
    # Verify setup
    echo "Verifying database setup..."
    sqlite3 "$DB_PATH" << EOF
PRAGMA integrity_check;
PRAGMA foreign_key_check;
.tables
EOF
    
    echo "Database initialization complete"
else
    echo "Database already exists at $DB_PATH"
fi

# Keep container running
tail -f /dev/null
