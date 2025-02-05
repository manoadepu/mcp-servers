# MCP Servers

A collection of Model Context Protocol (MCP) servers with shared infrastructure.

## Project Structure

```
mcp-servers/
├── docker/                    # Shared Docker configuration
│   ├── Dockerfile            # Database container setup
│   └── setup-db.sh           # Database initialization script
├── docker-compose.yml        # Main compose file for all services
├── shared/                   # Shared database and utilities
│   ├── database/            # Database schemas and migrations
│   │   ├── schema/         # Table definitions
│   │   └── migrations/     # Database migrations
│   └── src/                # Shared TypeScript code
├── code-assistant/          # Code analysis MCP server
└── project-management/      # Project management MCP server
```

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd mcp-servers
```

2. Run the setup script:
```bash
./setup.sh
```

This will:
- Install dependencies for all projects
- Build TypeScript code
- Start the database containers
- Run database migrations
- Load test data

3. Access the database:
- SQLite Browser: http://localhost:3001
- Database file: `./data/mcp-servers.db`

## Development

### Database Structure

The database is shared between all MCP servers and includes:

1. Code Assistant Tables:
- repositories: Store repository metadata
- commits: Track git commit information
- file_metrics: Store code complexity metrics
- file_changes: Track file modifications
- hotspots: Identify high-activity code areas
- pull_requests: Manage PR data and impact analysis

2. Project Management Tables:
- projects: Project metadata and status
- teams: Team organization and capacity
- team_members: Team member details and skills
- sprints: Sprint planning and tracking
- tasks: Task management and assignments
- task_dependencies: Task relationships
- task_labels: Task categorization
- sprint_metrics: Sprint performance tracking
- resource_metrics: Resource utilization tracking

### Database Migrations

The shared module includes a migration system:

```bash
# Check migration status
cd shared
npm run migration:status

# Create new migration
npm run migration:create "description"

# Apply pending migrations
npm run migration:up

# Rollback last migration
npm run migration:down
```

### Running MCP Servers

1. Code Assistant:
```bash
cd code-assistant
npm run build
npm start
```

2. Project Management:
```bash
cd project-management
npm run build
npm start
```

### Environment Variables

Create a `.env` file in the root directory:
```env
# Database Configuration
DB_PATH=/app/data/mcp-servers.db

# Docker Configuration
PUID=1000
PGID=1000
TZ=Etc/UTC
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose build

# Reset database (WARNING: Deletes all data)
./cleanup.sh
./setup.sh
```

## Test Data

The setup includes sample data for testing:

1. Project:
- Mobile App Development project
- Active sprint with tasks
- Team with members and skills

2. Tasks:
- Authentication Flow (In Progress)
- Navigation Menu (Blocked)
- Settings Screen (Todo)

3. Metrics:
- Sprint burndown data
- Resource utilization
- Skill demand/availability

## Adding New MCP Servers

1. Create a new directory for your server
2. Add dependencies on shared module:
```json
{
  "dependencies": {
    "@mcp-servers/shared": "file:../shared"
  }
}
```
3. Import and use shared database connection:
```typescript
import { db } from '@mcp-servers/shared';
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Cleanup

To reset the environment:
```bash
./cleanup.sh
```

This will:
- Stop and remove Docker containers
- Remove database files
- Clean build artifacts
- Remove node_modules

## License

MIT
