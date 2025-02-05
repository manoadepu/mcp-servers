-- Migration: Insert Test Data
-- Description: Adds sample project management data for testing
-- Timestamp: 2025-03-01 00:00:01

-- Up Migration
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

-- Down Migration
DELETE FROM resource_metrics WHERE team_id = 'team-001';
DELETE FROM sprint_metrics WHERE sprint_id = 'sprint-001';
DELETE FROM tasks WHERE sprint_id = 'sprint-001';
DELETE FROM sprints WHERE project_id = 'proj-001';
DELETE FROM team_members WHERE team_id = 'team-001';
DELETE FROM teams WHERE project_id = 'proj-001';
DELETE FROM projects WHERE id = 'proj-001';
