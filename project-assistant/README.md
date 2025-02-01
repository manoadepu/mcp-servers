# Project Assistant

## Overview
Project Assistant is an MCP server that provides intelligent code analysis, project management, and Git integration capabilities. It helps teams write better code, manage projects efficiently, and make data-driven decisions.

# Project Assistant

## SQLite Database Setup Guide

### Prerequisites
- Docker and Docker Compose installed on your system
- Git (for cloning the repository)

### Database Structure
The project uses SQLite for data storage with the following key tables:
- repositories: Store repository metadata
- commits: Track git commit information
- file_metrics: Store code complexity metrics
- file_changes: Track file modifications
- hotspots: Identify high-activity code areas
- pull_requests: Manage PR data and impact analysis

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd project-assistant
   ```

2. **Initialize Database**
   ```bash
   # Start the Docker containers
   docker-compose up -d

   # Verify containers are running
   docker-compose ps
   ```

3. **Access SQLite Browser Web Interface**
   - Open your web browser and navigate to http://localhost:3001
   - The database file is located at `/data/project-assistant.db` inside the container
   - This maps to `./data/project-assistant.db` on your local machine

### Docker Commands Reference

```bash
# Start containers in detached mode
docker-compose up -d

# Stop containers
docker-compose down

# View container logs
docker-compose logs

# View specific container logs
docker-compose logs sqlite
docker-compose logs sqlitebrowser

# Restart containers
docker-compose restart

# Remove containers and volumes (will delete database)
docker-compose down -v
```

### Database File Location
- Local path: `./data/project-assistant.db`
- Container path: `/data/project-assistant.db`
- The database file is automatically created and initialized when containers start

### Troubleshooting

1. **Port Conflicts**
   - If port 3001 is already in use, modify the port in `docker-compose.yml`:
     ```yaml
     sqlitebrowser:
       ports:
         - "XXXX:3000"  # Replace XXXX with available port
     ```

2. **Database Access Issues**
   - Ensure containers are running: `docker-compose ps`
   - Check container logs: `docker-compose logs`
   - Verify database file exists: `ls -l data/project-assistant.db`
   - Check file permissions: Database file should be readable by the container

3. **Reset Database**
   ```bash
   # Stop containers and remove volumes
   docker-compose down -v
   
   # Remove database file
   rm -f data/project-assistant.db
   
   # Restart containers
   docker-compose up -d
   ```

### Container Details

1. **SQLite Container**
   - Based on Alpine Linux
   - Runs the database initialization script
   - Maintains the SQLite database file
   - Configured in `Dockerfile` and `setup-db.sh`

2. **SQLiteBrowser Container**
   - Web-based UI for database management
   - Provides visual interface for:
     * Browsing tables
     * Executing SQL queries
     * Viewing schema
     * Managing data
   - Based on `lscr.io/linuxserver/sqlitebrowser`

### Development Notes
- The database schema is defined in `init-db.sql`
- Database initialization occurs automatically via `setup-db.sh`
- All tables use appropriate foreign key constraints
- Timestamps are stored in SQLite's native format

## MCP Inspector Usage

### Starting the Inspector
```bash
# Build the project first
npm run build

# Start the MCP Inspector GUI
npx @modelcontextprotocol/inspector gui /Users/manoharadepu/dev/mcp-servers/project-assistant/build/index.js
```

### Available Tools

#### 1. Git Analysis Tools
- **git/analyze/commit**: Analyze code complexity changes in a specific commit
  ```json
  {
    "commitId": "commit-hash",
    "repoPath": "/path/to/repository",
    "excludeFolders": ["node_modules", "dist"]
  }
  ```

#### 2. Code Analysis Features
- Complexity metrics calculation
- Dependency graph generation
- Code duplication detection
- Test coverage analysis
- Security vulnerability scanning

#### 3. Project Management Tools
- Project structure visualization
- Documentation generation
- Task tracking and estimation
- Sprint planning assistance
- Resource utilization tracking

### Core Features

#### 1. Repository Analysis
- Local repository access
- Branch and commit tracking
- File change detection
- Complexity trend analysis

#### 2. Change Detection
- File modifications tracking
- Content diff analysis
- Complexity impact calculation
- Change pattern recognition

#### 3. Complexity Tracking
- Historical complexity analysis
- Change-based complexity delta
- Hotspot identification
- Trend visualization

### Example Usage

1. **Analyzing a Specific Commit**
   ```bash
   # Start the inspector
   npx @modelcontextprotocol/inspector gui /Users/manoharadepu/dev/mcp-servers/project-assistant/build/index.js

   # In the inspector GUI:
   # 1. Select git/analyze/commit
   # 2. Input parameters:
   {
     "commitId": "a9f10722fc696db91d553509ed3d70fbc6880ff2",
     "repoPath": "/Users/manoharadepu/dev/mcp-servers/project-assistant",
     "excludeFolders": ["node_modules", "dist"]
   }
   ```

### Performance Considerations
- Caching strategy for file contents and analysis results
- Batch git operations for efficiency
- Parallel processing where possible
- Incremental analysis support

### Error Handling
- Repository access errors
- Invalid commit references
- File not found in commit
- Analysis and parsing errors
