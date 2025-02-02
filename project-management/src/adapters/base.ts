import {
  ProjectManagementTool,
  ProjectManagementError,
  TaskManagement,
  SprintManagement,
  ResourceManagement,
  Task,
  Sprint,
  TeamCapacity,
  TaskDetails,
  TaskFilters,
  SprintDetails,
  SprintMetrics,
  ResourceMetrics,
  ResourceForecast
} from '../types.js';

export interface ToolConfig {
  host?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  projectKey?: string;
  additionalConfig?: Record<string, any>;
}

/**
 * Base adapter class for project management tool integrations
 */
export abstract class ProjectToolAdapter implements ProjectManagementTool {
  abstract name: string;
  abstract capabilities: string[];
  
  protected config: ToolConfig;
  protected client: any;
  protected connected: boolean = false;

  constructor(config: ToolConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;

  protected handleError(error: any, operation: string): ProjectManagementError {
    console.error(`Error in ${this.name} during ${operation}:`, error);
    
    return {
      name: 'ProjectManagementError',
      message: error.message || `Operation ${operation} failed`,
      code: error.code || 'OPERATION_FAILED',
      details: error,
      tool: this.name
    };
  }

  protected validateConnection(): void {
    if (!this.connected) {
      throw this.handleError(
        new Error('Not connected to project management tool'),
        'validateConnection'
      );
    }
  }
}

/**
 * Base adapter class with task management capabilities
 */
export abstract class TaskManagementAdapter extends ProjectToolAdapter implements TaskManagement {
  abstract createTask(details: TaskDetails): Promise<Task>;
  abstract updateTask(id: string, updates: Partial<TaskDetails>): Promise<Task>;
  abstract getTasks(filters: TaskFilters): Promise<Task[]>;
  abstract assignTask(taskId: string, userId: string): Promise<void>;

  protected validateTaskDetails(details: TaskDetails): void {
    if (!details.title) {
      throw this.handleError(
        new Error('Task title is required'),
        'validateTaskDetails'
      );
    }
  }
}

/**
 * Base adapter class with sprint management capabilities
 */
export abstract class SprintManagementAdapter extends ProjectToolAdapter implements SprintManagement {
  abstract createSprint(details: SprintDetails): Promise<Sprint>;
  abstract updateSprint(id: string, updates: Partial<SprintDetails>): Promise<Sprint>;
  abstract getCurrentSprint(): Promise<Sprint>;
  abstract getSprintMetrics(sprintId: string): Promise<SprintMetrics>;

  protected validateSprintDetails(details: SprintDetails): void {
    if (!details.name || !details.startDate || !details.endDate) {
      throw this.handleError(
        new Error('Sprint name, start date, and end date are required'),
        'validateSprintDetails'
      );
    }

    if (details.startDate >= details.endDate) {
      throw this.handleError(
        new Error('Sprint end date must be after start date'),
        'validateSprintDetails'
      );
    }
  }
}

/**
 * Base adapter class with resource management capabilities
 */
export abstract class ResourceManagementAdapter extends ProjectToolAdapter implements ResourceManagement {
  abstract getTeamCapacity(): Promise<TeamCapacity>;
  abstract getResourceMetrics(): Promise<ResourceMetrics>;
  abstract forecastResourceNeeds(timeline: Date): Promise<ResourceForecast>;

  protected validateTimeline(timeline: Date): void {
    if (timeline <= new Date()) {
      throw this.handleError(
        new Error('Forecast timeline must be in the future'),
        'validateTimeline'
      );
    }
  }
}

/**
 * Full-featured adapter base class with all capabilities
 */
export abstract class FullProjectManagementAdapter extends ProjectToolAdapter 
  implements TaskManagement, SprintManagement, ResourceManagement {
  
  // Task Management
  abstract createTask(details: TaskDetails): Promise<Task>;
  abstract updateTask(id: string, updates: Partial<TaskDetails>): Promise<Task>;
  abstract getTasks(filters: TaskFilters): Promise<Task[]>;
  abstract assignTask(taskId: string, userId: string): Promise<void>;

  // Sprint Management
  abstract createSprint(details: SprintDetails): Promise<Sprint>;
  abstract updateSprint(id: string, updates: Partial<SprintDetails>): Promise<Sprint>;
  abstract getCurrentSprint(): Promise<Sprint>;
  abstract getSprintMetrics(sprintId: string): Promise<SprintMetrics>;

  // Resource Management
  abstract getTeamCapacity(): Promise<TeamCapacity>;
  abstract getResourceMetrics(): Promise<ResourceMetrics>;
  abstract forecastResourceNeeds(timeline: Date): Promise<ResourceForecast>;

  protected validateAll(): void {
    this.validateConnection();
    // Add any additional validation needed for full-featured adapters
  }
}
