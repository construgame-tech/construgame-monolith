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
import type { GameRepository } from "@infrastructure/repositories/game.repository";
import { Injectable } from "@nestjs/common";
import type { CreateGameDto } from "./dto/create-game.dto";
import type { UpdateGameDto } from "./dto/update-game.dto";

@Injectable()
export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}

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

    if (!result.game) {
      return null;
    }

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
}
