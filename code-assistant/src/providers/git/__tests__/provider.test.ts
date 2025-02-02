import { GitProvider } from '../provider';
import { GitProviderConfig } from '../types';
import { GitOperations } from '../operations';
import { ProviderInfo } from '../../../core/providers';
import path from 'path';
import os from 'os';

jest.mock('../operations', () => {
  const mockStatus = jest.fn().mockImplementation((workingDir) => {
    if (workingDir === '/invalid/path') {
      return Promise.reject(new Error('Invalid repository path'));
    }
    return Promise.resolve({
      current: '',
      tracking: '',
      ahead: 0,
      behind: 0
    });
  });

  return {
    GitOperations: jest.fn().mockImplementation((workingDir) => ({
      init: jest.fn().mockResolvedValue(undefined),
      status: mockStatus.bind(null, workingDir)
    }))
  };
});

const mockStatus = {
  current: '',
  tracking: '',
  ahead: 0,
  behind: 0
};

describe('GitProvider', () => {
  let provider: GitProvider;
  let tempDir: string;

  beforeEach(() => {
    jest.clearAllMocks();
    tempDir = path.join(os.tmpdir(), `test-repo-${Date.now()}`);
    const config: GitProviderConfig = {
      type: 'git',
      workingDir: tempDir
    };
    provider = new GitProvider(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
    provider.off('provider.error', jest.fn());
    provider.off('provider.ratelimit', jest.fn());
    provider.dispose();
  });

  afterAll(() => {
    jest.restoreAllMocks();
    // Clean up global instances
    const { globalEventBus } = require('../../../core/providers/events');
    const { globalCache } = require('../../../core/providers/cache');
    globalEventBus.clear();
    globalCache.dispose();
  });

  describe('initialization', () => {
    it('should create provider with correct type', () => {
      expect(provider.type).toBe('git');
    });

    it('should create provider with correct name', () => {
      expect(provider.name).toBe('Git');
    });

    it('should create provider with correct version', () => {
      expect(provider.version).toBe('1.0.0');
    });

    it('should register git-operations feature', () => {
      expect(provider.hasFeature('git-operations')).toBe(true);
    });
  });

  describe('repository operations', () => {
    it('should parse repository name from URL', async () => {
      const repo = await provider.getRepository('https://github.com/user/repo.git');
      expect(repo.name).toBe('repo');
      expect(repo.id).toBe('repo');
      expect(repo.url).toBe('https://github.com/user/repo.git');
    });

    it('should handle repository URL without .git extension', async () => {
      const repo = await provider.getRepository('https://github.com/user/repo');
      expect(repo.name).toBe('repo');
      expect(repo.id).toBe('repo');
      expect(repo.url).toBe('https://github.com/user/repo');
    });
  });

  describe('git operations', () => {
    it('should initialize repository', async () => {
      const operations = provider.getFeature<GitOperations>('git-operations');
      if (!operations) {
        throw new Error('Git operations not found');
      }
      await operations.init();
      const status = await operations.status();
      expect(status.current).toBe(mockStatus.current);
    });

    it('should get default branch', async () => {
      const repo = await provider.getRepository('test');
      const branch = await provider.getDefaultBranch(repo);
      expect(typeof branch).toBe('string');
    });
  });

  describe('error handling', () => {
    it('should handle invalid repository path', async () => {
      const invalidConfig: GitProviderConfig = {
        type: 'git',
        workingDir: '/invalid/path'
      };
      const invalidProvider = new GitProvider(invalidConfig);
      try {
        await expect(invalidProvider.getDefaultBranch({ 
          id: 'test',
          name: 'test',
          url: 'test',
          defaultBranch: 'main',
          provider: {
            type: 'git',
            name: 'Git',
            version: '1.0.0',
            capabilities: []
          } as ProviderInfo,
          metadata: {}
        })).rejects.toThrow();
      } finally {
        invalidProvider.dispose();
      }
    });
  });
});
