import JiraApi from 'jira-client';
import type { JsonResponse } from 'jira-client';
import {
  Task,
  Sprint,
  TeamCapacity,
  TaskDetails,
  TaskFilters,
  SprintDetails,
  SprintMetrics,
  ResourceMetrics,
  ResourceForecast,
  TaskStatus,
  Priority,
  SprintStatus,
  ProjectManagementError,
  SprintManagement,
  ResourceManagement
} from '../types.js';
import {
  TaskManagementAdapter,
  SprintManagementAdapter,
  ResourceManagementAdapter,
  ToolConfig
} from './base.js';

interface JiraIssue extends JsonResponse {
  key: string;
  fields: {
    summary: string;
    description: string;
    status: {
      name: string;
      statusCategory: {
        key: string;
      };
    };
    priority: {
      name: string;
    };
    assignee?: {
      name: string;
    };
    customfield_10026?: number; // Story points
    issuelinks?: Array<{
      type: {
        name: string;
      };
      outwardIssue?: {
        key: string;
      };
    }>;
    labels: string[];
    created: string;
    updated: string;
    duedate?: string;
    timeestimate?: number;
    components?: Array<{
      name: string;
    }>;
    resolutiondate?: string;
  };
}

interface JiraSprint extends JsonResponse {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  goal?: string;
  state: string;
  daysRemaining?: number;
  originalEstimateSeconds?: number;
  lengthSeconds?: number;
}

export interface JiraConfig extends ToolConfig {
  host: string;
  username: string;
  password: string; // API token
  projectKey: string;
  apiVersion?: string;
  strictSSL?: boolean;
}

export class JiraAdapter extends TaskManagementAdapter implements SprintManagement, ResourceManagement {
  name = 'JIRA';
  capabilities = [
    'taskManagement',
    'sprintManagement',
    'resourceManagement'
  ];

  protected jira: JiraApi | null = null;
  private projectKey: string;

  constructor(config: JiraConfig) {
    super(config);
    this.projectKey = config.projectKey;
  }

  protected validateTaskDetails(details: TaskDetails): void {
    if (!details.title) {
      throw this.handleError(
        new Error('Task title is required'),
        'validateTaskDetails'
      );
    }
  }

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

  protected validateTimeline(timeline: Date): void {
    if (timeline <= new Date()) {
      throw this.handleError(
        new Error('Forecast timeline must be in the future'),
        'validateTimeline'
      );
    }
  }

