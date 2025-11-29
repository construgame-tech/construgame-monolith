import {
  archiveGame,
  createGame,
  deleteGame,
  getGame,
  listOrganizationGames,
  listProjectGames,
  unarchiveGame,
  updateGame,
} from "@domain/game";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import {
  teamGamePoints,
  userGamePoints,
} from "@infrastructure/database/schemas";
import { GameRepository } from "@infrastructure/repositories/game.repository";
import { Inject, Injectable } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import type { CreateGameDto } from "./dto/create-game.dto";
import type { UpdateGameDto } from "./dto/update-game.dto";

@Injectable()
export class GameService {
  constructor(
    @Inject(GameRepository)
    private readonly gameRepository: GameRepository,
    @Inject("DRIZZLE_CONNECTION")
    private readonly db: DrizzleDB,
  ) {}

  async create(createGameDto: CreateGameDto) {
    const result = await createGame(
      {
        organizationId: createGameDto.organizationId,
        projectId: createGameDto.projectId,
        name: createGameDto.name,
        gameManagerId: createGameDto.gameManagerId,
        photo: createGameDto.photo,
        startDate: createGameDto.startDate,
        endDate: createGameDto.endDate,
        managerId: createGameDto.managerId,
        responsibles: createGameDto.responsibles,
        objective: createGameDto.objective,
        prizes: createGameDto.prizes,
        kpis: createGameDto.kpis,
        updateFrequency: createGameDto.updateFrequency,
      },
      this.gameRepository,
    );

    return result.game;
  }

  async update(
    organizationId: string,
    gameId: string,
    updateGameDto: UpdateGameDto,
  ) {
    const result = await updateGame(
      {
        organizationId,
        gameId,
        ...updateGameDto,
      },
      this.gameRepository,
    );

    return result.game;
  }

  async remove(organizationId: string, gameId: string) {
    await deleteGame({ organizationId, gameId }, this.gameRepository);
  }

  async archive(organizationId: string, gameId: string) {
    const result = await archiveGame(
      { organizationId, gameId },
      this.gameRepository,
    );
    return result.game;
  }

  async unarchive(organizationId: string, gameId: string) {
    const result = await unarchiveGame(
      { organizationId, gameId },
      this.gameRepository,
    );
    return result.game;
  }

  async findById(organizationId: string, gameId: string) {
    const result = await getGame(
      { organizationId, gameId },
      this.gameRepository,
    );

    return result.game;
  }

  async listByOrganization(organizationId: string) {
    const result = await listOrganizationGames(
      { organizationId },
      this.gameRepository,
    );
    return result.games;
  }

  async listByProject(organizationId: string, projectId: string) {
    const result = await listProjectGames(
      { organizationId, projectId },
      this.gameRepository,
    );
    return result.games;
  }

  async getRanking(
    gameId: string,
    groupBy: "user" | "team",
    _sectorId?: string,
  ) {
    if (groupBy === "team") {
      const teams = await this.db
        .select()
        .from(teamGamePoints)
        .where(eq(teamGamePoints.gameId, gameId))
        .orderBy(desc(teamGamePoints.totalPoints));

      return this.addPlacementToRanking(
        teams.map((t) => ({
          teamId: t.teamId,
          name: t.teamId, // Idealmente buscar nome do time
          points: t.totalPoints,
        })),
      );
    }

    // Default: user ranking
    const users = await this.db
      .select()
      .from(userGamePoints)
      .where(eq(userGamePoints.gameId, gameId))
      .orderBy(desc(userGamePoints.totalPoints));

    return this.addPlacementToRanking(
      users.map((u) => ({
        userId: u.userId,
        name: u.userId, // Idealmente buscar nome do usuário
        points: u.totalPoints,
      })),
    );
  }

  /**
   * Adiciona placement ao ranking, considerando empates.
   *
   * Regra de negócio:
   * - Ranking ordenado por pontos decrescentes
   * - Empates recebem o mesmo número de placement
   * - Próximo placement é o número real na lista (não pula)
   *
   * Exemplo:
   * - 100 pontos → placement 1
   * - 100 pontos → placement 1 (empate)
   * - 80 pontos → placement 3 (não 2)
   */
  private addPlacementToRanking<T extends { points: number }>(
    ranking: T[],
  ): (T & { placement: number })[] {
    let currentPlacement = 0;
    let lastPoints: number | null = null;

    return ranking.map((item, index) => {
      // Se os pontos são diferentes do anterior, atualiza o placement
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
