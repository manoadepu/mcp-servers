#!/bin/bash

# Exit on error
set -e

echo "Cleaning up MCP Servers environment..."

# Stop and remove containers
echo "Stopping Docker containers..."
docker-compose down -v

# Remove data directory
echo "Removing database files..."
rm -rf data

# Clean node_modules and build artifacts
echo "Cleaning shared module..."
cd shared
rm -rf node_modules build
cd ..

echo "Cleaning code-assistant..."
cd code-assistant
rm -rf node_modules build
cd ..

echo "Cleaning project-management..."
cd project-management
rm -rf node_modules build
cd ..

# Remove any lock files
echo "Removing lock files..."
find . -name "package-lock.json" -delete

echo "Cleanup complete! To set up the environment again, run:"
echo "./setup.sh"
