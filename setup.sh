#!/bin/bash

# Exit on error
set -e

echo "Setting up MCP Servers..."

# Create data directory
mkdir -p data

# Install and build shared module
echo "Setting up shared module..."
cd shared
npm install
npm run build
cd ..

# Install and build code-assistant
echo "Setting up code-assistant..."
cd code-assistant
npm install
npm run build
cd ..

# Install and build project-management
echo "Setting up project-management..."
cd project-management
npm install
npm run build
cd ..

# Start database containers
echo "Starting database containers..."
docker-compose up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Run migrations
echo "Running migrations..."
cd shared
echo "1. Creating migrations table..."
npm run migration:up
echo "2. Inserting test data..."
npm run migration:up
echo "3. Verifying migrations..."
npm run migration:status
cd ..

echo "Setup complete! You can now:"
echo "1. Access SQLite Browser at http://localhost:3001"
echo "2. Use 'npm run migration:status' in shared directory to check migration status"
echo "3. Start developing your MCP servers"

# Make the migrate CLI executable
chmod +x shared/build/cli/migrate.js

echo ""
echo "Available commands:"
echo "- npm run migration:status  # Check migration status"
echo "- npm run migration:up      # Apply pending migrations"
echo "- npm run migration:down    # Rollback migrations"
echo "- npm run migration:create  # Create new migration"
echo ""
echo "Test data is loaded and ready to use!"
