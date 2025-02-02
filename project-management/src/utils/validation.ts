import { ValidationError, ValidationErrorType } from '../types/errors.js';
import {
  GetSprintStatusRequest,
  GetSprintMetricsRequest,
  GetTeamCapacityRequest,
  GetResourceForecastRequest,
  GetProjectHealthRequest,
  GetDependencyStatusRequest
} from '../types/tools.js';

export function validateGetSprintStatusRequest(args: Record<string, unknown>): GetSprintStatusRequest {
  if (!args.projectId || typeof args.projectId !== 'string') {
    throw new ValidationError(
      ValidationErrorType.INVALID_PROJECT_ID,
      'projectId is required and must be a string'
    );
  }

  return {
    projectId: args.projectId,
    sprintId: typeof args.sprintId === 'string' ? args.sprintId : undefined
  };
}

export function validateGetSprintMetricsRequest(args: Record<string, unknown>): GetSprintMetricsRequest {
  if (!args.sprintId || typeof args.sprintId !== 'string') {
    throw new ValidationError(
      ValidationErrorType.INVALID_SPRINT_ID,
      'sprintId is required and must be a string'
    );
  }

  return {
    sprintId: args.sprintId,
    includeVelocity: typeof args.includeVelocity === 'boolean' ? args.includeVelocity : true,
    includeBurndown: typeof args.includeBurndown === 'boolean' ? args.includeBurndown : true
  };
}

export function validateGetTeamCapacityRequest(args: Record<string, unknown>): GetTeamCapacityRequest {
  if (!args.teamId || typeof args.teamId !== 'string') {
    throw new ValidationError(
      ValidationErrorType.INVALID_TEAM_ID,
      'teamId is required and must be a string'
    );
  }

  if (!args.timeframe || !['current', 'next_sprint', 'next_quarter'].includes(args.timeframe as string)) {
    throw new ValidationError(
      ValidationErrorType.INVALID_STATUS,
      'timeframe must be one of: current, next_sprint, next_quarter'
    );
  }

  return {
    teamId: args.teamId,
    timeframe: args.timeframe as 'current' | 'next_sprint' | 'next_quarter'
  };
}

export function validateGetResourceForecastRequest(args: Record<string, unknown>): GetResourceForecastRequest {
  if (!args.projectId || typeof args.projectId !== 'string') {
    throw new ValidationError(
      ValidationErrorType.INVALID_PROJECT_ID,
      'projectId is required and must be a string'
    );
  }

  if (!args.timeline || typeof args.timeline !== 'string') {
    throw new ValidationError(
      ValidationErrorType.INVALID_DATE_RANGE,
      'timeline is required and must be a valid date string'
    );
  }

  return {
    projectId: args.projectId,
    timeline: args.timeline,
    includeSkills: typeof args.includeSkills === 'boolean' ? args.includeSkills : true
  };
}

export function validateGetProjectHealthRequest(args: Record<string, unknown>): GetProjectHealthRequest {
  if (!args.projectId || typeof args.projectId !== 'string') {
    throw new ValidationError(
      ValidationErrorType.INVALID_PROJECT_ID,
      'projectId is required and must be a string'
    );
  }

  if (!Array.isArray(args.metrics)) {
    throw new ValidationError(
      ValidationErrorType.INVALID_STATUS,
      'metrics must be an array'
    );
  }

  const validMetrics = ['progress', 'risks', 'dependencies', 'velocity'];
  const invalidMetrics = args.metrics.filter(m => !validMetrics.includes(m as string));
  if (invalidMetrics.length > 0) {
    throw new ValidationError(
      ValidationErrorType.INVALID_STATUS,
      `Invalid metrics: ${invalidMetrics.join(', ')}. Must be one of: ${validMetrics.join(', ')}`
    );
  }

  return {
    projectId: args.projectId,
    metrics: args.metrics as Array<'progress' | 'risks' | 'dependencies' | 'velocity'>
  };
}

export function validateGetDependencyStatusRequest(args: Record<string, unknown>): GetDependencyStatusRequest {
  if (!args.projectId || typeof args.projectId !== 'string') {
    throw new ValidationError(
      ValidationErrorType.INVALID_PROJECT_ID,
      'projectId is required and must be a string'
    );
  }

  if (!Array.isArray(args.status)) {
    throw new ValidationError(
      ValidationErrorType.INVALID_STATUS,
      'status must be an array'
    );
  }

  const validStatuses = ['blocked', 'at_risk', 'on_track'];
  const invalidStatuses = args.status.filter(s => !validStatuses.includes(s as string));
  if (invalidStatuses.length > 0) {
    throw new ValidationError(
      ValidationErrorType.INVALID_STATUS,
      `Invalid statuses: ${invalidStatuses.join(', ')}. Must be one of: ${validStatuses.join(', ')}`
    );
  }

  return {
    projectId: args.projectId,
    status: args.status as Array<'blocked' | 'at_risk' | 'on_track'>
  };
}
