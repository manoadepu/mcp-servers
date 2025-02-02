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

-- Project Management Tables
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    start_date DATETIME,
    target_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    name TEXT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    goals TEXT,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sprint_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    assignee TEXT,
    story_points INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id)
);

CREATE TABLE IF NOT EXISTS task_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    depends_on_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (depends_on_id) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    skills TEXT,
    availability REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sprint_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sprint_id INTEGER,
    total_points INTEGER,
    completed_points INTEGER,
    remaining_points INTEGER,
    velocity REAL,
    burndown_data TEXT, -- JSON string of daily remaining points
    completion_forecast DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id)
);

CREATE TABLE IF NOT EXISTS resource_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    date DATETIME NOT NULL,
    utilization REAL,
    availability REAL,
    skills_data TEXT, -- JSON string of skill metrics
    forecast_data TEXT, -- JSON string of resource forecasts
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_commits_repo ON commits(repository_id);
CREATE INDEX IF NOT EXISTS idx_file_metrics_repo ON file_metrics(repository_id);
CREATE INDEX IF NOT EXISTS idx_file_changes_commit ON file_changes(commit_id);
CREATE INDEX IF NOT EXISTS idx_hotspots_repo ON hotspots(repository_id);
CREATE INDEX IF NOT EXISTS idx_pull_requests_repo ON pull_requests(repository_id);
CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_metrics_sprint ON sprint_metrics(sprint_id);
CREATE INDEX IF NOT EXISTS idx_resource_metrics_project ON resource_metrics(project_id);
