import { ProjectManagementDB } from '../utils/db.js';
import { GetSprintStatusRequest, GetSprintStatusResponse, GetSprintMetricsRequest, GetSprintMetricsResponse } from '../types/tools.js';
import { ValidationError, ValidationErrorType } from '../types/errors.js';
import { Task, BurndownData } from '../types/models.js';

export class SprintHandler {
  constructor(private db: ProjectManagementDB) {}

  async getSprintStatus(args: GetSprintStatusRequest): Promise<GetSprintStatusResponse> {
    const sprint = args.sprintId 
      ? await this.db.getSprint(args.sprintId)
      : await this.db.getCurrentSprint(args.projectId);

    const tasks = await this.db.getSprintTasks(sprint.id);
    const metrics = await this.db.getSprintMetrics(sprint.id);

    const blockers = tasks
      .filter((task: Task) => task.status === 'BLOCKED')
      .map((task: Task) => ({
        taskId: task.id,
        reason: 'Dependency not met', // TODO: Get actual blocker reason
        impact: 'Sprint completion at risk' // TODO: Calculate actual impact
      }));

    return {
      sprint: {
        name: sprint.name,
        status: sprint.status,
        startDate: sprint.startDate.toISOString(),
        endDate: sprint.endDate.toISOString(),
        progress: (metrics.completedPoints / metrics.totalPoints) * 100,
        totalPoints: metrics.totalPoints,
        completedPoints: metrics.completedPoints,
        remainingPoints: metrics.remainingPoints
      },
      tasks: tasks.map((task: Task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        assignee: task.assigneeId || 'Unassigned',
        storyPoints: task.storyPoints || 0
      })),
      blockers
    };
  }

  async getSprintMetrics(args: GetSprintMetricsRequest): Promise<GetSprintMetricsResponse> {
    const metrics = await this.db.getSprintMetrics(args.sprintId);
    const sprint = await this.db.getSprint(args.sprintId);
    const project = await this.db.getProject(sprint.projectId);

    // Calculate completion rate
    const daysElapsed = Math.floor((Date.now() - sprint.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((sprint.endDate.getTime() - sprint.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const completionRate = (metrics.completedPoints / metrics.totalPoints) * 100;
    const expectedCompletion = (daysElapsed / totalDays) * 100;

    // Determine trend
    let trend = 'ON_TRACK';
    if (completionRate < expectedCompletion - 10) {
      trend = 'BEHIND';
    } else if (completionRate > expectedCompletion + 10) {
      trend = 'AHEAD';
    }

    // Calculate forecast
    const pointsPerDay = metrics.completedPoints / daysElapsed;
    const daysToComplete = metrics.remainingPoints / pointsPerDay;
    const forecastedCompletion = new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000);

    return {
      velocity: {
        current: metrics.velocity,
        average: 20, // TODO: Calculate from historical data
        trend: trend
      },
      burndown: {
        dataPoints: metrics.burndownData.dataPoints.map((point: BurndownData['dataPoints'][0]) => ({
          date: point.date.toISOString(),
          remainingPoints: point.remainingPoints,
          completedPoints: point.completedPoints
        })),
        idealLine: metrics.burndownData.idealLine.map((point: BurndownData['idealLine'][0]) => ({
          date: point.date.toISOString(),
          expectedPoints: point.expectedPoints
        })),
        completion: {
          predicted: forecastedCompletion.toISOString(),
          risk: forecastedCompletion > sprint.endDate ? 'HIGH' : 'LOW'
        }
      },
      completion: {
        rate: completionRate,
        trend: trend,
        forecast: forecastedCompletion.toISOString()
      }
    };
  }
}
