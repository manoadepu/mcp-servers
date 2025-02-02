// Core model types for Project Management

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  targetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  projectId: string;
  name: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  name: string;
  role: string;
  skills: Skills;
  availability: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  status: SprintStatus;
  startDate: Date;
  endDate: Date;
  goals: SprintGoals;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  sprintId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  storyPoints?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  createdAt: Date;
}

export interface TaskLabel {
  id: string;
  taskId: string;
  name: string;
  createdAt: Date;
}

export interface SprintMetrics {
  id: string;
  sprintId: string;
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  velocity: number;
  burndownData: BurndownData;
  createdAt: Date;
}

export interface ResourceMetrics {
  id: string;
  teamId: string;
  date: Date;
  utilization: number;
  availability: number;
  skillsData: SkillsData;
  createdAt: Date;
}

// Supporting types

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum SprintStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

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

export interface Skills {
  technical: string[];
  domain: string[];
  soft: string[];
}

export interface SprintGoals {
  objectives: string[];
  successCriteria: string[];
}

export interface BurndownData {
  dataPoints: Array<{
    date: Date;
    remainingPoints: number;
    completedPoints: number;
  }>;
  idealLine: Array<{
    date: Date;
    expectedPoints: number;
  }>;
}

export interface SkillsData {
  skills: Array<{
    name: string;
    demand: number;
    availability: number;
  }>;
  gaps: Array<{
    skill: string;
    shortage: number;
  }>;
}

// Database row types (for direct database operations)

export interface ProjectRow {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  target_date: string;
  created_at: string;
  updated_at: string;
}

export interface TeamRow {
  id: string;
  project_id: string;
  name: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberRow {
  id: string;
  team_id: string;
  name: string;
  role: string;
  skills: string; // JSON
  availability: number;
  created_at: string;
  updated_at: string;
}

export interface SprintRow {
  id: string;
  project_id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  goals: string; // JSON
  created_at: string;
  updated_at: string;
}

export interface TaskRow {
  id: string;
  sprint_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee_id: string | null;
  story_points: number | null;
  created_at: string;
  updated_at: string;
}

export interface SprintMetricsRow {
  id: string;
  sprint_id: string;
  total_points: number;
  completed_points: number;
  remaining_points: number;
  velocity: number;
  burndown_data: string; // JSON
  created_at: string;
}

export interface ResourceMetricsRow {
  id: string;
  team_id: string;
  date: string;
  utilization: number;
  availability: number;
  skills_data: string; // JSON
  created_at: string;
}
