import {
  TeamEntity,
  TeamWithDetails,
} from "@domain/team/entities/team.entity";
import type { ITeamRepository } from "@domain/team/repositories/team.repository.interface";
import {
  CreateTeamInput,
  createTeam,
} from "@domain/team/use-cases/create-team";
import { deleteTeam } from "@domain/team/use-cases/delete-team";
import { getTeam } from "@domain/team/use-cases/get-team";
import { listOrganizationTeams } from "@domain/team/use-cases/list-organization-teams";
import {
  UpdateTeamInput,
  updateTeam,
} from "@domain/team/use-cases/update-team";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class TeamService {
  constructor(
    @Inject("ITeamRepository")
    private readonly teamRepository: ITeamRepository,
  ) {}

  async createTeam(input: CreateTeamInput): Promise<TeamEntity> {
    const result = await createTeam(input, this.teamRepository);
    return result.team;
  }

  async getTeam(organizationId: string, teamId: string): Promise<TeamEntity> {
    try {
      const result = await getTeam(
        { organizationId, teamId },
        this.teamRepository,
      );
      return result.team;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Team not found: ${teamId}`);
      }
      throw error;
    }
  }

  async updateTeam(input: UpdateTeamInput): Promise<TeamEntity> {
    try {
      const result = await updateTeam(input, this.teamRepository);
      return result.team;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async deleteTeam(organizationId: string, teamId: string): Promise<void> {
    try {
      await deleteTeam({ organizationId, teamId }, this.teamRepository);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async listOrganizationTeams(
    organizationId: string,
  ): Promise<TeamWithDetails[]> {
    const result = await listOrganizationTeams(
      { organizationId },
      this.teamRepository,
    );
    return result.teams;
  }
}
