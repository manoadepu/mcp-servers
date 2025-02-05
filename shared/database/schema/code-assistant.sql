-- Code Assistant Tables
CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id INTEGER,
    hash TEXT NOT NULL,
    author TEXT NOT NULL,
    message TEXT,
    timestamp DATETIME,
    analyzed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (repository_id) REFERENCES repositories(id)
);

CREATE TABLE IF NOT EXISTS file_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id INTEGER,
    commit_id INTEGER,
    file_path TEXT NOT NULL,
    complexity INTEGER,
    lines_of_code INTEGER,
    test_coverage REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repository_id) REFERENCES repositories(id),
    FOREIGN KEY (commit_id) REFERENCES commits(id)
);

CREATE TABLE IF NOT EXISTS file_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commit_id INTEGER,
    file_path TEXT NOT NULL,
    lines_added INTEGER,
    lines_removed INTEGER,
    complexity_delta INTEGER,
    FOREIGN KEY (commit_id) REFERENCES commits(id)
);

CREATE TABLE IF NOT EXISTS hotspots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id INTEGER,
    file_path TEXT NOT NULL,
    change_frequency INTEGER,
    last_modified DATETIME,
    risk_score REAL,
    FOREIGN KEY (repository_id) REFERENCES repositories(id)
);

CREATE TABLE IF NOT EXISTS pull_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_id INTEGER,
    pr_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    complexity_score REAL,
    risk_score REAL,
    FOREIGN KEY (repository_id) REFERENCES repositories(id)
);

-- Code Assistant Indexes
CREATE INDEX IF NOT EXISTS idx_commits_repo ON commits(repository_id);
CREATE INDEX IF NOT EXISTS idx_file_metrics_repo ON file_metrics(repository_id);
CREATE INDEX IF NOT EXISTS idx_file_changes_commit ON file_changes(commit_id);
CREATE INDEX IF NOT EXISTS idx_hotspots_repo ON hotspots(repository_id);
CREATE INDEX IF NOT EXISTS idx_pull_requests_repo ON pull_requests(repository_id);
