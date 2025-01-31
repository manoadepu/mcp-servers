// Git provider implementation
export * from './provider';
export * from './operations';
export * from './types';

// Register Git provider
import { registerProvider } from '../../core/providers';
import { GitProvider } from './provider';

registerProvider('git', GitProvider);

// Default export
export default GitProvider;
