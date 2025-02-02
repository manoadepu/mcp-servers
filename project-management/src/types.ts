// Core interfaces for project management entities

export interface User {
  id: string;
  name: string;
  role: string;
  skills: string[];
  availability: number; // percentage
  currentProjects: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee?: string;
  storyPoints?: number;
  dependencies: string[];
  labels: string[];
  created: Date;
  updated: Date;
  dueDate?: Date;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goals: string[];
  tasks: Task[];
  status: SprintStatus;
  metrics: SprintMetrics;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  targetDate: Date;
  team: User[];
  sprints: Sprint[];
  metrics: ProjectMetrics;
}

export interface TeamCapacity {
  totalCapacity: number;
  allocatedCapacity: number;
  availableCapacity: number;
  members: Array<{
    userId: string;
    allocation: number;
    projects: string[];
  }>;
}

export interface SprintMetrics {
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  burndownData: Array<{
    date: Date;
    remainingPoints: number;
  }>;
  velocity: number;
  completionForecast: Date;
}

export interface ProjectMetrics {
  progress: number;
  healthScore: number;
  riskLevel: RiskLevel;
  velocity: number;
  burndownData: Array<{
    date: Date;
    remainingWork: number;
  }>;
  dependencies: {
    total: number;
    blocked: number;
    critical: number;
  };
}

export interface ResourceMetrics {
  utilization: number;
  availability: number;
  skills: Array<{
    name: string;
    demand: number;
    availability: number;
  }>;
  forecast: Array<{
    date: Date;
    demand: number;
    capacity: number;
  }>;
}

// Enums
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum SprintStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Tool integration interfaces
export interface ProjectManagementTool {
  name: string;
  capabilities: string[];
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export interface TaskManagement {
  createTask(details: TaskDetails): Promise<Task>;
  updateTask(id: string, updates: Partial<TaskDetails>): Promise<Task>;
  getTasks(filters: TaskFilters): Promise<Task[]>;
  assignTask(taskId: string, userId: string): Promise<void>;
}

export interface SprintManagement {
  createSprint(details: SprintDetails): Promise<Sprint>;
  updateSprint(id: string, updates: Partial<SprintDetails>): Promise<Sprint>;
  getCurrentSprint(): Promise<Sprint>;
  getSprintMetrics(sprintId: string): Promise<SprintMetrics>;
}

export interface ResourceManagement {
  getTeamCapacity(): Promise<TeamCapacity>;
  getResourceMetrics(): Promise<ResourceMetrics>;
  forecastResourceNeeds(timeline: Date): Promise<ResourceForecast>;
}

// Request/Response types
export interface TaskDetails {
  title: string;
  description: string;
  priority: Priority;
  storyPoints?: number;
  dependencies?: string[];
  labels?: string[];
  dueDate?: Date;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: Priority[];
  assignee?: string;
  sprint?: string;
  labels?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SprintDetails {
  name: string;
  startDate: Date;
  endDate: Date;
  goals: string[];
}

export interface ResourceForecast {
  timeline: Array<{
    date: Date;
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

// Error types
export interface ProjectManagementError extends Error {
  code: string;
  details: any;
  tool?: string;
}
