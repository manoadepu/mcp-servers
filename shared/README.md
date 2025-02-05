# MCP Servers Shared Database Module

This module provides shared database functionality and utilities for MCP servers. It includes:

- Unified SQLite database schema
- Shared database connection management
- Common types and interfaces
- Error handling utilities

## Directory Structure

```
shared/
├── database/
│   ├── schema/
│   │   ├── code-assistant.sql    # Code Assistant specific tables
│   │   ├── project-management.sql # Project Management specific tables
│   │   └── init.sql             # Combined schema initialization
│   └── migrations/              # Future schema migrations
└── src/
    ├── connection.ts           # Database connection management
    └── index.ts               # Public API exports
```

## Installation

1. Install the package in your MCP server project:
```bash
npm install @mcp-servers/shared
```

2. Add the shared module to your `package.json`:
```json
{
  "dependencies": {
    "@mcp-servers/shared": "file:../shared"
  }
}
```

## Usage

### Database Connection

```typescript
import { db } from '@mcp-servers/shared';

async function example() {
  await db.connect();
  
  // Use the connection
  const result = await db.query('SELECT * FROM your_table');
  
  await db.disconnect();
}
```

### Code Assistant Queries

```typescript
import { db } from '@mcp-servers/shared';

async function getRepoInfo(repoId: number) {
  const repo = await db.getRepository(repoId);
  const prs = await db.getPullRequest(repoId, 123);
}
```

### Project Management Queries

```typescript
import { db } from '@mcp-servers/shared';

async function getProjectInfo(projectId: string) {
  const project = await db.getProject(projectId);
  const sprint = await db.getCurrentSprint(projectId);
  const metrics = await db.getSprintMetrics(sprint.id);
}
```

### Common Types

```typescript
import { 
  ProjectStatus,
  SprintStatus,
  TaskStatus,
  TaskPriority,
  BaseEntity
} from '@mcp-servers/shared';

// Use shared types
const status: ProjectStatus = 'ACTIVE';
```

### Error Handling

```typescript
import { DatabaseError, ConnectionError, QueryError } from '@mcp-servers/shared';

try {
  await db.connect();
} catch (error) {
  if (error instanceof ConnectionError) {
    // Handle connection error
  } else if (error instanceof QueryError) {
    // Handle query error
  } else if (error instanceof DatabaseError) {
    // Handle general database error
  }
}
```

## Environment Variables

- `DB_PATH`: Path to SQLite database file (default: '/app/data/mcp-servers.db')

## Development

1. Build the module:
```bash
npm run build
```

2. Watch for changes:
```bash
npm run watch
```

3. Clean build artifacts:
```bash
npm run clean
```

## Docker Integration

The database schema files are available at runtime in the Docker container at:
- `/app/schema/code-assistant.sql`
- `/app/schema/project-management.sql`
- `/app/schema/init.sql`

These paths are exported as constants:
```typescript
import { SCHEMA_PATHS } from '@mcp-servers/shared';

console.log(SCHEMA_PATHS.INIT); // '/app/schema/init.sql'
