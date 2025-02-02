declare module 'jira-client' {
  export interface JiraApiOptions {
    protocol: string;
    host: string;
    username: string;
    password: string;
    apiVersion: string;
    strictSSL: boolean;
  }

  export interface JsonResponse {
    [key: string]: any;
  }

  export interface JiraFields {
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
    customfield_10026?: number;
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
  }

  export interface JiraIssue {
    key: string;
    fields: JiraFields;
  }

  export interface JiraSprint {
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

  export interface Board {
    id: number;
    location?: {
      projectKey: string;
    };
  }

  export interface Project {
    roles: {
      member: {
        actors: Array<{
          name: string;
        }>;
      };
    };
  }

  export interface CreateSprintOptions {
    name: string;
    startDate: string;
    endDate: string;
    originBoardId: number;
    goal?: string;
  }

  export interface UpdateSprintOptions {
    name?: string;
    startDate?: string;
    endDate?: string;
    goal?: string;
  }

  export default class JiraApi {
    constructor(options: JiraApiOptions);

    getCurrentUser(): Promise<JsonResponse>;
    addNewIssue(issue: { fields: any }): Promise<JiraIssue>;
    updateIssue(issueId: string, issue: { fields: any }): Promise<void>;
    findIssue(issueId: string): Promise<JiraIssue>;
    searchJira(jql: string, options?: { startAt?: number; maxResults?: number }): Promise<{ issues: JiraIssue[] }>;
    updateAssignee(issueId: string, assignee: string): Promise<void>;
    getAllBoards(): Promise<{ values: Board[] }>;
    getProject(projectKey: string): Promise<Project>;
    getSprint(sprintId: string): Promise<JiraSprint>;
    getSprintIssues(sprintId: string | number, startAt?: number, maxResults?: number): Promise<{ issues: JiraIssue[] }>;
    getAllSprints(boardId: number, startAt?: number, maxResults?: number, state?: string): Promise<{ values: JiraSprint[] }>;
    createSprint(options: CreateSprintOptions): Promise<JiraSprint>;
    updateSprint(sprintId: string, options: UpdateSprintOptions): Promise<JiraSprint>;
  }
}
