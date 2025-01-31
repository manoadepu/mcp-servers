# Git Provider Integration Guide

## Overview
This guide explains how to integrate the Git provider with your project to analyze code complexity and track changes over time.

## Setup

### 1. Installation
```bash
# Install dependencies
npm install @project-assistant/git-provider

# Optional: Install Git CLI if not already installed
# Windows (using Chocolatey)
choco install git

# macOS (using Homebrew)
brew install git

# Linux (Debian/Ubuntu)
sudo apt-get install git
```

### 2. Basic Configuration
```typescript
import { GitProvider } from '@project-assistant/git-provider';

const provider = new GitProvider({
  type: 'git',
  workingDir: '/path/to/workspace',
  options: {
    gitPath: '/usr/bin/git',  // Optional: custom Git binary path
    timeout: 30000,           // Default: 30 seconds
    maxBuffer: 10 * 1024 * 1024  // Default: 10MB
  }
});
```

### 3. Authentication Setup
```typescript
// SSH Authentication
const provider = new GitProvider({
  type: 'git',
  auth: {
    type: 'ssh',
    privateKey: '-----BEGIN RSA PRIVATE KEY-----\n...',
    publicKey: 'ssh-rsa AAAA...',
    passphrase: 'optional-passphrase'
  }
});

// HTTP Authentication
const provider = new GitProvider({
  type: 'git',
  auth: {
    type: 'basic',
    username: 'your-username',
    password: 'your-password'
  }
});
```

## Usage Examples

### 1. Repository Analysis
```typescript
// Analyze a repository
const analysis = await provider.analyzeRepository({
  url: 'https://github.com/user/repo.git',
  branch: 'main'  // Optional: defaults to default branch
});

console.log('Repository Analysis:', {
  totalFiles: analysis.complexity.totalFiles,
  averageComplexity: analysis.complexity.average,
  hotspots: analysis.hotspots.slice(0, 5)
});

// Watch for changes
provider.watchRepository(async (event) => {
  if (event.type === 'commit') {
    const impact = await provider.analyzeCommit(event.commit);
    console.log('New commit impact:', impact);
  }
});
```

### 2. Change Analysis
```typescript
// Analyze specific commit
const commitAnalysis = await provider.analyzeCommit('abc123');
console.log('Commit Analysis:', {
  changedFiles: commitAnalysis.files.length,
  complexityDelta: commitAnalysis.complexity.delta,
  riskLevel: commitAnalysis.impact.level
});

// Analyze changes between commits
const changes = await provider.analyzeChanges('abc123', 'def456');
console.log('Changes:', {
  additions: changes.stats.additions,
  deletions: changes.stats.deletions,
  complexityImpact: changes.complexity.delta
});
```

### 3. Trend Analysis
```typescript
// Analyze complexity trends
const trends = await provider.analyzeComplexityTrend({
  path: 'src/main.ts',
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
  interval: 'week'
});

console.log('Complexity Trends:', {
  direction: trends.trend.direction,
  rate: trends.trend.rate,
  snapshots: trends.snapshots.length
});
```

## Event Handling

### 1. Repository Events
```typescript
// Monitor repository changes
provider.on('repository.update', async (event) => {
  console.log('Repository updated:', event.data.repository);
});

provider.on('repository.error', (event) => {
  console.error('Repository error:', event.data.error);
});
```

### 2. Analysis Events
```typescript
// Monitor analysis events
provider.on('analysis.start', (event) => {
  console.log('Analysis started:', event.data.type);
});

provider.on('analysis.complete', (event) => {
  console.log('Analysis completed:', event.data.result);
});

provider.on('analysis.error', (event) => {
  console.error('Analysis error:', event.data.error);
});
```

## Error Handling

### 1. Basic Error Handling
```typescript
try {
  await provider.analyzeRepository({
    url: 'https://github.com/user/repo.git'
  });
} catch (error) {
  if (error instanceof ProviderError) {
    switch (error.code) {
      case 'REPOSITORY_NOT_FOUND':
        console.error('Repository not found');
        break;
      case 'AUTHENTICATION_FAILED':
        console.error('Authentication failed');
        break;
      case 'GIT_ERROR':
        console.error('Git operation failed:', error.message);
        break;
      default:
        console.error('Unknown error:', error);
    }
  }
}
```

### 2. Custom Error Handler
```typescript
provider.setErrorHandler((error) => {
  // Log error to monitoring system
  logger.error('Git provider error:', {
    code: error.code,
    message: error.message,
    details: error.details
  });

  // Notify team if critical
  if (error.code === 'CRITICAL_ERROR') {
    notifyTeam(error);
  }
});
```

## Performance Optimization

### 1. Caching Configuration
```typescript
const provider = new GitProvider({
  cache: {
    enabled: true,
    ttl: 3600,  // 1 hour
    maxSize: 100 * 1024 * 1024,  // 100MB
    storage: 'filesystem',  // 'memory' | 'filesystem'
    path: '/path/to/cache'  // For filesystem cache
  }
});
```

### 2. Batch Operations
```typescript
// Analyze multiple files
const results = await provider.analyzeBatch(
  ['file1.ts', 'file2.ts', 'file3.ts'],
  {
    parallel: 3,  // Process 3 files in parallel
    timeout: 60000  // 60 second timeout
  }
);
```

## Best Practices

### 1. Repository Management
```typescript
// Clean up when done
await provider.cleanup();

// Use temporary working directory
const provider = new GitProvider({
  workingDir: await createTempDir(),
  cleanup: true  // Auto-cleanup on exit
});
```

### 2. Resource Management
```typescript
// Limit concurrent operations
const provider = new GitProvider({
  maxConcurrent: 5,
  queueTimeout: 30000
});

// Monitor resource usage
provider.on('resource.usage', (event) => {
  const { memory, cpu } = event.data;
  if (memory > 80 || cpu > 90) {
    provider.throttle();
  }
});
```

## Troubleshooting

### 1. Common Issues

1. Git Not Found
```typescript
// Check Git installation
const gitVersion = await provider.executeGit(['--version']);
console.log('Git version:', gitVersion);

// Specify custom Git path
const provider = new GitProvider({
  options: {
    gitPath: 'C:\\Program Files\\Git\\bin\\git.exe'  // Windows example
  }
});
```

2. Authentication Issues
```typescript
// Test authentication
await provider.testAuth();

// Update credentials
await provider.updateAuth({
  type: 'ssh',
  privateKey: newPrivateKey
});
```

3. Performance Issues
```typescript
// Enable debug logging
const provider = new GitProvider({
  debug: true,
  logLevel: 'debug'
});

// Monitor operations
provider.on('operation', (event) => {
  console.log(`Operation ${event.data.type} took ${event.data.duration}ms`);
});
```

### 2. Diagnostic Tools
```typescript
// Get provider status
const status = await provider.getStatus();
console.log('Provider Status:', {
  connected: status.connected,
  cacheSize: status.cache.size,
  activeOperations: status.operations.active,
  queuedOperations: status.operations.queued
});

// Run diagnostics
const diagnostics = await provider.runDiagnostics();
console.log('Diagnostics:', {
  gitVersion: diagnostics.git.version,
  permissions: diagnostics.filesystem.permissions,
  connectivity: diagnostics.network.connectivity
});
