#!/bin/sh
set -e

DB_PATH="/app/data/project-assistant.db"
echo "Initializing SQLite database at $DB_PATH..."

# Create database directory if it doesn't exist
mkdir -p /app/data

# Initialize database with schema
echo "Creating tables..."
if ! sqlite3 "$DB_PATH" < /app/init-db.sql; then
    echo "Error: Failed to initialize database"
    cat /app/init-db.sql
    exit 1
fi

# Verify tables were created
echo "Verifying database schema..."
sqlite3 "$DB_PATH" ".tables"
sqlite3 "$DB_PATH" ".schema"

echo "Database initialized successfully at $DB_PATH"