  async connect(): Promise<void> {
    try {
      const config = this.config as JiraConfig;
      this.jira = new JiraApi({
        protocol: 'https',
        host: config.host,
        username: config.username,
        password: config.password,
        apiVersion: config.apiVersion || '2',
        strictSSL: config.strictSSL !== false
      });

      // Test connection
      await this.jira.getCurrentUser();
      this.connected = true;
      console.log('Connected to JIRA successfully');
    } catch (error) {
      throw this.handleError(error, 'connect');
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.jira = null;
    console.log('Disconnected from JIRA');
  }

  // Task Management

  async createTask(details: TaskDetails): Promise<Task> {
    this.validateConnection();
    this.validateTaskDetails(details);
    if (!this.jira) throw new Error('JIRA client not initialized');

    try {
      const issue = await this.jira.addNewIssue({
        fields: {
          project: {
            key: this.projectKey
          },
          summary: details.title,
          description: details.description,
          issuetype: {
            name: 'Task'
          },
          priority: {
            name: this.mapPriorityToJira(details.priority)
          },
          labels: details.labels,
          duedate: details.dueDate?.toISOString().split('T')[0],
          customfield_10026: details.storyPoints
        }
      });

      return this.mapJiraIssueToTask(issue as JiraIssue);
    } catch (error) {
      throw this.handleError(error, 'createTask');
    }
  }

  async updateTask(id: string, updates: Partial<TaskDetails>): Promise<Task> {
    this.validateConnection();
    if (!this.jira) throw new Error('JIRA client not initialized');

    try {
      const updateFields: Record<string, unknown> = {};
      
      if (updates.title) updateFields.summary = updates.title;
      if (updates.description) updateFields.description = updates.description;
      if (updates.priority) updateFields.priority = { name: this.mapPriorityToJira(updates.priority) };
      if (updates.labels) updateFields.labels = updates.labels;
      if (updates.dueDate) updateFields.duedate = updates.dueDate.toISOString().split('T')[0];
      if (updates.storyPoints) updateFields.customfield_10026 = updates.storyPoints;

      await this.jira.updateIssue(id, {
        fields: updateFields
      });

      const updated = await this.jira.findIssue(id);
      return this.mapJiraIssueToTask(updated as JiraIssue);
    } catch (error) {
      throw this.handleError(error, 'updateTask');
    }
  }

  async getTasks(filters: TaskFilters): Promise<Task[]> {
    this.validateConnection();
    if (!this.jira) throw new Error('JIRA client not initialized');

    try {
      let jql = `project = ${this.projectKey}`;

      if (filters.status?.length) {
        jql += ` AND status IN (${filters.status.map(s => `'${this.mapStatusToJira(s)}'`).join(',')})`;
      }
      if (filters.priority?.length) {
        jql += ` AND priority IN (${filters.priority.map(p => `'${this.mapPriorityToJira(p)}'`).join(',')})`;
      }
      if (filters.assignee) {
        jql += ` AND assignee = '${filters.assignee}'`;
      }
      if (filters.labels?.length) {
        jql += ` AND labels IN (${filters.labels.map(l => `'${l}'`).join(',')})`;
      }
      if (filters.dateRange) {
        jql += ` AND created >= '${filters.dateRange.start.toISOString().split('T')[0]}'`;
        jql += ` AND created <= '${filters.dateRange.end.toISOString().split('T')[0]}'`;
      }

      const issues = await this.jira.searchJira(jql);
      return issues.issues.map(issue => this.mapJiraIssueToTask(issue as JiraIssue));
    } catch (error) {
      throw this.handleError(error, 'getTasks');
    }
  }

  async assignTask(taskId: string, userId: string): Promise<void> {
    this.validateConnection();
    if (!this.jira) throw new Error('JIRA client not initialized');

    try {
      await this.jira.updateAssignee(taskId, userId);
    } catch (error) {
      throw this.handleError(error, 'assignTask');
    }
  }

  // Sprint Management

  async createSprint(details: SprintDetails): Promise<Sprint> {
    this.validateConnection();
    this.validateSprintDetails(details);
    if (!this.jira) throw new Error('JIRA client not initialized');

    try {
      const boardId = await this.getProjectBoardId();
      const sprint = await this.jira.createSprint({
        name: details.name,
        startDate: details.startDate.toISOString(),
        endDate: details.endDate.toISOString(),
        originBoardId: boardId,
        goal: details.goals.join('\n')
      });

      return this.mapJiraSprintToSprint(sprint as JiraSprint);
    } catch (error) {
      throw this.handleError(error, 'createSprint');
    }
  }

  async updateSprint(id: string, updates: Partial<SprintDetails>): Promise<Sprint> {
    this.validateConnection();
    if (!this.jira) throw new Error('JIRA client not initialized');

    try {
      const sprint = await this.jira.updateSprint(id, {
        name: updates.name,
        startDate: updates.startDate?.toISOString(),
        endDate: updates.endDate?.toISOString(),
        goal: updates.goals?.join('\n')
      });

      return this.mapJiraSprintToSprint(sprint as JiraSprint);
    } catch (error) {
      throw this.handleError(error, 'updateSprint');
    }
  }

  async getCurrentSprint(): Promise<Sprint> {
    this.validateConnection();
    if (!this.jira) throw new Error('JIRA client not initialized');

    try {
      const boardId = await this.getProjectBoardId();
      const sprints = await this.jira.getAllSprints(boardId, 0, 1, 'active');
      if (!sprints.values.length) {
        throw new Error('No active sprint found');
      }

      const sprint = sprints.values[0] as JiraSprint;
      const issues = await this.jira.getSprintIssues(sprint.id.toString(), 0, 1000);
      
      return {
        ...this.mapJiraSprintToSprint(sprint),
        tasks: issues.issues.map(issue => this.mapJiraIssueToTask(issue as JiraIssue))
      };
    } catch (error) {
      throw this.handleError(error, 'getCurrentSprint');
    }
  }

  async getSprintMetrics(sprintId: string): Promise<SprintMetrics> {
    this.validateConnection();
    if (!this.jira) throw new Error('JIRA client not initialized');

    try {
      const sprint = await this.jira.getSprint(sprintId) as JiraSprint;
      const issues = await this.jira.getSprintIssues(sprintId, 0, 1000);
      
      const totalPoints = issues.issues.reduce((sum, issue) => 
        sum + ((issue as JiraIssue).fields.customfield_10026 || 0), 0);
      
      const completedPoints = issues.issues
        .filter(issue => (issue as JiraIssue).fields.status.statusCategory.key === 'done')
        .reduce((sum, issue) => sum + ((issue as JiraIssue).fields.customfield_10026 || 0), 0);

      const burndownData = await this.getBurndownData(sprintId);

      return {
        totalPoints,
        completedPoints,
        remainingPoints: totalPoints - completedPoints,
        burndownData: burndownData || [],
        velocity: completedPoints / (sprint.daysRemaining ? sprint.originalEstimateSeconds || 1 : sprint.lengthSeconds || 1),
        completionForecast: this.calculateCompletionForecast(burndownData)
      };
    } catch (error) {
      throw this.handleError(error, 'getSprintMetrics');
    }
  }

  // Resource Management

  async getTeamCapacity(): Promise<TeamCapacity> {
    this.validateConnection();
    if (!this.jira) throw new Error('JIRA client not initialized');

    try {
      const teamMembers = await this.getProjectTeamMembers();
      const assignments = await this.getTeamAssignments(teamMembers);

      return {
        totalCapacity: teamMembers.length * 8, // 8 hours per person
        allocatedCapacity: assignments.reduce((sum, a) => sum + a.allocation, 0),
        availableCapacity: (teamMembers.length * 8) - assignments.reduce((sum, a) => sum + a.allocation, 0),
        members: assignments
      };
    } catch (error) {
      throw this.handleError(error, 'getTeamCapacity');
    }
  }

  async getResourceMetrics(): Promise<ResourceMetrics> {
    this.validateConnection();
    if (!this.jira) throw new Error('JIRA client not initialized');

    try {
      const teamMembers = await this.getProjectTeamMembers();
      const assignments = await this.getTeamAssignments(teamMembers);
      const workloadData = await this.getWorkloadData();

      return {
        utilization: assignments.reduce((sum, a) => sum + a.allocation, 0) / (teamMembers.length * 8),
        availability: 1 - (assignments.reduce((sum, a) => sum + a.allocation, 0) / (teamMembers.length * 8)),
        skills: await this.getTeamSkills(teamMembers),
        forecast: workloadData
      };
    } catch (error) {
      throw this.handleError(error, 'getResourceMetrics');
    }
  }

  async forecastResourceNeeds(timeline: Date): Promise<ResourceForecast> {
    this.validateConnection();
    this.validateTimeline(timeline);
    if (!this.jira) throw new Error('JIRA client not initialized');

    try {
      const backlog = await this.getProjectBacklog();
      const teamCapacity = await this.getTeamCapacity();
      const velocityHistory = await this.getVelocityHistory();

      return this.calculateResourceForecast(backlog, teamCapacity, velocityHistory, timeline);
    } catch (error) {
      throw this.handleError(error, 'forecastResourceNeeds');
    }
  }

  // Private helper methods

  private async getProjectBoardId(): Promise<number> {
    if (!this.jira) throw new Error('JIRA client not initialized');
    const boards = await this.jira.getAllBoards();
    const board = boards.values.find(b => b.location?.projectKey === this.projectKey);
    if (!board) {
      throw new Error(`No board found for project ${this.projectKey}`);
    }
    return board.id;
  }

  private async getProjectTeamMembers(): Promise<Array<{ name: string }>> {
    if (!this.jira) throw new Error('JIRA client not initialized');
    const project = await this.jira.getProject(this.projectKey);
    return project.roles.member.actors;
  }

  private async getTeamAssignments(teamMembers: Array<{ name: string }>): Promise<Array<{ userId: string; allocation: number; projects: string[] }>> {
    if (!this.jira) throw new Error('JIRA client not initialized');
    const assignments = [];
    for (const member of teamMembers) {
      const issues = await this.jira.searchJira(
        `project = ${this.projectKey} AND assignee = '${member.name}' AND status != Done`
      );
      assignments.push({
        userId: member.name,
        allocation: issues.issues.reduce((sum, issue) => 
          sum + ((issue as JiraIssue).fields.timeestimate || 0), 0) / 3600,
        projects: [this.projectKey]
      });
    }
    return assignments;
  }

  private async getBurndownData(sprintId: string): Promise<Array<{ date: Date; remainingPoints: number; }>> {
    if (!this.jira) throw new Error('JIRA client not initialized');
    
    const sprint = await this.jira.getSprint(sprintId) as JiraSprint;
    const issues = await this.jira.getSprintIssues(sprintId, 0, 1000);
    
    const burndown = [];
    let currentDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    
    while (currentDate <= endDate) {
      burndown.push({
        date: new Date(currentDate),
        remainingPoints: this.calculateRemainingPoints(issues.issues as JiraIssue[], currentDate)
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return burndown;
  }

  private calculateRemainingPoints(issues: JiraIssue[], date: Date): number {
    return issues.reduce((sum, issue) => {
      if (!issue.fields.resolutiondate || new Date(issue.fields.resolutiondate) > date) {
        return sum + (issue.fields.customfield_10026 || 0);
      }
      return sum;
    }, 0);
  }

  private calculateCompletionForecast(burndown: Array<{ date: Date; remainingPoints: number; }>): Date {
    if (burndown.length < 2) return new Date();
    
    const velocity = (burndown[0].remainingPoints - burndown[burndown.length - 1].remainingPoints) / burndown.length;
    const remainingWork = burndown[burndown.length - 1].remainingPoints;
    const daysRemaining = remainingWork / velocity;
    
    const forecast = new Date(burndown[burndown.length - 1].date);
    forecast.setDate(forecast.getDate() + daysRemaining);
    return forecast;
  }

  private async getWorkloadData(): Promise<Array<{ date: Date; demand: number; capacity: number; }>> {
    if (!this.jira) throw new Error('JIRA client not initialized');
    
    const sprints = await this.jira.getAllSprints(await this.getProjectBoardId());
    const workload = [];
    
    for (const sprint of sprints.values as JiraSprint[]) {
      const issues = await this.jira.getSprintIssues(sprint.id.toString(), 0, 1000);
      workload.push({
        date: new Date(sprint.startDate),
        demand: issues.issues.reduce((sum, issue) => 
          sum + ((issue as JiraIssue).fields.timeestimate || 0), 0) / 3600,
        capacity: 8 * (await this.getProjectTeamMembers()).length // 8 hours per person
      });
    }
    
    return workload;
  }

  private async getTeamSkills(teamMembers: Array<{ name: string }>): Promise<Array<{ name: string; demand: number; availability: number; }>> {
    if (!this.jira) throw new Error('JIRA client not initialized');
    
    const skills = new Map<string, { count: number; demand: number; }>();
    
    for (const member of teamMembers) {
      const issues = await this.jira.searchJira(
        `project = ${this.projectKey} AND assignee = '${member.name}'`
      );
      
      for (const issue of issues.issues as JiraIssue[]) {
        for (const component of issue.fields.components || []) {
          const skill = skills.get(component.name) || { count: 0, demand: 0 };
          skill.count++;
          skill.demand += issue.fields.timeestimate || 0;
          skills.set(component.name, skill);
        }
      }
    }
    
    return Array.from(skills.entries()).map(([name, data]) => ({
      name,
      demand: data.demand / 3600,
      availability: 1 - (data.demand / (data.count * 8 * 3600))
    }));
  }

  private async getProjectBacklog(): Promise<JiraIssue[]> {
    if (!this.jira) throw new Error('JIRA client not initialized');
    const response = await this.jira.searchJira(
      `project = ${this.projectKey} AND sprint is EMPTY ORDER BY rank`
    );
    return response.issues as JiraIssue[];
  }

  private async getVelocityHistory(): Promise<number[]> {
    if (!this.jira) throw new Error('JIRA client not initialized');
    const sprints = await this.jira.getAllSprints(await this.getProjectBoardId());
    const velocities = [];
    
    for (const sprint of (sprints.values as JiraSprint[]).filter(s => s.state === 'closed')) {
      const issues = await this.jira.getSprintIssues(sprint.id.toString(), 0, 1000);
      const points = (issues.issues as JiraIssue[])
        .filter(issue => issue.fields.status.statusCategory.key === 'done')
        .reduce((sum, issue) => sum + (issue.fields.customfield_10026 || 0), 0);
      velocities.push(points);
    }
    
    return velocities;
  }

  private async calculateResourceForecast(
    backlog: JiraIssue[],
    teamCapacity: TeamCapacity,
    velocityHistory: number[],
    timeline: Date
  ): Promise<ResourceForecast> {
    const avgVelocity = velocityHistory.reduce((sum, v) => sum + v, 0) / velocityHistory.length;
    const backlogPoints = backlog.reduce((sum, issue) => sum + (issue.fields.customfield_10026 || 0), 0);
    const weeksNeeded = backlogPoints / avgVelocity;
    
    const forecast: ResourceForecast = {
      timeline: [],
      recommendations: [],
      risks: []
    };
    
    let currentDate = new Date();
    const endDate = timeline;
    
    while (currentDate <= endDate) {
      const skills = await this.getTeamSkills(await this.getProjectTeamMembers());
      const weekData = {
        date: new Date(currentDate),
        requiredCapacity: teamCapacity.allocatedCapacity,
        availableCapacity: teamCapacity.totalCapacity,
        skills
      };
      
      forecast.timeline.push(weekData);
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    if (weeksNeeded * 5 > this.daysBetween(new Date(), timeline)) {
      forecast.recommendations.push('Consider adding more resources to meet timeline');
      forecast.risks.push('Current velocity may not be sufficient for backlog');
    }
    
    if (teamCapacity.allocatedCapacity / teamCapacity.totalCapacity > 0.8) {
      forecast.recommendations.push('Team is approaching capacity limits');
      forecast.risks.push('High utilization may impact quality and velocity');
    }
    
    return forecast;
  }

  private daysBetween(start: Date, end: Date): number {
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Mapping methods

  private mapJiraIssueToTask(issue: JiraIssue): Task {
    return {
      id: issue.key,
      title: issue.fields.summary,
      description: issue.fields.description,
      status: this.mapJiraStatusToStatus(issue.fields.status.name),
      priority: this.mapJiraPriorityToPriority(issue.fields.priority.name),
      assignee: issue.fields.assignee?.name,
      storyPoints: issue.fields.customfield_10026,
      dependencies: issue.fields.issuelinks
        ?.filter(link => link.type.name === 'Blocks')
        ?.map(link => link.outwardIssue?.key)
        ?.filter((key): key is string => key !== undefined) ?? [],
      labels: issue.fields.labels,
      created: new Date(issue.fields.created),
      updated: new Date(issue.fields.updated),
      dueDate: issue.fields.duedate ? new Date(issue.fields.duedate) : undefined
    };
  }

  private mapJiraSprintToSprint(sprint: JiraSprint): Sprint {
    const metrics: SprintMetrics = {
      totalPoints: 0,
      completedPoints: 0,
      remainingPoints: 0,
      burndownData: [],
      velocity: 0,
      completionForecast: new Date()
    };

    return {
      id: sprint.id.toString(),
      name: sprint.name,
      startDate: new Date(sprint.startDate),
      endDate: new Date(sprint.endDate),
      goals: sprint.goal?.split('\n').filter(Boolean) || [],
      tasks: [],
      status: this.mapJiraSprintStateToStatus(sprint.state),
      metrics
    };
  }

  private mapStatusToJira(status: TaskStatus): string {
    const map: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: 'To Do',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.IN_REVIEW]: 'In Review',
      [TaskStatus.BLOCKED]: 'Blocked',
      [TaskStatus.DONE]: 'Done'
    };
    return map[status];
  }

  private mapJiraStatusToStatus(status: string): TaskStatus {
    const map: Record<string, TaskStatus> = {
      'To Do': TaskStatus.TODO,
      'In Progress': TaskStatus.IN_PROGRESS,
      'In Review': TaskStatus.IN_REVIEW,
      'Blocked': TaskStatus.BLOCKED,
      'Done': TaskStatus.DONE
    };
    return map[status] || TaskStatus.TODO;
  }

  private mapPriorityToJira(priority: Priority): string {
    const map: Record<Priority, string> = {
      [Priority.LOW]: 'Low',
      [Priority.MEDIUM]: 'Medium',
      [Priority.HIGH]: 'High',
      [Priority.CRITICAL]: 'Highest'
    };
    return map[priority];
  }

  private mapJiraPriorityToPriority(priority: string): Priority {
    const map: Record<string, Priority> = {
      'Lowest': Priority.LOW,
      'Low': Priority.LOW,
      'Medium': Priority.MEDIUM,
      'High': Priority.HIGH,
      'Highest': Priority.CRITICAL
    };
    return map[priority] || Priority.MEDIUM;
  }

  private mapJiraSprintStateToStatus(state: string): SprintStatus {
    const map: Record<string, SprintStatus> = {
      'future': SprintStatus.PLANNING,
      'active': SprintStatus.ACTIVE,
      'closed': SprintStatus.COMPLETED,
      'cancelled': SprintStatus.CANCELLED
    };
    return map[state] || SprintStatus.PLANNING;
  }
}
