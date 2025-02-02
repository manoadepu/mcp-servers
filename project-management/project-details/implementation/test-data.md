# Test Data for MCP Tools

## Sample Project Data

### Project
```json
{
  "id": "proj-001",
  "name": "Mobile App Development",
  "description": "Cross-platform mobile app development project",
  "status": "ACTIVE",
  "startDate": "2025-01-01",
  "targetDate": "2025-06-30"
}
```

### Sprint
```json
{
  "id": "sprint-001",
  "projectId": "proj-001",
  "name": "Sprint 1",
  "status": "ACTIVE",
  "startDate": "2025-01-15",
  "endDate": "2025-01-29",
  "goals": {
    "objectives": [
      "Complete user authentication",
      "Implement basic navigation"
    ],
    "successCriteria": [
      "All unit tests passing",
      "UI/UX review approved"
    ]
  }
}
```

### Tasks
```json
[
  {
    "id": "task-001",
    "sprintId": "sprint-001",
    "title": "Setup Authentication Flow",
    "description": "Implement user login and registration",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "assigneeId": "user-001",
    "storyPoints": 5
  },
  {
    "id": "task-002",
    "sprintId": "sprint-001",
    "title": "Design Navigation Menu",
    "description": "Create responsive navigation menu",
    "status": "BLOCKED",
    "priority": "MEDIUM",
    "assigneeId": "user-002",
    "storyPoints": 3
  },
  {
    "id": "task-003",
    "sprintId": "sprint-001",
    "title": "Implement Settings Screen",
    "description": "Create user settings interface",
    "status": "TODO",
    "priority": "LOW",
    "assigneeId": null,
    "storyPoints": 2
  }
]
```

### Team
```json
{
  "id": "team-001",
  "projectId": "proj-001",
  "name": "Mobile Team",
  "capacity": 40
}
```

### Team Members
```json
[
  {
    "id": "user-001",
    "teamId": "team-001",
    "name": "John Doe",
    "role": "Senior Developer",
    "skills": {
      "technical": ["React Native", "TypeScript", "Node.js"],
      "domain": ["Mobile Development", "API Integration"],
      "soft": ["Leadership", "Communication"]
    },
    "availability": 100
  },
  {
    "id": "user-002",
    "teamId": "team-001",
    "name": "Jane Smith",
    "role": "UI/UX Designer",
    "skills": {
      "technical": ["Figma", "Adobe XD", "CSS"],
      "domain": ["Mobile Design", "User Research"],
      "soft": ["Creativity", "Collaboration"]
    },
    "availability": 80
  }
]
```

### Sprint Metrics
```json
{
  "id": "metrics-001",
  "sprintId": "sprint-001",
  "totalPoints": 10,
  "completedPoints": 3,
  "remainingPoints": 7,
  "velocity": 15,
  "burndownData": {
    "dataPoints": [
      {
        "date": "2025-01-15",
        "remainingPoints": 10,
        "completedPoints": 0
      },
      {
        "date": "2025-01-20",
        "remainingPoints": 7,
        "completedPoints": 3
      }
    ],
    "idealLine": [
      {
        "date": "2025-01-15",
        "expectedPoints": 10
      },
      {
        "date": "2025-01-29",
        "expectedPoints": 0
      }
    ]
  }
}
```

### Resource Metrics
```json
{
  "id": "resource-001",
  "teamId": "team-001",
  "date": "2025-01-20",
  "utilization": 85,
  "availability": 90,
  "skillsData": {
    "skills": [
      {
        "name": "React Native",
        "demand": 40,
        "availability": 35
      },
      {
        "name": "UI/UX Design",
        "demand": 30,
        "availability": 25
      }
    ],
    "gaps": [
      {
        "skill": "React Native",
        "shortage": 5
      },
      {
        "skill": "UI/UX Design",
        "shortage": 5
      }
    ]
  }
}
```

## Testing MCP Tools

### 1. Get Sprint Status
```typescript
// Test command
const result = await use_mcp_tool({
  server_name: "project-management",
  tool_name: "get_sprint_status",
  arguments: {
    projectId: "proj-001"
  }
});

// Expected output
{
  sprint: {
    name: "Sprint 1",
    status: "ACTIVE",
    startDate: "2025-01-15T00:00:00.000Z",
    endDate: "2025-01-29T00:00:00.000Z",
    progress: 30,
    totalPoints: 10,
    completedPoints: 3,
    remainingPoints: 7
  },
  tasks: [
    {
      id: "task-001",
      title: "Setup Authentication Flow",
      status: "IN_PROGRESS",
      assignee: "John Doe",
      storyPoints: 5
    },
    // ... other tasks
  ],
  blockers: [
    {
      taskId: "task-002",
      reason: "Dependency not met",
      impact: "Sprint completion at risk"
    }
  ]
}
```

### 2. Get Team Capacity
```typescript
// Test command
const result = await use_mcp_tool({
  server_name: "project-management",
  tool_name: "get_team_capacity",
  arguments: {
    teamId: "team-001",
    timeframe: "current"
  }
});

// Expected output
{
  capacity: {
    total: 40,
    allocated: 34,
    available: 6
  },
  members: [
    {
      id: "user-001",
      name: "John Doe",
      allocation: 100,
      availability: 0,
      skills: ["React Native", "TypeScript", "Node.js"]
    },
    // ... other members
  ],
  skills: [
    {
      name: "React Native",
      demand: 40,
      availability: 35
    },
    // ... other skills
  ]
}
```

### 3. Get Project Health
```typescript
// Test command
const result = await use_mcp_tool({
  server_name: "project-management",
  tool_name: "get_project_health",
  arguments: {
    projectId: "proj-001",
    metrics: ["progress", "risks", "dependencies"]
  }
});

// Expected output
{
  progress: {
    completed: 3,
    remaining: 7,
    timeline: {
      onTrack: true,
      deviation: 0
    }
  },
  risks: {
    level: "MEDIUM",
    factors: ["1 blocked task"],
    mitigation: ["Review blocked tasks in daily standup"]
  },
  dependencies: {
    total: 3,
    blocked: 1,
    critical: 0,
    items: [
      {
        id: "task-002",
        type: "BLOCKED",
        status: "BLOCKED",
        impact: "Sprint completion at risk"
      }
    ]
  }
}
```

## Database Setup

The test data can be loaded using the provided SQL script:

```bash
sqlite3 data/project-management.db < init-db.sql
```

This will create the database with the sample data ready for testing the MCP tools.
