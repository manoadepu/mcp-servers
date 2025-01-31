# Source Control Provider Configuration Guide

## Overview
This guide explains how to configure and set up different source control providers in the Project Assistant. Each provider can be configured through environment variables, configuration files, or programmatically.

## Common Configuration

### Environment Variables
```bash
# Global provider settings
PROVIDER_CACHE_ENABLED=true
PROVIDER_CACHE_TTL=3600
PROVIDER_DEFAULT_TIMEOUT=30000
PROVIDER_MAX_RETRIES=3

# Authentication settings
PROVIDER_AUTH_TYPE=token|oauth|ssh
PROVIDER_AUTH_TOKEN=xxx
PROVIDER_AUTH_KEY_PATH=/path/to/key
```

### Configuration File
```json
{
  "providers": {
    "default": {
      "timeout": 30000,
      "retries": 3,
      "caching": true
    },
    "auth": {
      "type": "token",
      "credentials": {
        "token": "xxx"
      }
    }
  }
}
```

## Provider-Specific Configuration

### Git Provider

#### Environment Variables
```bash
# Git binary path
PROVIDER_GIT_PATH=/usr/bin/git

# SSH configuration
PROVIDER_GIT_SSH_KEY=/path/to/private/key
PROVIDER_GIT_SSH_KEY_PASSPHRASE=xxx

# Working directory
PROVIDER_GIT_WORKING_DIR=/path/to/workspace
```

#### Configuration Object
```typescript
const gitConfig: GitProviderConfig = {
  type: 'git',
  gitPath: '/usr/bin/git',
  sshKey: {
    private: '-----BEGIN RSA PRIVATE KEY-----\n...',
    public: 'ssh-rsa AAAA...',
    passphrase: 'optional-passphrase'
  },
  workingDir: '/path/to/workspace',
  options: {
    timeout: 30000,
    retries: 3
  }
};
```

### GitHub Provider

#### Environment Variables
```bash
# GitHub API configuration
PROVIDER_GITHUB_API_URL=https://api.github.com
PROVIDER_GITHUB_ENTERPRISE=false

# Authentication
PROVIDER_GITHUB_TOKEN=xxx
PROVIDER_GITHUB_APP_ID=xxx
PROVIDER_GITHUB_APP_KEY=xxx
PROVIDER_GITHUB_INSTALLATION_ID=xxx
```

#### Configuration Object
```typescript
const githubConfig: GitHubProviderConfig = {
  type: 'github',
  apiUrl: 'https://api.github.com',
  enterprise: false,
  auth: {
    type: 'token',
    token: 'github-pat-token'
  },
  options: {
    timeout: 30000,
    retries: 3
  }
};
```

### Bitbucket Provider

#### Environment Variables
```bash
# Bitbucket API configuration
PROVIDER_BITBUCKET_API_URL=https://api.bitbucket.org
PROVIDER_BITBUCKET_WORKSPACE=my-workspace

# Authentication
PROVIDER_BITBUCKET_USERNAME=xxx
PROVIDER_BITBUCKET_APP_PASSWORD=xxx
PROVIDER_BITBUCKET_OAUTH_KEY=xxx
PROVIDER_BITBUCKET_OAUTH_SECRET=xxx
```

#### Configuration Object
```typescript
const bitbucketConfig: BitbucketProviderConfig = {
  type: 'bitbucket',
  apiUrl: 'https://api.bitbucket.org',
  workspace: 'my-workspace',
  auth: {
    type: 'oauth',
    clientId: 'oauth-key',
    clientSecret: 'oauth-secret'
  },
  options: {
    timeout: 30000,
    retries: 3
  }
};
```

## Authentication Setup

### Token-Based Authentication
```typescript
const tokenAuth: TokenAuth = {
  type: 'token',
  token: 'your-access-token'
};
```

### OAuth Authentication
```typescript
const oauthAuth: OAuthAuth = {
  type: 'oauth',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  refreshToken: 'your-refresh-token'
};
```

### SSH Authentication
```typescript
const sshAuth: SSHAuth = {
  type: 'ssh',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n...',
  publicKey: 'ssh-rsa AAAA...',
  passphrase: 'optional-passphrase'
};
```

## Provider Registration

### Registering Providers
```typescript
// Register a provider globally
SourceControlProviderFactory.registerProvider('git', GitProvider);

// Register with custom configuration
const provider = SourceControlProviderFactory.getProvider('git', {
  type: 'git',
  auth: tokenAuth,
  options: {
    timeout: 30000,
    retries: 3
  }
});
```

## Feature Configuration

### Enabling Features
```typescript
const providerFeatures: ProviderFeatures = {
  'commit-signing': {
    enabled: true,
    options: {
      keyId: 'GPG-KEY-ID',
      passphrase: 'key-passphrase'
    }
  },
  'branch-protection': {
    enabled: true,
    options: {
      requireReviews: true,
      requiredReviewers: 2
    }
  }
};
```

## Cache Configuration

### Setting Up Caching
```typescript
const cacheConfig: CacheOptions = {
  ttl: 3600,
  namespace: 'git-provider',
  invalidateOn: [
    'repository.update',
    'commit.new'
  ]
};
```

## Error Handling

### Configuring Error Handlers
```typescript
provider.on('error', (error: ProviderError) => {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limiting
    console.warn(`Rate limit exceeded for ${error.provider}`);
    // Implement retry with exponential backoff
  }
});
```

## Best Practices

### Security
1. Never commit sensitive credentials
2. Use environment variables for secrets
3. Rotate access tokens regularly
4. Use read-only tokens when possible
5. Implement proper secret management

### Performance
1. Enable caching for frequently accessed data
2. Use appropriate TTL values
3. Implement request batching
4. Monitor rate limits
5. Use connection pooling

### Reliability
1. Implement retry logic
2. Use timeouts
3. Handle rate limiting
4. Monitor provider health
5. Log important events

## Troubleshooting

### Common Issues

1. Authentication Failures
```bash
# Check credentials
echo $PROVIDER_GITHUB_TOKEN
# Verify permissions
curl -H "Authorization: token $PROVIDER_GITHUB_TOKEN" https://api.github.com/user
```

2. Rate Limiting
```typescript
// Implement rate limit handling
provider.on('error', async (error) => {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    const resetTime = error.details.resetAt;
    await delay(resetTime - Date.now());
    // Retry request
  }
});
```

3. Network Issues
```typescript
// Configure request retries
const config: ProviderConfig = {
  options: {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    retryBackoff: true
  }
};
```

## Migration Guide

### Upgrading Providers
1. Back up existing configuration
2. Update provider packages
3. Apply new configuration format
4. Test provider functionality
5. Update dependent code
6. Monitor for issues

### Configuration Migration
```typescript
// Old format
const oldConfig = {
  gitPath: '/usr/bin/git',
  token: 'xxx'
};

// New format
const newConfig: ProviderConfig = {
  type: 'git',
  auth: {
    type: 'token',
    token: oldConfig.token
  },
  options: {
    gitPath: oldConfig.gitPath
  }
};
