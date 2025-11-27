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

      return teams.map((t) => ({
        teamId: t.teamId,
        name: t.teamId, // Idealmente buscar nome do time
        points: t.totalPoints,
      }));
    }

    // Default: user ranking
    const users = await this.db
      .select()
      .from(userGamePoints)
      .where(eq(userGamePoints.gameId, gameId))
      .orderBy(desc(userGamePoints.totalPoints));

    return users.map((u) => ({
      userId: u.userId,
      name: u.userId, // Idealmente buscar nome do usuário
      points: u.totalPoints,
    }));
  }
}
