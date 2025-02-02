#!/bin/sh

# Create data directory if it doesn't exist
mkdir -p /app/data

# Set database path from environment variable or use default
DB_PATH=${DB_PATH:-/app/data/mcp-servers.db}

# Initialize database if it doesn't exist
if [ ! -f "$DB_PATH" ]; then
    echo "Initializing database at $DB_PATH"
    sqlite3 "$DB_PATH" < /app/init-db.sql
else
    echo "Database already exists at $DB_PATH"
fi

# Set permissions
chmod 644 "$DB_PATH"

# Keep container running
tail -f /dev/null
