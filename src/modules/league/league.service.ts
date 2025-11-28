import {
  createLeague,
  CreateLeagueInput,
  updateLeague,
  UpdateLeagueInput,
  getLeague,
  deleteLeague,
  listOrganizationLeagues,
  LeagueEntity,
} from "@domain/league";
import type { ILeagueRepository } from "@domain/league/repositories/league.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class LeagueService {
  constructor(
    @Inject("ILeagueRepository")
    private readonly leagueRepository: ILeagueRepository,
  ) {}

  async createLeague(input: CreateLeagueInput): Promise<LeagueEntity> {
    const result = await createLeague(input, this.leagueRepository);
    return result.league;
  }

  async getLeague(
    organizationId: string,
    leagueId: string,
  ): Promise<LeagueEntity> {
    try {
      const result = await getLeague(
        { organizationId, leagueId },
        this.leagueRepository,
      );
      return result.league;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`League not found: ${leagueId}`);
      }
      throw error;
    }
  }

  async updateLeague(input: UpdateLeagueInput): Promise<LeagueEntity> {
    try {
      const result = await updateLeague(input, this.leagueRepository);
      return result.league;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`League not found: ${input.leagueId}`);
      }
      throw error;
    }
  }

  async deleteLeague(organizationId: string, leagueId: string): Promise<void> {
    try {
      await deleteLeague({ organizationId, leagueId }, this.leagueRepository);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`League not found: ${leagueId}`);
      }
      throw error;
    }
  }

  async listByOrganization(organizationId: string): Promise<LeagueEntity[]> {
    const result = await listOrganizationLeagues(
      { organizationId },
      this.leagueRepository,
    );
    return result.leagues;
  }
}
