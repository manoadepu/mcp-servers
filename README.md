# MCP Servers

This repository contains multiple MCP (Model Context Protocol) servers that share a common SQLite database.

## Project Structure

```
mcp-servers/
├── code-assistant/     # Code analysis and Git integration
├── project-management/ # Project and sprint management
├── shared/            # Shared utilities and database connection
├── data/             # Shared SQLite database
├── docker-compose.yml # Database container configuration
├── init-db.sql       # Database schema initialization
└── setup-db.sh       # Database setup script
```

## Database Setup

The shared SQLite database is used by all MCP servers in this repository. It contains tables for:

- Code Assistant:
  - repositories
  - commits
  - file_metrics
  - file_changes
  - hotspots
  - pull_requests

- Project Management:
  - projects
  - sprints
  - tasks
  - task_dependencies
  - team_members
  - sprint_metrics
  - resource_metrics

### Setup Instructions

1. Start the database containers:
```bash
docker-compose up -d
```

2. Access SQLite Browser UI:
- Open http://localhost:3001 in your browser
- Database file is located at `/data/mcp-servers.db`

### Environment Variables

- `DB_PATH`: Path to the SQLite database file (default: `/app/data/mcp-servers.db`)

## Development

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- TypeScript

### Building the Shared Library

```bash
cd shared
npm install
npm run build
```

### Running MCP Servers

Each server can be run independently:

```bash
# Code Assistant
cd code-assistant
npm install
npm run build
npm start

# Project Management
cd project-management
npm install
npm run build
npm start
```

### Using the MCP Inspector

```bash
# For Code Assistant
npx @modelcontextprotocol/inspector gui code-assistant/build/index.js

# For Project Management
npx @modelcontextprotocol/inspector gui project-management/build/index.js
```

## Database Schema

See `init-db.sql` for the complete database schema. Key features:

- Foreign key constraints for data integrity
- Timestamps for all records
- Proper indexing for performance
- JSON storage for complex data (metrics, forecasts)

## Error Handling

The shared database connection provides:

- Connection pooling
- Automatic reconnection
- Error propagation
- Type safety with TypeScript
- SQL injection prevention
