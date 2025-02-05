#!/bin/bash

# Exit on error
set -e

echo "Testing MCP Servers setup..."

# Run cleanup first
echo "Cleaning up previous setup..."
./cleanup.sh

# Run setup
echo "Running setup script..."
./setup.sh

# Test database connection and migrations
echo "Testing database setup..."
cd shared

echo "Checking migration status..."
npm run migration:status

echo "Testing database queries..."
cat << EOF > test-queries.sql
-- Test Code Assistant Tables
SELECT COUNT(*) as repositories_count FROM repositories;
SELECT COUNT(*) as commits_count FROM commits;
SELECT COUNT(*) as pull_requests_count FROM pull_requests;

-- Test Project Management Tables
SELECT COUNT(*) as projects_count FROM projects;
SELECT COUNT(*) as teams_count FROM teams;
SELECT COUNT(*) as team_members_count FROM team_members;
SELECT COUNT(*) as sprints_count FROM sprints;
SELECT COUNT(*) as tasks_count FROM tasks;
SELECT COUNT(*) as sprint_metrics_count FROM sprint_metrics;
SELECT COUNT(*) as resource_metrics_count FROM resource_metrics;

-- Test Project Data
SELECT id, name, status FROM projects;

-- Test Sprint Data
SELECT id, name, status FROM sprints WHERE project_id = 'proj-001';

-- Test Task Data
SELECT id, title, status, priority FROM tasks WHERE sprint_id = 'sprint-001';

-- Test Team Data
SELECT t.id, t.name, COUNT(tm.id) as member_count
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.name;
EOF

echo "Running test queries..."
sqlite3 ../data/mcp-servers.db < test-queries.sql
rm test-queries.sql

cd ..

echo "Testing SQLite Browser access..."
curl -s http://localhost:3001 > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ SQLite Browser is accessible"
else
    echo "✗ SQLite Browser is not accessible"
fi

echo "Test complete!"
echo ""
echo "Expected results:"
echo "- All tables should exist"
echo "- Project Management tables should have test data:"
echo "  * 1 project (Mobile App Development)"
echo "  * 1 team with 2 members"
echo "  * 1 active sprint with 3 tasks"
echo "  * Sprint and resource metrics"
echo ""
echo "If any issues were found, you can:"
echo "1. Check the database directly at http://localhost:3001"
echo "2. Run './cleanup.sh' and try setup again"
echo "3. Check the migration logs in shared/migration.log"
