// Core provider types
export * from './types';

// Base provider implementation
export * from './base';

// Provider factory
export * from './factory';

// Event system
export * from './events';

// Cache system
export * from './cache';

// Re-export commonly used types
export {
  ProviderConfig,
  ProviderInfo,
  ProviderAuth,
  TokenAuth,
  OAuthAuth,
  SSHAuth,
  Repository,
  Branch,
  Commit,
  Author,
  CommitAnalysis,
  ChangeAnalysis,
  ComplexityMetrics,
  HistoryOptions,
  CommitFilter,
  BranchFilter
} from './types';

// Re-export factory functions
export {
  createProvider,
  registerProvider,
  hasProvider,
  getProviderTypes,
  getProviderConstructor,
  providerFactory
} from './factory';

// Re-export cache functions
export {
  createCache,
  globalCache
} from './cache';

// Re-export event functions
export {
  createEventBus,
  globalEventBus
} from './events';
