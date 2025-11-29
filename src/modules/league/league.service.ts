import {
  CreateLeagueInput,
  createLeague,
  deleteLeague,
  getLeague,
  LeagueEntity,
  listOrganizationLeagues,
  UpdateLeagueInput,
  updateLeague,
} from "@domain/league";
import type { ILeagueRepository } from "@domain/league/repositories/league.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import {
  teamGamePoints,
  userGamePoints,
} from "@infrastructure/database/schemas";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { desc, inArray, sql } from "drizzle-orm";

@Injectable()
export class LeagueService {
  constructor(
    @Inject("ILeagueRepository")
    private readonly leagueRepository: ILeagueRepository,
    @Inject("DRIZZLE_CONNECTION")
    private readonly db: DrizzleDB,
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

  /**
   * Obtém o ranking de uma league.
   *
   * Regra de negócio:
   * - League pode ter projetos e/ou games associados
   * - Ranking agrega pontos de todos os games da league
   * - Pode agrupar por project, team ou user
   * - Empates recebem o mesmo placement
   */
  async getRanking(
    leagueId: string,
    groupBy: "project" | "team" | "user" = "user",
    _sectorId?: string,
  ): Promise<
    Array<{
      id: string;
      name?: string;
      points: number;
      placement: number;
      projectId?: string;
      gameId?: string;
    }>
  > {
    // Buscar a league para obter os games/projects associados
    const league = await this.leagueRepository.findByIdOnly(leagueId);

    if (!league) {
      throw new NotFoundException(`League not found: ${leagueId}`);
    }

    const gameIds = league.games || [];

    if (gameIds.length === 0) {
      return [];
    }

    if (groupBy === "project") {
      // Agrupa por projeto, somando pontos de todos os games do projeto
      const projectPoints = await this.db
        .select({
          projectId: userGamePoints.projectId,
          totalPoints: sql<number>`sum(${userGamePoints.totalPoints})`.as(
            "total_points",
          ),
        })
        .from(userGamePoints)
        .where(inArray(userGamePoints.gameId, gameIds))
        .groupBy(userGamePoints.projectId)
        .orderBy(desc(sql`sum(${userGamePoints.totalPoints})`));

      return this.addPlacementToRanking(
        projectPoints.map((p) => ({
          id: p.projectId,
          projectId: p.projectId,
          points: Number(p.totalPoints) || 0,
        })),
      );
    }

    if (groupBy === "team") {
      // Ranking por time
      const teamRanking = await this.db
        .select({
          teamId: teamGamePoints.teamId,
          totalPoints: sql<number>`sum(${teamGamePoints.totalPoints})`.as(
            "total_points",
          ),
        })
        .from(teamGamePoints)
        .where(inArray(teamGamePoints.gameId, gameIds))
        .groupBy(teamGamePoints.teamId)
        .orderBy(desc(sql`sum(${teamGamePoints.totalPoints})`));

      return this.addPlacementToRanking(
        teamRanking.map((t) => ({
          id: t.teamId,
          points: Number(t.totalPoints) || 0,
        })),
      );
    }

    // Default: ranking por usuário
    const userRanking = await this.db
      .select({
        userId: userGamePoints.userId,
        totalPoints: sql<number>`sum(${userGamePoints.totalPoints})`.as(
          "total_points",
        ),
      })
      .from(userGamePoints)
      .where(inArray(userGamePoints.gameId, gameIds))
      .groupBy(userGamePoints.userId)
      .orderBy(desc(sql`sum(${userGamePoints.totalPoints})`));

    return this.addPlacementToRanking(
      userRanking.map((u) => ({
        id: u.userId,
        points: Number(u.totalPoints) || 0,
      })),
    );
  }

  /**
   * Adiciona placement ao ranking, considerando empates.
   */
  private addPlacementToRanking<T extends { points: number }>(
    ranking: T[],
  ): (T & { placement: number })[] {
    let currentPlacement = 0;
    let lastPoints: number | null = null;

    return ranking.map((item, index) => {
      if (lastPoints === null || item.points !== lastPoints) {
        currentPlacement = index + 1;
        lastPoints = item.points;
      }

      return {
        ...item,
        placement: currentPlacement,
      };
    });
  }
}
