import { ProjectManagementDB } from '../utils/db.js';
import {
  GetProjectHealthRequest,
  GetProjectHealthResponse,
  GetDependencyStatusRequest,
  GetDependencyStatusResponse
} from '../types/tools.js';
import { ValidationError, ValidationErrorType } from '../types/errors.js';
import { Task, Sprint, SprintMetrics } from '../types/models.js';

export class ProjectHandler {
  constructor(private db: ProjectManagementDB) {}

  async getProjectHealth(args: GetProjectHealthRequest): Promise<GetProjectHealthResponse> {
    const project = await this.db.getProject(args.projectId);
    const sprint = await this.db.getCurrentSprint(args.projectId);
    const tasks = await this.db.getSprintTasks(sprint.id);
    const metrics = await this.db.getSprintMetrics(sprint.id);

    const response: GetProjectHealthResponse = {
      progress: {
        completed: 0,
        remaining: 0,
        timeline: {
          onTrack: false,
          deviation: 0
        }
      },
      risks: {
        level: 'LOW',
        factors: [],
        mitigation: []
      },
      dependencies: {
        total: 0,
        blocked: 0,
        critical: 0,
        items: []
      },
      velocity: {
        current: 0,
        trend: 'STABLE',
        forecast: ''
      }
    };

    // Calculate progress metrics if requested
    if (args.metrics.includes('progress')) {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'DONE').length;
      const progress = (completedTasks / totalTasks) * 100;

      // Calculate timeline deviation
      const daysElapsed = Math.floor((Date.now() - sprint.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = Math.floor((sprint.endDate.getTime() - sprint.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const expectedProgress = (daysElapsed / totalDays) * 100;
      const deviation = progress - expectedProgress;

      response.progress = {
        completed: completedTasks,
        remaining: totalTasks - completedTasks,
        timeline: {
          onTrack: Math.abs(deviation) <= 10,
          deviation
        }
      };
    }

    // Calculate risk metrics if requested
    if (args.metrics.includes('risks')) {
      const blockedTasks = tasks.filter(task => task.status === 'BLOCKED').length;
      const criticalTasks = tasks.filter(task => task.priority === 'CRITICAL').length;
      
      const riskFactors = [];
      const mitigation = [];

      if (blockedTasks > 0) {
        riskFactors.push(`${blockedTasks} blocked tasks`);
        mitigation.push('Review and resolve blocked tasks in daily standup');
      }

      if (criticalTasks > 0) {
        riskFactors.push(`${criticalTasks} critical priority tasks`);
        mitigation.push('Prioritize critical tasks and allocate additional resources');
      }

      if (response.progress && response.progress.timeline.deviation < -20) {
        riskFactors.push('Significant timeline deviation');
        mitigation.push('Review sprint scope and consider adjusting commitments');
      }

      response.risks = {
        level: riskFactors.length > 2 ? 'HIGH' : riskFactors.length > 0 ? 'MEDIUM' : 'LOW',
        factors: riskFactors,
        mitigation
      };
    }

    // Calculate dependency metrics if requested
    if (args.metrics.includes('dependencies')) {
      const dependencies = await this.getDependencyItems(tasks);
      response.dependencies = dependencies;
    }

    // Calculate velocity metrics if requested
    if (args.metrics.includes('velocity')) {
      const velocityTrend = this.calculateVelocityTrend(metrics);
      response.velocity = velocityTrend;
    }

    return response;
  }

  async getDependencyStatus(args: GetDependencyStatusRequest): Promise<GetDependencyStatusResponse> {
    const project = await this.db.getProject(args.projectId);
    const sprint = await this.db.getCurrentSprint(args.projectId);
    const tasks = await this.db.getSprintTasks(sprint.id);

    const dependencies = await this.getDependencyItems(tasks);
    const criticalPath = this.analyzeCriticalPath(tasks);

    const recommendations: string[] = [];

    if (dependencies.blocked > 0) {
      recommendations.push('Review blocked dependencies in daily standup');
    }

    if (dependencies.critical > 0) {
      recommendations.push('Escalate critical dependencies to project stakeholders');
    }

    if (criticalPath.some(item => item.risk === 'HIGH')) {
      recommendations.push('Consider re-prioritizing tasks to reduce critical path risks');
    }

    return {
      dependencies: dependencies.items,
      criticalPath,
      recommendations
    };
  }

  private async getDependencyItems(tasks: Task[]) {
    const blockedTasks = tasks.filter(task => task.status === 'BLOCKED');
    const criticalTasks = tasks.filter(task => task.priority === 'CRITICAL');

    const items = blockedTasks.map(task => ({
      id: task.id,
      type: 'BLOCKED',
      status: task.status,
      impact: 'Sprint completion at risk',
      resolution: 'Pending dependency completion'
    }));

    return {
      total: tasks.length,
      blocked: blockedTasks.length,
      critical: criticalTasks.length,
      items
    };
  }

  private analyzeCriticalPath(tasks: Task[]) {
    // Simple critical path analysis based on blocked tasks
    return tasks
      .filter(task => task.status === 'BLOCKED' || task.priority === 'CRITICAL')
      .map(task => ({
        task: task.title,
        dependencies: [], // TODO: Get actual dependencies
        risk: task.status === 'BLOCKED' ? 'HIGH' : 'MEDIUM'
      }));
  }

  private calculateVelocityTrend(metrics: SprintMetrics) {
    const pointsPerDay = metrics.completedPoints / metrics.totalPoints;
    const trend = pointsPerDay >= 0.8 ? 'INCREASING' : pointsPerDay >= 0.5 ? 'STABLE' : 'DECREASING';

    return {
      current: metrics.velocity,
      trend,
      forecast: new Date(Date.now() + (metrics.remainingPoints / pointsPerDay) * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}
