-- Repositories
CREATE TABLE IF NOT EXISTS repositories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commits
CREATE TABLE IF NOT EXISTS commits (
    hash TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (repository_id) REFERENCES repositories(id)
);

-- File Metrics
CREATE TABLE IF NOT EXISTS file_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commit_hash TEXT NOT NULL,
    file_path TEXT NOT NULL,
    cyclomatic_complexity INTEGER NOT NULL,
    cognitive_complexity INTEGER NOT NULL,
    maintainability_index REAL NOT NULL,
    lines_of_code INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commit_hash) REFERENCES commits(hash),
    UNIQUE(commit_hash, file_path)
);

-- File Changes
CREATE TABLE IF NOT EXISTS file_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commit_hash TEXT NOT NULL,
    file_path TEXT NOT NULL,
    insertions INTEGER NOT NULL,
    deletions INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commit_hash) REFERENCES commits(hash)
);

-- Hotspots
CREATE TABLE IF NOT EXISTS hotspots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    churn_score REAL NOT NULL,
    complexity_score REAL NOT NULL,
    last_modified TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repository_id) REFERENCES repositories(id),
    UNIQUE(repository_id, file_path)
);

-- Pull Requests
CREATE TABLE IF NOT EXISTS pull_requests (
    number INTEGER NOT NULL,
    repository_id TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    merged_at TIMESTAMP,
    complexity_delta REAL NOT NULL,
    impact_level TEXT NOT NULL,
    PRIMARY KEY (repository_id, number),
    FOREIGN KEY (repository_id) REFERENCES repositories(id)
);
