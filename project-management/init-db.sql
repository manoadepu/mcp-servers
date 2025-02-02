-- Create tables
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    start_date TEXT NOT NULL,
    target_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    skills TEXT NOT NULL, -- JSON
    availability INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS sprints (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    goals TEXT NOT NULL, -- JSON
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    sprint_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    assignee_id TEXT,
    story_points INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id),
    FOREIGN KEY (assignee_id) REFERENCES team_members(id)
);

CREATE TABLE IF NOT EXISTS sprint_metrics (
    id TEXT PRIMARY KEY,
    sprint_id TEXT NOT NULL,
    total_points INTEGER NOT NULL,
    completed_points INTEGER NOT NULL,
    remaining_points INTEGER NOT NULL,
    velocity INTEGER NOT NULL,
    burndown_data TEXT NOT NULL, -- JSON
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id)
);

CREATE TABLE IF NOT EXISTS resource_metrics (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    date TEXT NOT NULL,
    utilization INTEGER NOT NULL,
    availability INTEGER NOT NULL,
    skills_data TEXT NOT NULL, -- JSON
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Insert test data
INSERT INTO projects (id, name, description, status, start_date, target_date)
VALUES (
    'proj-001',
    'Mobile App Development',
    'Cross-platform mobile app development project',
    'ACTIVE',
    '2025-01-01',
    '2025-06-30'
);

INSERT INTO teams (id, project_id, name, capacity)
VALUES (
    'team-001',
    'proj-001',
    'Mobile Team',
    40
);

INSERT INTO team_members (id, team_id, name, role, skills, availability)
VALUES 
(
    'user-001',
    'team-001',
    'John Doe',
    'Senior Developer',
    '{"technical":["React Native","TypeScript","Node.js"],"domain":["Mobile Development","API Integration"],"soft":["Leadership","Communication"]}',
    100
),
(
    'user-002',
    'team-001',
    'Jane Smith',
    'UI/UX Designer',
    '{"technical":["Figma","Adobe XD","CSS"],"domain":["Mobile Design","User Research"],"soft":["Creativity","Collaboration"]}',
    80
);

INSERT INTO sprints (id, project_id, name, status, start_date, end_date, goals)
VALUES (
    'sprint-001',
    'proj-001',
    'Sprint 1',
    'ACTIVE',
    '2025-01-15',
    '2025-01-29',
    '{"objectives":["Complete user authentication","Implement basic navigation"],"successCriteria":["All unit tests passing","UI/UX review approved"]}'
);

INSERT INTO tasks (id, sprint_id, title, description, status, priority, assignee_id, story_points)
VALUES 
(
    'task-001',
    'sprint-001',
    'Setup Authentication Flow',
    'Implement user login and registration',
    'IN_PROGRESS',
    'HIGH',
    'user-001',
    5
),
(
    'task-002',
    'sprint-001',
    'Design Navigation Menu',
    'Create responsive navigation menu',
    'BLOCKED',
    'MEDIUM',
    'user-002',
    3
),
(
    'task-003',
    'sprint-001',
    'Implement Settings Screen',
    'Create user settings interface',
    'TODO',
    'LOW',
    NULL,
    2
);

INSERT INTO sprint_metrics (id, sprint_id, total_points, completed_points, remaining_points, velocity, burndown_data)
VALUES (
    'metrics-001',
    'sprint-001',
    10,
    3,
    7,
    15,
    '{"dataPoints":[{"date":"2025-01-15","remainingPoints":10,"completedPoints":0},{"date":"2025-01-20","remainingPoints":7,"completedPoints":3}],"idealLine":[{"date":"2025-01-15","expectedPoints":10},{"date":"2025-01-29","expectedPoints":0}]}'
);

INSERT INTO resource_metrics (id, team_id, date, utilization, availability, skills_data)
VALUES (
    'resource-001',
    'team-001',
    '2025-01-20',
    85,
    90,
    '{"skills":[{"name":"React Native","demand":40,"availability":35},{"name":"UI/UX Design","demand":30,"availability":25}],"gaps":[{"skill":"React Native","shortage":5},{"skill":"UI/UX Design","shortage":5}]}'
);
