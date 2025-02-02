export declare class DatabaseConnection {
    private static instance;
    private db;
    private dbPath;
    private constructor();
    static getInstance(): DatabaseConnection;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    run(sql: string, params?: any[]): Promise<void>;
    get<T>(sql: string, params?: any[]): Promise<T | undefined>;
    getRepository(id: number): Promise<{
        id: number;
        name: string;
        path: string;
        created_at: string;
        updated_at: string;
    } | undefined>;
    getPullRequest(repoId: number, prNumber: number): Promise<{
        id: number;
        repository_id: number;
        pr_number: number;
        title: string;
        description: string;
        author: string;
        status: string;
        created_at: string;
        updated_at: string;
        complexity_score: number;
        risk_score: number;
    } | undefined>;
    getProject(id: number): Promise<{
        id: number;
        name: string;
        description: string;
        status: string;
        start_date: string;
        target_date: string;
        created_at: string;
        updated_at: string;
    } | undefined>;
    getCurrentSprint(projectId: number): Promise<{
        id: number;
        project_id: number;
        name: string;
        start_date: string;
        end_date: string;
        goals: string;
        status: string;
    } | undefined>;
    getSprintMetrics(sprintId: number): Promise<{
        id: number;
        sprint_id: number;
        total_points: number;
        completed_points: number;
        remaining_points: number;
        velocity: number;
        burndown_data: string;
        completion_forecast: string;
    } | undefined>;
    getResourceMetrics(projectId: number): Promise<{
        id: number;
        project_id: number;
        date: string;
        utilization: number;
        availability: number;
        skills_data: string;
        forecast_data: string;
    } | undefined>;
}
