import simpleGit from 'simple-git';
type SimpleGit = ReturnType<typeof simpleGit>;
import { GitErrorCode, GitErrorDetails, GitProviderError } from './types';

/**
 * Git operations utility class
 */
export class GitOperations {
  private git: SimpleGit;

  constructor(workingDir: string, gitPath?: string) {
    // Normalize path to use forward slashes
    const normalizedDir = workingDir.replace(/\\/g, '/');
    
    const options = {
      baseDir: normalizedDir,
      binary: gitPath,
      maxConcurrentProcesses: 6,
      trimmed: true
    };

    this.git = simpleGit(options);
  }

  /**
   * Initialize repository
   * @param bare Create bare repository
   */
  public async init(bare = false): Promise<void> {
    try {
      await this.git.init(bare);
    } catch (error) {
      throw this.handleError(error, 'init');
    }
  }

  /**
   * Clone repository
   * @param url Repository URL
   * @param directory Target directory
   */
  public async clone(url: string, directory: string): Promise<void> {
    try {
      await this.git.clone(url, directory, {});
    } catch (error) {
      throw this.handleError(error, 'clone');
    }
  }

  /**
   * Get repository status
   */
  public async status(): Promise<{
    current: string;
    tracking: string;
    ahead: number;
    behind: number;
  }> {
    try {
      const status = await this.git.status();
      return {
        current: status.current || '',
        tracking: status.tracking || '',
        ahead: status.ahead || 0,
        behind: status.behind || 0
      };
    } catch (error) {
      throw this.handleError(error, 'status');
    }
  }

  /**
   * Get commit information
   * @param hash Commit hash
   */
  public async getCommit(hash: string): Promise<{
    hash: string;
    message: string;
    author_name: string;
    author_email: string;
    date: string;
    refs: string;
  }> {
    try {
      const log = await this.git.show([
        '--no-patch',
        '--format=%H%n%s%n%an%n%ae%n%ai%n%D',
        hash
      ]);

      const [hash_, message, author_name, author_email, date, refs] = log
        .trim()
        .split('\n');

      return {
        hash: hash_,
        message,
        author_name,
        author_email,
        date,
        refs
      };
    } catch (error) {
      throw this.handleError(error, 'getCommit');
    }
  }

  /**
   * Get commit changes
   * @param hash Commit hash
   */
  public async getCommitChanges(hash: string): Promise<{
    files: Array<{
      file: string;
      changes: number;
      insertions: number;
      deletions: number;
      binary: boolean;
    }>;
    total: {
      changes: number;
      insertions: number;
      deletions: number;
      files: number;
    };
  }> {
    try {
      const stats = await this.git.raw([
        'diff-tree',
        '--no-commit-id',
        '--numstat',
        '-r',
        hash
      ]);

      const files = stats
        .trim()
        .split('\n')
        .filter((line: string): boolean => Boolean(line))
        .map((line: string) => {
          const [insertions, deletions, file]: string[] = line.split('\t');
          const binary = insertions === '-' && deletions === '-';
          return {
            file,
            changes: binary ? 0 : Number(insertions) + Number(deletions),
            insertions: binary ? 0 : Number(insertions),
            deletions: binary ? 0 : Number(deletions),
            binary
          };
        });

      const total = files.reduce(
        (acc: { changes: number; insertions: number; deletions: number; files: number }, 
         file: { changes: number; insertions: number; deletions: number }) => ({
          changes: acc.changes + file.changes,
          insertions: acc.insertions + file.insertions,
          deletions: acc.deletions + file.deletions,
          files: acc.files + 1
        }),
        { changes: 0, insertions: 0, deletions: 0, files: 0 }
      );

      return { files, total };
    } catch (error) {
      throw this.handleError(error, 'getCommitChanges');
    }
  }

  /**
   * Get file content at commit
   * @param hash Commit hash
   * @param path File path
   */
  public async getFileAtCommit(hash: string, path: string): Promise<string> {
    try {
      return await this.git.show([`${hash}:${path}`]);
    } catch (error) {
      throw this.handleError(error, 'getFileAtCommit');
    }
  }

  /**
   * Get commit history
   * @param options History options
   */
  public async log(options: {
    from?: string;
    to?: string;
    file?: string;
    maxCount?: number;
  } = {}): Promise<Array<{
    hash: string;
    date: string;
    message: string;
    refs: string;
    body: string;
    author_name: string;
    author_email: string;
  }>> {
    try {
      const args = ['log', '--format=%H%n%ai%n%s%n%D%n%b%n%an%n%ae%n==='];
      
      if (options.maxCount) {
        args.push(`-n${options.maxCount}`);
      }
      
      if (options.from && options.to) {
        args.push(`${options.from}..${options.to}`);
      } else if (options.from) {
        args.push(options.from);
      }

      if (options.file) {
        args.push('--', options.file);
      }

      const log = await this.git.raw(args);
      
      return log
        .trim()
        .split('\n===\n')
        .filter((entry: string): boolean => Boolean(entry))
        .map((entry: string) => {
          const [hash, date, message, refs, body, author_name, author_email]: string[] = 
            entry.trim().split('\n');
          return {
            hash,
            date,
            message,
            refs,
            body,
            author_name,
            author_email
          };
        });
    } catch (error) {
      throw this.handleError(error, 'log');
    }
  }

  /**
   * Get branches
   */
  public async getBranches(): Promise<{
    current: string;
    all: string[];
    branches: {
      [key: string]: {
        current: boolean;
        name: string;
        commit: string;
        label: string;
      };
    };
  }> {
    try {
      return await this.git.branch();
    } catch (error) {
      throw this.handleError(error, 'getBranches');
    }
  }

  /**
   * Handle Git errors
   * @param error Error object
   * @param operation Operation name
   */
  private handleError(error: unknown, operation: string): GitProviderError {
    const details: GitErrorDetails = {
      code: this.getErrorCode(error),
      command: (error as any)?.git?.command,
      stderr: (error as any)?.git?.stderr,
      operation
    };

    return new GitProviderError(
      (error as Error)?.message || 'Git operation failed',
      details
    );
  }

  /**
   * Get error code from error
   * @param error Error object
   */
  private getErrorCode(error: unknown): GitErrorCode {
    const message = ((error as Error)?.message || '').toLowerCase();
    const stderr = ((error as any)?.git?.stderr || '').toLowerCase();

    if (message.includes('repository not found') || stderr.includes('not a git repository')) {
      return 'REPOSITORY_NOT_FOUND';
    }

    if (message.includes('did not match any file(s) known to git') || 
        stderr.includes('unknown revision')) {
      return 'INVALID_REFERENCE';
    }

    if (message.includes('merge conflict') || stderr.includes('conflict')) {
      return 'MERGE_CONFLICT';
    }

    if (message.includes('uncommitted changes') || 
        stderr.includes('uncommitted changes')) {
      return 'UNCOMMITTED_CHANGES';
    }

    if (message.includes('hook failed') || stderr.includes('hook failed')) {
      return 'HOOK_FAILED';
    }

    if (message.includes('pathspec') || stderr.includes('pathspec')) {
      return 'INVALID_PATH';
    }

    if (message.includes('lock') || stderr.includes('lock')) {
      return 'LOCK_ERROR';
    }

    if (message.includes('authentication') || stderr.includes('authentication')) {
      return 'AUTHENTICATION_FAILED';
    }

    if (message.includes('remote') || stderr.includes('remote')) {
      return 'REMOTE_ERROR';
    }

    return 'OPERATION_FAILED';
  }
}
