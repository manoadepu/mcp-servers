# Database Schema Design

## Core Tables

### Projects
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED')),
  start_date TEXT NOT NULL,
  target_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Teams
```sql
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### Team Members
```sql
CREATE TABLE team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  skills JSON NOT NULL,
  availability INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

### Sprints
```sql
CREATE TABLE sprints (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT CHECK(status IN ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  goals JSON,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### Tasks
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  sprint_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE')),
  priority TEXT CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  assignee_id TEXT,
  story_points INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sprint_id) REFERENCES sprints(id),
  FOREIGN KEY (assignee_id) REFERENCES team_members(id)
);
```

## Relationship Tables

### Task Dependencies
```sql
CREATE TABLE task_dependencies (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  depends_on_task_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id)
);
```

### Task Labels
```sql
CREATE TABLE task_labels (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

## Metrics Tables

### Sprint Metrics
```sql
CREATE TABLE sprint_metrics (
  id TEXT PRIMARY KEY,
  sprint_id TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  completed_points INTEGER NOT NULL DEFAULT 0,
  remaining_points INTEGER NOT NULL DEFAULT 0,
  velocity REAL NOT NULL DEFAULT 0,
  burndown_data JSON,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sprint_id) REFERENCES sprints(id)
);
```

### Resource Metrics
```sql
CREATE TABLE resource_metrics (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  date TEXT NOT NULL,
  utilization INTEGER NOT NULL DEFAULT 0,
  availability INTEGER NOT NULL DEFAULT 0,
  skills_data JSON,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

## JSON Structures

### Skills JSON
```json
{
  "technical": ["typescript", "react", "node"],
  "domain": ["payments", "auth"],
  "soft": ["leadership", "communication"]
}
```

### Sprint Goals JSON
```json
{
  "objectives": [
    "Complete payment integration",
    "Improve test coverage"
  ],
  "success_criteria": [
    "All payment tests passing",
    "Coverage above 80%"
  ]
}
```

### Burndown Data JSON
```json
{
  "data_points": [
    {
      "date": "2025-02-01",
      "remaining_points": 34,
      "completed_points": 13
    }
  ],
  "ideal_line": [
    {
      "date": "2025-02-01",
      "expected_points": 40
    }
  ]
}
```

### Skills Data JSON
```json
{
  "skills": [
    {
      "name": "typescript",
      "demand": 80,
      "availability": 60
    }
  ],
  "gaps": [
    {
      "skill": "react",
      "shortage": 20
    }
  ]
}
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_sprints_project ON sprints(project_id);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX idx_sprint_metrics_sprint ON sprint_metrics(sprint_id);
CREATE INDEX idx_resource_metrics_team ON resource_metrics(team_id);

-- Status indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Date indexes
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);
CREATE INDEX idx_resource_metrics_date ON resource_metrics(date);
