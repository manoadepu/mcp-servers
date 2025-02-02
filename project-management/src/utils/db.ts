import { DatabaseConnection } from '@shared/db.js';
import {
  DatabaseError,
  DatabaseErrorType,
  ValidationError,
  ValidationErrorType
} from '../types/errors.js';
import {
  Project, Team, TeamMember, Sprint, Task, SprintMetrics, ResourceMetrics,
  ProjectRow, TeamRow, TeamMemberRow, SprintRow, TaskRow,
  SprintMetricsRow, ResourceMetricsRow
} from '../types/models.js';

/**
 * Database utility functions for Project Management
 */
export class ProjectManagementDB {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async connect(): Promise<void> {
    await this.db.connect();
  }

  async disconnect(): Promise<void> {
    await this.db.disconnect();
  }

  // Project operations

  async getProject(id: string): Promise<Project> {
    try {
      const row = await this.db.get<ProjectRow>(
        'SELECT * FROM projects WHERE id = ?',
        [id]
      );

      if (!row) {
        throw new ValidationError(
          ValidationErrorType.INVALID_PROJECT_ID,
          `Project not found: ${id}`
        );
      }

      return this.mapProjectRow(row);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(
        DatabaseErrorType.QUERY_ERROR,
        `Failed to get project: ${error.message}`
      );
    }
  }

  // Sprint operations

  async getSprint(id: string): Promise<Sprint> {
    try {
      const row = await this.db.get<SprintRow>(
        'SELECT * FROM sprints WHERE id = ?',
        [id]
      );

      if (!row) {
        throw new ValidationError(
          ValidationErrorType.INVALID_SPRINT_ID,
          `Sprint not found: ${id}`
        );
      }

      return this.mapSprintRow(row);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(
        DatabaseErrorType.QUERY_ERROR,
        `Failed to get sprint: ${error.message}`
      );
    }
  }

  async getCurrentSprint(projectId: string): Promise<Sprint> {
    try {
      const row = await this.db.get<SprintRow>(
        `SELECT * FROM sprints 
         WHERE project_id = ? AND status = 'ACTIVE'
         ORDER BY start_date DESC
         LIMIT 1`,
        [projectId]
      );

      if (!row) {
        throw new ValidationError(
          ValidationErrorType.INVALID_SPRINT_ID,
          `No active sprint found for project: ${projectId}`
        );
      }

      return this.mapSprintRow(row);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(
        DatabaseErrorType.QUERY_ERROR,
        `Failed to get current sprint: ${error.message}`
      );
    }
  }

  async getSprintTasks(sprintId: string): Promise<Task[]> {
    try {
      const rows = await this.db.query<TaskRow>(
        'SELECT * FROM tasks WHERE sprint_id = ?',
        [sprintId]
      );

      return rows.map(row => this.mapTaskRow(row));
    } catch (error: any) {
      throw new DatabaseError(
        DatabaseErrorType.QUERY_ERROR,
        `Failed to get sprint tasks: ${error.message}`
      );
    }
  }

  async getSprintMetrics(sprintId: string): Promise<SprintMetrics> {
    try {
      const row = await this.db.get<SprintMetricsRow>(
        'SELECT * FROM sprint_metrics WHERE sprint_id = ?',
        [sprintId]
      );

      if (!row) {
        throw new ValidationError(
          ValidationErrorType.INVALID_SPRINT_ID,
          `No metrics found for sprint: ${sprintId}`
        );
      }

      return {
        id: row.id,
        sprintId: row.sprint_id,
        totalPoints: row.total_points,
        completedPoints: row.completed_points,
        remainingPoints: row.remaining_points,
        velocity: row.velocity,
        burndownData: JSON.parse(row.burndown_data),
        createdAt: new Date(row.created_at)
      };
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(
        DatabaseErrorType.QUERY_ERROR,
        `Failed to get sprint metrics: ${error.message}`
      );
    }
  }

  // Team operations

  async getTeam(id: string): Promise<Team> {
    try {
      const row = await this.db.get<TeamRow>(
        'SELECT * FROM teams WHERE id = ?',
        [id]
      );

      if (!row) {
        throw new ValidationError(
          ValidationErrorType.INVALID_TEAM_ID,
          `Team not found: ${id}`
        );
      }

      return this.mapTeamRow(row);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(
        DatabaseErrorType.QUERY_ERROR,
        `Failed to get team: ${error.message}`
      );
    }
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const rows = await this.db.query<TeamMemberRow>(
        'SELECT * FROM team_members WHERE team_id = ?',
        [teamId]
      );

      return rows.map(row => ({
        id: row.id,
        teamId: row.team_id,
        name: row.name,
        role: row.role,
        skills: JSON.parse(row.skills),
        availability: row.availability,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.created_at)
      }));
    } catch (error: any) {
      throw new DatabaseError(
        DatabaseErrorType.QUERY_ERROR,
        `Failed to get team members: ${error.message}`
      );
    }
  }

  async getResourceMetrics(teamId: string): Promise<ResourceMetrics> {
    try {
      const row = await this.db.get<ResourceMetricsRow>(
        'SELECT * FROM resource_metrics WHERE team_id = ? ORDER BY date DESC LIMIT 1',
        [teamId]
      );

      if (!row) {
        throw new ValidationError(
          ValidationErrorType.INVALID_TEAM_ID,
          `No metrics found for team: ${teamId}`
        );
      }

      return {
        id: row.id,
        teamId: row.team_id,
        date: new Date(row.date),
        utilization: row.utilization,
        availability: row.availability,
        skillsData: JSON.parse(row.skills_data),
        createdAt: new Date(row.created_at)
      };
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(
        DatabaseErrorType.QUERY_ERROR,
        `Failed to get resource metrics: ${error.message}`
      );
    }
  }

  // Mapping functions

  private mapProjectRow(row: ProjectRow): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status as any,
      startDate: new Date(row.start_date),
      targetDate: new Date(row.target_date),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapTeamRow(row: TeamRow): Team {
    return {
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      capacity: row.capacity,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapSprintRow(row: SprintRow): Sprint {
    return {
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      status: row.status as any,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      goals: JSON.parse(row.goals),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapTaskRow(row: TaskRow): Task {
    return {
      id: row.id,
      sprintId: row.sprint_id,
      title: row.title,
      description: row.description,
      status: row.status as any,
      priority: row.priority as any,
      assigneeId: row.assignee_id || undefined,
      storyPoints: row.story_points || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
