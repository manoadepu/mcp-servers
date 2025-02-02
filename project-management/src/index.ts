import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { ProjectManagementDB } from './utils/db.js';
import { SprintHandler } from './handlers/sprint.js';
import { ResourceHandler } from './handlers/resource.js';
import { ProjectHandler } from './handlers/project.js';

import {
  validateGetSprintStatusRequest,
  validateGetSprintMetricsRequest,
  validateGetTeamCapacityRequest,
  validateGetResourceForecastRequest,
  validateGetProjectHealthRequest,
  validateGetDependencyStatusRequest
} from './utils/validation.js';

class ProjectManagementServer {
  private server: Server;
  private db: ProjectManagementDB;
  private sprintHandler: SprintHandler;
  private resourceHandler: ResourceHandler;
  private projectHandler: ProjectHandler;

  constructor() {
    this.server = new Server(
      {
        name: 'project-management',
        version: '0.1.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.db = new ProjectManagementDB();
    this.sprintHandler = new SprintHandler(this.db);
    this.resourceHandler = new ResourceHandler(this.db);
    this.projectHandler = new ProjectHandler(this.db);

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Sprint Management Tools
        {
          name: 'get_sprint_status',
          description: 'Get current sprint status and metrics',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string' },
              sprintId: { type: 'string', optional: true }
            }
          }
        },
        {
          name: 'get_sprint_metrics',
          description: 'Get detailed sprint performance metrics',
          inputSchema: {
            type: 'object',
            properties: {
              sprintId: { type: 'string' },
              includeVelocity: { type: 'boolean', default: true },
              includeBurndown: { type: 'boolean', default: true }
            }
          }
        },
        // Resource Management Tools
        {
          name: 'get_team_capacity',
          description: 'Get team capacity and allocation',
          inputSchema: {
            type: 'object',
            properties: {
              teamId: { type: 'string' },
              timeframe: { 
                type: 'string',
                enum: ['current', 'next_sprint', 'next_quarter']
              }
            }
          }
        },
        {
          name: 'get_resource_forecast',
          description: 'Get resource allocation forecast',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string' },
              timeline: { type: 'string', format: 'date' },
              includeSkills: { type: 'boolean', default: true }
            }
          }
        },
        // Project Health Tools
        {
          name: 'get_project_health',
          description: 'Get overall project health metrics',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string' },
              metrics: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['progress', 'risks', 'dependencies', 'velocity']
                }
              }
            }
          }
        },
        {
          name: 'get_dependency_status',
          description: 'Get project dependencies and blockers',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string' },
              status: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['blocked', 'at_risk', 'on_track']
                }
              }
            }
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const args = request.params.arguments || {};
      
      switch (request.params.name) {
        case 'get_sprint_status':
          return {
            content: await this.sprintHandler.getSprintStatus(validateGetSprintStatusRequest(args))
          };
        case 'get_sprint_metrics':
          return {
            content: await this.sprintHandler.getSprintMetrics(validateGetSprintMetricsRequest(args))
          };
        case 'get_team_capacity':
          return {
            content: await this.resourceHandler.getTeamCapacity(validateGetTeamCapacityRequest(args))
          };
        case 'get_resource_forecast':
          return {
            content: await this.resourceHandler.getResourceForecast(validateGetResourceForecastRequest(args))
          };
        case 'get_project_health':
          return {
            content: await this.projectHandler.getProjectHealth(validateGetProjectHealthRequest(args))
          };
        case 'get_dependency_status':
          return {
            content: await this.projectHandler.getDependencyStatus(validateGetDependencyStatusRequest(args))
          };
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async run() {
    await this.db.connect();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Project Management MCP server running on stdio');
  }
}

// Start server
const server = new ProjectManagementServer();
server.run().catch(console.error);
