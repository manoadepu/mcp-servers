# Deployment Guide

## Overview
This guide covers the deployment setup for the Project Management MCP server, including Docker configuration, environment setup, monitoring, and CI/CD pipeline.

## Docker Setup

### Dockerfile
```dockerfile
# Base image
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache sqlite

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ src/
COPY shared/ shared/

# Build TypeScript
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV DB_PATH=/data/project-management.db

# Create volume mount points
VOLUME ["/data"]

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "build/index.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  project-management:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
    environment:
      - NODE_ENV=production
      - DB_PATH=/data/project-management.db
      - JIRA_BASE_URL=${JIRA_BASE_URL}
      - JIRA_CLIENT_ID=${JIRA_CLIENT_ID}
      - JIRA_CLIENT_SECRET=${JIRA_CLIENT_SECRET}
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  redis-data:
```

## Environment Configuration

### Production Environment
```env
# Server
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
DB_PATH=/data/project-management.db
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis
REDIS_URL=redis://redis:6379
REDIS_TTL=300

# JIRA
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_CLIENT_ID=your-client-id
JIRA_CLIENT_SECRET=your-client-secret

# Monitoring
METRICS_ENABLED=true
METRICS_PORT=9090
```

### Development Environment
```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
DB_PATH=./data/project-management.db
REDIS_URL=redis://localhost:6379
```

## Monitoring Setup

### Health Check Endpoint
```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    database: boolean;
    redis: boolean;
    jira: boolean;
  };
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
}
```

### Metrics Collection
- Server metrics (CPU, memory, requests)
- Database metrics (queries, connections)
- Cache metrics (hits, misses, latency)
- Business metrics (active projects, sprints)

### Logging
```typescript
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: Record<string, unknown>;
  trace?: string;
}
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: docker/setup-buildx-action@v1
      - run: docker build -t project-management .
      - run: docker push project-management

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: digitalocean/action-doctl@v2
      - run: doctl kubernetes cluster kubeconfig save
      - run: kubectl apply -f k8s/
```

## Kubernetes Configuration

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: project-management
spec:
  replicas: 3
  selector:
    matchLabels:
      app: project-management
  template:
    metadata:
      labels:
        app: project-management
    spec:
      containers:
      - name: project-management
        image: project-management:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        volumeMounts:
        - name: data
          mountPath: /data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: project-management-data
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: project-management
spec:
  selector:
    app: project-management
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Backup Strategy

### Database Backup
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR=/backups
DB_FILE=/data/project-management.db

# Create backup
sqlite3 $DB_FILE ".backup '$BACKUP_DIR/backup_$DATE.db'"

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.db

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "backup_*.db.gz" -mtime +30 -delete
```

### Restore Procedure
1. Stop application
2. Restore database file
3. Verify integrity
4. Start application
5. Validate functionality

## Scaling Strategy

### Horizontal Scaling
- Multiple application instances
- Load balancer configuration
- Session management
- Cache synchronization

### Vertical Scaling
- Resource allocation
- Performance tuning
- Database optimization
- Cache sizing

## Maintenance Procedures

### Updates
1. Create backup
2. Deploy new version
3. Run migrations
4. Verify functionality
5. Monitor performance

### Rollback
1. Stop new version
2. Restore backup
3. Deploy previous version
4. Verify functionality
5. Investigate issues
