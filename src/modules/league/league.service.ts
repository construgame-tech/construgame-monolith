import {
  createLeagueEntity,
  LeagueEntity,
  updateLeagueEntity,
} from "@domain/league/entities/league.entity";
import type { ILeagueRepository } from "@domain/league/repositories/league.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";

export interface CreateLeagueInput {
  organizationId: string;
  responsibleId: string;
  name: string;
  photo?: string;
  objective?: string;
  startDate?: string;
  endDate?: string;
  prizes?: any[];
  projects?: string[];
  games?: string[];
  hidden?: boolean;
}

export interface UpdateLeagueInput {
  organizationId: string;
  leagueId: string;
  responsibleId?: string;
  status?: "ACTIVE" | "ARCHIVED" | "DONE" | "PAUSED";
  name?: string;
  photo?: string;
  objective?: string;
  startDate?: string;
  endDate?: string;
  prizes?: any[];
  projects?: string[];
  games?: string[];
  hidden?: boolean;
}

@Injectable()
export class LeagueService {
  constructor(
    @Inject("ILeagueRepository")
    private readonly leagueRepository: ILeagueRepository,
  ) {}

  async createLeague(input: CreateLeagueInput): Promise<LeagueEntity> {
    const league = createLeagueEntity({
      id: randomUUID(),
      organizationId: input.organizationId,
      responsibleId: input.responsibleId,
      name: input.name,
      photo: input.photo,
      objective: input.objective,
      startDate: input.startDate,
      endDate: input.endDate,
      prizes: input.prizes,
      projects: input.projects,
      games: input.games,
      hidden: input.hidden,
    });

    await this.leagueRepository.save(league);
    return league;
  }

  async getLeague(
    organizationId: string,
    leagueId: string,
  ): Promise<LeagueEntity> {
    const league = await this.leagueRepository.findById(
      organizationId,
      leagueId,
    );

    if (!league) {
      throw new NotFoundException(`League not found: ${leagueId}`);
    }

    return league;
  }

  async updateLeague(input: UpdateLeagueInput): Promise<LeagueEntity> {
    const currentLeague = await this.leagueRepository.findById(
      input.organizationId,
      input.leagueId,
    );

    if (!currentLeague) {
      throw new NotFoundException(`League not found: ${input.leagueId}`);
    }

    const updatedLeague = updateLeagueEntity(currentLeague, {
      responsibleId: input.responsibleId,
      status: input.status,
      name: input.name,
      photo: input.photo,
      objective: input.objective,
      startDate: input.startDate,
      endDate: input.endDate,
      prizes: input.prizes,
      projects: input.projects,
      games: input.games,
      hidden: input.hidden,
    });

    await this.leagueRepository.save(updatedLeague);
    return updatedLeague;
  }

  async deleteLeague(organizationId: string, leagueId: string): Promise<void> {
    const league = await this.leagueRepository.findById(
      organizationId,
      leagueId,
    );
    if (!league) {
      throw new NotFoundException(`League not found: ${leagueId}`);
    }
    await this.leagueRepository.delete(organizationId, leagueId);
  }

  async listByOrganization(organizationId: string): Promise<LeagueEntity[]> {
    return this.leagueRepository.findByOrganizationId(organizationId);
  }
}
