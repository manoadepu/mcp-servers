# Development Guide

## Project Structure

```
project-assistant/
├── src/
│   ├── core/                 # Core functionality
│   │   ├── analyzers/       # Code analysis implementations
│   │   ├── integrations/    # External service integrations
│   │   └── utils/           # Shared utilities
│   │
│   ├── handlers/            # MCP request handlers
│   │   ├── resources/       # Resource handlers
│   │   ├── tools/           # Tool handlers
│   │   └── prompts/         # Prompt handlers
│   │
│   ├── models/              # Data models and types
│   │   ├── analysis/        # Analysis-related models
│   │   ├── git/            # Git-related models
│   │   └── metrics/        # Metrics-related models
│   │
│   ├── services/            # Business logic services
│   │   ├── analysis/        # Analysis services
│   │   ├── git/            # Git services
│   │   └── metrics/        # Metrics services
│   │
│   └── config/             # Configuration files
│
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/          # Test fixtures
│
├── scripts/               # Build and utility scripts
├── docs/                  # Documentation
└── types/                 # Type definitions
```

## Development Workflow

### 1. Setting Up Development Environment

#### Clone and Install
```bash
git clone https://github.com/your-org/project-assistant.git
cd project-assistant
npm install
```

#### Development Mode
```bash
# Start development server
npm run dev

# Watch for changes
npm run watch

# Run tests in watch mode
npm run test:watch
```

### 2. Code Style and Standards

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./build",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "tests", "build"]
}
```

#### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 3. Testing Strategy

#### Unit Tests
```typescript
// Example unit test for analyzer
import { ComplexityAnalyzer } from '../src/core/analyzers';

describe('ComplexityAnalyzer', () => {
  it('should calculate cyclomatic complexity', () => {
    const analyzer = new ComplexityAnalyzer();
    const code = `
      function example(x: number): number {
        if (x > 0) {
          return x * 2;
        } else {
          return x;
        }
      }
    `;
    
    const result = analyzer.analyze(code);
    expect(result.cyclomatic).toBe(2);
  });
});
```

#### Integration Tests
```typescript
// Example integration test for Git service
import { GitService } from '../src/services/git';

describe('GitService Integration', () => {
  it('should fetch repository information', async () => {
    const service = new GitService();
    const repo = await service.getRepository('owner/repo');
    
    expect(repo).toHaveProperty('branches');
    expect(repo).toHaveProperty('commits');
  });
});
```

#### E2E Tests
```typescript
// Example E2E test for API endpoint
import { TestServer } from '../test/utils';

describe('API Endpoints', () => {
  it('should analyze repository', async () => {
    const response = await TestServer.post('/tools/analyze', {
      repository: 'https://github.com/owner/repo'
    });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('analysis');
  });
});
```

### 4. Documentation

#### Code Documentation
```typescript
/**
 * Analyzes code complexity using various metrics
 * @param code - Source code to analyze
 * @returns ComplexityMetrics object containing analysis results
 * @throws AnalysisError if code cannot be parsed
 */
async function analyzeComplexity(code: string): Promise<ComplexityMetrics> {
  // Implementation
}
```

#### API Documentation
```typescript
/**
 * @api {post} /tools/analyze Analyze Repository
 * @apiName AnalyzeRepository
 * @apiGroup Analysis
 *
 * @apiParam {String} repository Repository URL
 * @apiParam {Object} [options] Analysis options
 *
 * @apiSuccess {Object} analysis Analysis results
 * @apiSuccess {Number} analysis.complexity Complexity score
 * @apiSuccess {Array} analysis.issues Detected issues
 */
```

### 5. Error Handling

#### Custom Error Classes
```typescript
export class AnalysisError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AnalysisError';
  }
}
```

#### Error Handling Middleware
```typescript
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof AnalysisError) {
    res.status(400).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  } else {
    next(error);
  }
}
```

### 6. Performance Optimization

#### Caching Strategy
```typescript
export class AnalysisCache {
  private cache = new Map<string, CacheEntry>();
  
  async get(key: string): Promise<AnalysisResult | null> {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      return null;
    }
    return entry.value;
  }
  
  set(key: string, value: AnalysisResult): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
}
```

#### Resource Management
```typescript
export class ResourceManager {
  private connections = new Map<string, Connection>();
  
  async getConnection(id: string): Promise<Connection> {
    let conn = this.connections.get(id);
    if (!conn || !conn.isAlive()) {
      conn = await this.createConnection(id);
      this.connections.set(id, conn);
    }
    return conn;
  }
  
  cleanup(): void {
    for (const [id, conn] of this.connections) {
      if (!conn.isAlive()) {
        conn.close();
        this.connections.delete(id);
      }
    }
  }
}
```

## Best Practices

### 1. Code Organization
- Follow single responsibility principle
- Use meaningful file and directory names
- Keep related code together
- Maintain consistent file structure

### 2. Type Safety
- Use strict TypeScript configuration
- Avoid `any` type when possible
- Define interfaces for data structures
- Use type guards for runtime checks

### 3. Error Handling
- Use custom error classes
- Provide meaningful error messages
- Include error context when possible
- Handle edge cases appropriately

### 4. Testing
- Write tests before implementation
- Maintain high test coverage
- Use meaningful test descriptions
- Mock external dependencies

### 5. Performance
- Implement caching where appropriate
- Optimize database queries
- Manage resource connections
- Monitor memory usage

### 6. Security
- Validate input data
- Sanitize output
- Use proper authentication
- Follow security best practices

## Contributing

### 1. Pull Request Process
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Update documentation
6. Submit PR

### 2. Code Review Guidelines
- Check code style
- Verify test coverage
- Review documentation
- Test functionality
- Check performance impact

### 3. Release Process
1. Update version
2. Generate changelog
3. Run tests
4. Build documentation
5. Create release tag
6. Deploy
