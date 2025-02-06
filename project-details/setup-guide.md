# MCP Servers Setup Guide

## Prerequisites

### System Requirements
- Node.js 18+ (LTS recommended)
- PostgreSQL 14+
- Git
- Docker (optional, for containerized deployment)

### Development Environment
- TypeScript 4.9+
- VSCode with recommended extensions
- Node.js development tools
- Database management tools

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/mcp-servers.git
cd mcp-servers
```

### 2. Environment Configuration
1. Copy example environment file:
```bash
cp .env.example .env
```

2. Configure environment variables:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=mcp_servers

# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Authentication
AUTH_SECRET=your_secret_key
```

### 3. Install Dependencies
```bash
# Install root project dependencies
npm install

# Install dependencies for all servers
npm run install-all
```

### 4. Database Setup
1. Create database:
```bash
createdb mcp_servers
```

2. Run migrations:
```bash
npm run migrate
```

3. Seed test data (optional):
```bash
npm run seed
```

## Server Configuration

### 1. Code Assistant Server
```bash
cd code-assistant
cp .env.example .env
# Configure server-specific variables
npm install
npm run build
```

### 2. Project Management Server
```bash
cd project-management
cp .env.example .env
# Configure server-specific variables
npm install
npm run build
```

### 3. Notes Server
```bash
cd notes-server
cp .env.example .env
# Configure server-specific variables
npm install
npm run build
```

## Running Servers

### Development Mode
```bash
# Run all servers in development mode
npm run dev

# Run specific server
cd [server-directory]
npm run dev
```

### Production Mode
```bash
# Build all servers
npm run build

# Start all servers
npm start

# Start specific server
cd [server-directory]
npm start
```

### Docker Deployment
```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests for specific server
cd [server-directory]
npm test
```

### Test Database Setup
```bash
# Create test database
createdb mcp_servers_test

# Run test migrations
NODE_ENV=test npm run migrate
```

## Common Issues & Solutions

### Database Connection Issues
1. Check PostgreSQL service is running:
```bash
sudo service postgresql status
```

2. Verify connection settings in .env file
3. Ensure database user has proper permissions

### Build Errors
1. Clear build artifacts:
```bash
npm run clean
```

2. Verify TypeScript version compatibility
3. Check for missing dependencies

### Runtime Errors
1. Check log files for detailed error messages
2. Verify all required environment variables are set
3. Ensure proper file permissions

## Development Workflow

### 1. Creating New MCP Server
```bash
# Use create-server tool
npx @modelcontextprotocol/create-server my-server

# Set up server
cd my-server
npm install
```

### 2. Adding New Features
1. Create feature branch
2. Implement changes following style guide
3. Add tests
4. Update documentation
5. Submit pull request

### 3. Updating Shared Components
1. Make changes in shared directory
2. Run tests for all affected servers
3. Update version numbers if needed
4. Document API changes

## Monitoring & Maintenance

### Health Checks
- Each server exposes /health endpoint
- Monitor server status and performance
- Check resource usage

### Logging
- Logs stored in /var/log/mcp-servers/
- Use LOG_LEVEL env var to control detail
- Rotate logs regularly

### Backups
- Database backups configured via cron
- Store configuration backups
- Document recovery procedures

## Security Considerations

### Authentication
- Configure authentication providers
- Manage API keys securely
- Rotate secrets regularly

### Authorization
- Set up role-based access control
- Configure resource permissions
- Review access logs

### Network Security
- Configure firewalls
- Use HTTPS in production
- Implement rate limiting

## Additional Resources

### Documentation
- API Documentation: /docs/api
- Development Guide: /docs/development
- Security Guide: /docs/security

### Support
- GitHub Issues
- Technical Support
- Community Forums

### Contributing
- Style Guide
- Pull Request Template
- Code Review Process
