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
    
    # Change to schema directory
    cd /app/schema
    
    # Initialize database with schema
    echo "Initializing database schema..."
    sqlite3 "$DB_PATH" < init.sql
    
    echo "Database initialization complete"
else
    echo "Database already exists at $DB_PATH"
fi

# Keep container running
tail -f /dev/null
