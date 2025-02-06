# MCP Servers

A collection of Model Context Protocol (MCP) servers that extend AI capabilities through specialized tools and resources.

## Overview

MCP Servers provide a standardized way to extend AI capabilities through specialized servers that offer tools and resources. Each server focuses on specific functionality while maintaining a consistent interface through the MCP protocol.

## Servers

### Code Assistant
Code analysis and Git operations server providing:
- Code complexity analysis
- Pull request reviews
- Change impact assessment
- Security vulnerability detection

### Project Management
Project and resource management server offering:
- Task tracking
- Sprint management
- Resource allocation
- Project analytics

### Notes Server
Documentation and knowledge management server providing:
- Documentation organization
- Search capabilities
- Content generation
- Knowledge base management

## Documentation

- [Project Overview](project-details/overview.md) - High-level overview of the MCP servers project
- [Technical Design](project-details/technical-design.md) - Detailed technical architecture and protocol specification
- [Setup Guide](project-details/setup-guide.md) - Instructions for setting up and running MCP servers
- [Development Guide](project-details/development-guide.md) - Guidelines for developing new MCP servers

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-org/mcp-servers.git
cd mcp-servers
```

2. Install dependencies:
```bash
npm install
npm run install-all
```

3. Set up environment:
```bash
cp .env.example .env
# Configure environment variables
```

4. Start servers:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Project Structure

```
mcp-servers/
├── project-details/        # Project-wide documentation
├── shared/                # Shared components and utilities
├── code-assistant/        # Code analysis server
├── project-management/    # Project management server
├── notes-server/          # Documentation server
└── docker/               # Docker configuration
```

## Development

### Creating a New Server

1. Use the create-server tool:
```bash
npx @modelcontextprotocol/create-server my-server
```

2. Implement the MCP protocol:
```typescript
class MyServer extends BaseMCPServer {
  // Implement server interfaces
}
```

3. Add tools and resources:
```typescript
// Add tools
server.registerTool('my-tool', new MyTool());

// Add resources
server.registerResource('my-resource', new MyResource());
```

### Running Tests

```bash
# Run all tests
npm test

# Test specific server
cd [server-directory]
npm test
```

## Docker Support

Build and run with Docker:

```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
