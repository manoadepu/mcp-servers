import { ProjectManagementDB } from '../utils/db.js';
import {
  GetTeamCapacityRequest,
  GetTeamCapacityResponse,
  GetResourceForecastRequest,
  GetResourceForecastResponse
} from '../types/tools.js';
import { ValidationError, ValidationErrorType } from '../types/errors.js';
import { TeamMember, ResourceMetrics, SkillsData } from '../types/models.js';

export class ResourceHandler {
  constructor(private db: ProjectManagementDB) {}

  async getTeamCapacity(args: GetTeamCapacityRequest): Promise<GetTeamCapacityResponse> {
    const team = await this.db.getTeam(args.teamId);
    const members = await this.db.getTeamMembers(team.id);
    const metrics = await this.db.getResourceMetrics(team.id);

    // Calculate total capacity
    const totalCapacity = team.capacity;
    const allocatedCapacity = members.reduce((sum: number, member: TeamMember) => 
      sum + (member.availability * team.capacity / 100), 0);
    const availableCapacity = totalCapacity - allocatedCapacity;

    // Aggregate skills demand and availability
    const skillsMap = new Map<string, { demand: number; availability: number }>();
    
    // Process member skills
    members.forEach((member: TeamMember) => {
      member.skills.technical.forEach((skill: string) => {
        if (!skillsMap.has(skill)) {
          skillsMap.set(skill, { demand: 0, availability: 0 });
        }
        const skillMetrics = skillsMap.get(skill)!;
        skillMetrics.availability += member.availability;
      });
    });

    // Process skills demand from metrics
    metrics.skillsData.skills.forEach((skill: SkillsData['skills'][0]) => {
      if (!skillsMap.has(skill.name)) {
        skillsMap.set(skill.name, { demand: 0, availability: 0 });
      }
      const skillMetrics = skillsMap.get(skill.name)!;
      skillMetrics.demand = skill.demand;
    });

    return {
      capacity: {
        total: totalCapacity,
        allocated: allocatedCapacity,
        available: availableCapacity
      },
      members: members.map((member: TeamMember) => ({
        id: member.id,
        name: member.name,
        allocation: member.availability,
        availability: member.availability,
        skills: member.skills.technical
      })),
      skills: Array.from(skillsMap.entries()).map(([name, metrics]) => ({
        name,
        demand: metrics.demand,
        availability: metrics.availability
      }))
    };
  }

  async getResourceForecast(args: GetResourceForecastRequest): Promise<GetResourceForecastResponse> {
    const project = await this.db.getProject(args.projectId);
    const team = await this.db.getTeam(args.projectId);
    const metrics = await this.db.getResourceMetrics(team.id);

    // Generate timeline data points
    const timeline = [];
    const startDate = new Date(args.timeline);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3); // 3-month forecast

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Calculate capacity requirements based on historical data and trends
      const requiredCapacity = metrics.utilization;
      const availableCapacity = metrics.availability;

      timeline.push({
        date: currentDate.toISOString(),
        requiredCapacity,
        availableCapacity,
        skills: metrics.skillsData.skills.map((skill: SkillsData['skills'][0]) => ({
          name: skill.name,
          demand: skill.demand,
          availability: skill.availability
        }))
      });

      currentDate.setDate(currentDate.getDate() + 7); // Weekly intervals
    }

    // Generate recommendations based on capacity gaps
    const recommendations: string[] = [];
    const risks: string[] = [];

    // Check for capacity shortages
    if (metrics.utilization > metrics.availability) {
      recommendations.push('Consider adding more team members to meet demand');
      risks.push('Resource shortage may impact delivery timeline');
    }

    // Check for skill gaps
    metrics.skillsData.gaps.forEach((gap: SkillsData['gaps'][0]) => {
      if (gap.shortage > 20) { // More than 20% shortage
        recommendations.push(`Hire or train team members for ${gap.skill}`);
        risks.push(`Critical skill shortage in ${gap.skill}`);
      }
    });

    return {
      timeline,
      recommendations,
      risks
    };
  }
}
