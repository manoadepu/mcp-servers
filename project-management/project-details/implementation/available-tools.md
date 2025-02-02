# Project Management MCP Tools

## Sprint Management Tools

### get_sprint_status
Get current sprint status and metrics.

**Input:**
```typescript
{
  projectId: string;      // Required: Project identifier
  sprintId?: string;      // Optional: Specific sprint ID (defaults to current sprint)
}
```

**Output:**
```typescript
{
  sprint: {
    name: string;
    status: SprintStatus;
    startDate: string;    // ISO date string
    endDate: string;      // ISO date string
    progress: number;     // Percentage complete
    totalPoints: number;
    completedPoints: number;
    remainingPoints: number;
  };
  tasks: Array<{
    id: string;
    title: string;
    status: TaskStatus;
    assignee: string;
    storyPoints: number;
  }>;
  blockers: Array<{
    taskId: string;
    reason: string;
    impact: string;
  }>;
}
```

### get_sprint_metrics
Get detailed sprint performance metrics.

**Input:**
```typescript
{
  sprintId: string;           // Required: Sprint identifier
  includeVelocity?: boolean;  // Optional: Include velocity metrics (default: true)
  includeBurndown?: boolean;  // Optional: Include burndown data (default: true)
}
```

**Output:**
```typescript
{
  velocity: {
    current: number;
    average: number;
    trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  };
  burndown: {
    dataPoints: Array<{
      date: string;           // ISO date string
      remainingPoints: number;
      completedPoints: number;
    }>;
    idealLine: Array<{
      date: string;          // ISO date string
      expectedPoints: number;
    }>;
    completion: {
      predicted: string;     // ISO date string
      risk: 'HIGH' | 'LOW';
    };
  };
  completion: {
    rate: number;           // Percentage
    trend: 'AHEAD' | 'ON_TRACK' | 'BEHIND';
    forecast: string;       // ISO date string
  };
}
```

## Resource Management Tools

### get_team_capacity
Get team capacity and allocation information.

**Input:**
```typescript
{
  teamId: string;                                   // Required: Team identifier
  timeframe: 'current' | 'next_sprint' | 'next_quarter';  // Required: Time period
}
```

**Output:**
```typescript
{
  capacity: {
    total: number;      // Total team capacity in hours/points
    allocated: number;  // Currently allocated capacity
    available: number;  // Remaining available capacity
  };
  members: Array<{
    id: string;
    name: string;
    allocation: number; // Current allocation percentage
    availability: number; // Available capacity
    skills: string[];   // Technical skills
  }>;
  skills: Array<{
    name: string;
    demand: number;     // Required capacity
    availability: number; // Available capacity
  }>;
}
```

### get_resource_forecast
Get resource allocation forecast.

**Input:**
```typescript
{
  projectId: string;     // Required: Project identifier
  timeline: string;      // Required: Start date (ISO string)
  includeSkills?: boolean; // Optional: Include skills forecast (default: true)
}
```

**Output:**
```typescript
{
  timeline: Array<{
    date: string;        // ISO date string
    requiredCapacity: number;
    availableCapacity: number;
    skills: Array<{
      name: string;
      demand: number;
      availability: number;
    }>;
  }>;
  recommendations: string[];
  risks: string[];
}
```

## Project Health Tools

### get_project_health
Get overall project health metrics.

**Input:**
```typescript
{
  projectId: string;
  metrics: Array<'progress' | 'risks' | 'dependencies' | 'velocity'>;
}
```

**Output:**
```typescript
{
  progress: {
    completed: number;
    remaining: number;
    timeline: {
      onTrack: boolean;
      deviation: number;  // Days ahead/behind
    };
  };
  risks: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    factors: string[];
    mitigation: string[];
  };
  dependencies: {
    total: number;
    blocked: number;
    critical: number;
    items: Array<{
      id: string;
      type: string;
      status: string;
      impact: string;
    }>;
  };
  velocity: {
    current: number;
    trend: 'INCREASING' | 'STABLE' | 'DECREASING';
    forecast: string;    // ISO date string
  };
}
```

### get_dependency_status
Get project dependencies and blockers.

**Input:**
```typescript
{
  projectId: string;
  status: Array<'blocked' | 'at_risk' | 'on_track'>;
}
```

**Output:**
```typescript
{
  dependencies: Array<{
    id: string;
    type: string;
    status: string;
    impact: string;
    resolution: string;
  }>;
  criticalPath: Array<{
    task: string;
    dependencies: string[];
    risk: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  recommendations: string[];
}
```

## Usage Examples

### Get Current Sprint Status
```typescript
const result = await use_mcp_tool({
  server_name: "project-management",
  tool_name: "get_sprint_status",
  arguments: {
    projectId: "project-123"
  }
});
```

### Get Team Capacity
```typescript
const result = await use_mcp_tool({
  server_name: "project-management",
  tool_name: "get_team_capacity",
  arguments: {
    teamId: "team-456",
    timeframe: "current"
  }
});
```

### Get Project Health
```typescript
const result = await use_mcp_tool({
  server_name: "project-management",
  tool_name: "get_project_health",
  arguments: {
    projectId: "project-123",
    metrics: ["progress", "risks", "dependencies"]
  }
});
