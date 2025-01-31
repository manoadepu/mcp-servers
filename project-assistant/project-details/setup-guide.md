# Setup Guide

## Prerequisites

### System Requirements
- Node.js (v18 or higher)
- TypeScript (v5.0 or higher)
- Git (v2.30 or higher)
- SQLite (v3.35 or higher) or PostgreSQL (v14 or higher)

### Required API Keys and Tokens
1. Git Provider Tokens
   - GitHub Personal Access Token
   - GitLab Access Token
   - Bitbucket App Password

2. CI/CD Integration Tokens
   - Jenkins API Token
   - CircleCI API Token
   - GitHub Actions Token

3. AI Service Keys
   - OpenAI API Key
   - GitHub Copilot Token
   - Custom AI Service Keys

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/project-assistant.git
cd project-assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Database Configuration
DB_TYPE=sqlite
DB_PATH=./data/project-assistant.db
# For PostgreSQL:
# DB_TYPE=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=project_assistant
# DB_USER=admin
# DB_PASSWORD=your_password

# Git Provider Tokens
GITHUB_TOKEN=your_github_token
GITLAB_TOKEN=your_gitlab_token
BITBUCKET_TOKEN=your_bitbucket_token

# CI/CD Integration
JENKINS_TOKEN=your_jenkins_token
CIRCLECI_TOKEN=your_circleci_token
GITHUB_ACTIONS_TOKEN=your_github_actions_token

# AI Service Configuration
OPENAI_API_KEY=your_openai_key
GITHUB_COPILOT_TOKEN=your_copilot_token

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### 4. Initialize Database
```bash
# For SQLite
npm run init-db

# For PostgreSQL
npm run init-db:postgres
```

### 5. Build the Project
```bash
npm run build
```

### 6. Run Tests
```bash
npm test
```

## Configuration

### 1. Server Configuration

#### Basic Settings (config/server.ts)
```typescript
export const serverConfig = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  cors: {
    enabled: true,
    origins: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }
};
```

#### Security Settings (config/security.ts)
```typescript
export const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
  },
  
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    algorithm: 'aes-256-gcm',
  },
  
  auth: {
    enabled: true,
    providers: ['github', 'gitlab', 'bitbucket'],
  }
};
```

### 2. Analysis Configuration

#### Code Analysis Settings (config/analysis.ts)
```typescript
export const analysisConfig = {
  complexity: {
    maxCyclomatic: 10,
    maxCognitive: 15,
    maxDependencies: 20,
  },
  
  quality: {
    minTestCoverage: 80,
    maxDuplication: 5,
    maxVulnerabilities: 0,
  },
  
  performance: {
    maxResponseTime: 1000,
    maxMemoryUsage: 512,
    maxCpuUsage: 80,
  }
};
```

#### Git Integration Settings (config/git.ts)
```typescript
export const gitConfig = {
  providers: {
    github: {
      baseUrl: 'https://api.github.com',
      token: process.env.GITHUB_TOKEN,
    },
    gitlab: {
      baseUrl: 'https://gitlab.com/api/v4',
      token: process.env.GITLAB_TOKEN,
    },
    bitbucket: {
      baseUrl: 'https://api.bitbucket.org/2.0',
      token: process.env.BITBUCKET_TOKEN,
    },
  },
  
  analysis: {
    maxCommitSize: 500,
    branchLifespan: 30, // days
    staleThreshold: 14, // days
  }
};
```

## Usage

### 1. Start the Server
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

### 2. Health Check
```bash
curl http://localhost:3000/health
```

### 3. API Documentation
```bash
# Generate API documentation
npm run docs

# View documentation
open http://localhost:3000/docs
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database status
npm run db:status

# Reset database
npm run db:reset
```

#### 2. Git Integration Issues
```bash
# Verify git credentials
npm run verify-git

# Reset git integration
npm run reset-git
```

#### 3. Performance Issues
```bash
# Run diagnostics
npm run diagnostics

# Clear cache
npm run clear-cache
```

### Logging

#### Log Locations
- Application logs: `./logs/app.log`
- Error logs: `./logs/error.log`
- Access logs: `./logs/access.log`

#### Log Levels
```typescript
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}
```

## Maintenance

### Regular Tasks
1. Update dependencies
   ```bash
   npm update
   npm audit fix
   ```

2. Backup database
   ```bash
   npm run backup-db
   ```

3. Rotate logs
   ```bash
   npm run rotate-logs
   ```

### Monitoring
1. Check system health
   ```bash
   npm run health-check
   ```

2. View metrics
   ```bash
   npm run metrics
   ```

3. Check resource usage
   ```bash
   npm run resource-usage
   ```

## Support

### Getting Help
- GitHub Issues: [Project Issues](https://github.com/your-org/project-assistant/issues)
- Documentation: [Project Wiki](https://github.com/your-org/project-assistant/wiki)
- Community: [Discord Server](https://discord.gg/your-server)

### Contributing
- [Contribution Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Development Setup](DEVELOPMENT.md)
