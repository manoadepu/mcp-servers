// MCP Tool types for Project Management

// Sprint Management Tools

export interface GetSprintStatusRequest {
  projectId: string;
  sprintId?: string;
}

export interface GetSprintStatusResponse {
  sprint: {
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    progress: number;
    totalPoints: number;
    completedPoints: number;
    remainingPoints: number;
  };
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    assignee: string;
    storyPoints: number;
  }>;
  blockers: Array<{
    taskId: string;
    reason: string;
    impact: string;
  }>;
}

export interface GetSprintMetricsRequest {
  sprintId: string;
  includeVelocity?: boolean;
  includeBurndown?: boolean;
}

export interface GetSprintMetricsResponse {
  velocity: {
    current: number;
    average: number;
    trend: string;
  };
  burndown: {
    dataPoints: Array<{
      date: string;
      remainingPoints: number;
      completedPoints: number;
    }>;
    idealLine: Array<{
      date: string;
      expectedPoints: number;
    }>;
    completion: {
      predicted: string;
      risk: string;
    };
  };
  completion: {
    rate: number;
    trend: string;
    forecast: string;
  };
}

// Resource Management Tools

export interface GetTeamCapacityRequest {
  teamId: string;
  timeframe: 'current' | 'next_sprint' | 'next_quarter';
}

export interface GetTeamCapacityResponse {
  capacity: {
    total: number;
    allocated: number;
    available: number;
  };
  members: Array<{
    id: string;
    name: string;
    allocation: number;
    availability: number;
    skills: string[];
  }>;
  skills: Array<{
    name: string;
    demand: number;
    availability: number;
  }>;
}

export interface GetResourceForecastRequest {
  projectId: string;
  timeline: string;
  includeSkills?: boolean;
}

export interface GetResourceForecastResponse {
  timeline: Array<{
    date: string;
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

// Project Health Tools

export interface GetProjectHealthRequest {
  projectId: string;
  metrics: Array<'progress' | 'risks' | 'dependencies' | 'velocity'>;
}

export interface GetProjectHealthResponse {
  progress: {
    completed: number;
    remaining: number;
    timeline: {
      onTrack: boolean;
      deviation: number;
    };
  };
  risks: {
    level: string;
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
    trend: string;
    forecast: string;
  };
}

export interface GetDependencyStatusRequest {
  projectId: string;
  status: Array<'blocked' | 'at_risk' | 'on_track'>;
}

export interface GetDependencyStatusResponse {
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
    risk: string;
  }>;
  recommendations: string[];
}

// Tool Definitions

export const SprintManagementTools = {
  get_sprint_status: {
    name: 'get_sprint_status',
    description: 'Get current sprint status and metrics',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string' },
        sprintId: { type: 'string', optional: true }
      }
    }
  },
  get_sprint_metrics: {
    name: 'get_sprint_metrics',
    description: 'Get detailed sprint performance metrics',
    inputSchema: {
      type: 'object',
      properties: {
        sprintId: { type: 'string' },
        includeVelocity: { type: 'boolean', default: true },
        includeBurndown: { type: 'boolean', default: true }
      }
    }
  }
};

export const ResourceManagementTools = {
  get_team_capacity: {
    name: 'get_team_capacity',
    description: 'Get team capacity and allocation',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: { type: 'string' },
        timeframe: { 
          type: 'string',
          enum: ['current', 'next_sprint', 'next_quarter']
        }
      }
    }
  },
  get_resource_forecast: {
    name: 'get_resource_forecast',
    description: 'Get resource allocation forecast',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string' },
        timeline: { type: 'string', format: 'date' },
        includeSkills: { type: 'boolean', default: true }
      }
    }
  }
};

export const ProjectHealthTools = {
  get_project_health: {
    name: 'get_project_health',
    description: 'Get overall project health metrics',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string' },
        metrics: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['progress', 'risks', 'dependencies', 'velocity']
          }
        }
      }
    }
  },
  get_dependency_status: {
    name: 'get_dependency_status',
    description: 'Get project dependencies and blockers',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string' },
        status: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['blocked', 'at_risk', 'on_track']
          }
        }
      }
    }
  }
};
