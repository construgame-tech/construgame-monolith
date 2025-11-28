/**
 * Exemplo de implementação de cache agressivo no GameService
 * 
 * Este arquivo mostra como aplicar o padrão de cache em qualquer service.
 * Copie este padrão para outros services conforme necessário.
 */

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
import { DynamoCacheService, CacheEntityTypes } from "@infrastructure/services/cache";
import { Inject, Injectable } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import type { CreateGameDto } from "./dto/create-game.dto";
import type { UpdateGameDto } from "./dto/update-game.dto";

// TTL configurações (em segundos)
const CACHE_TTL = {
  GAME_LIST: 3600,      // 1 hora
  GAME_DETAIL: 3600,    // 1 hora
  GAME_RANKING: 300,    // 5 minutos (muda mais frequentemente)
};

@Injectable()
export class GameServiceWithCache {
  constructor(
    @Inject(GameRepository)
    private readonly gameRepository: GameRepository,
    @Inject("DRIZZLE_CONNECTION")
    private readonly db: DrizzleDB,
    private readonly cache: DynamoCacheService,
  ) {}

  // ==================== READ OPERATIONS (com cache) ====================

  async findById(organizationId: string, gameId: string) {
    const cacheKey = this.cache.buildKey(
      CacheEntityTypes.GAMES,
      organizationId,
      gameId
    );

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const result = await getGame(
          { organizationId, gameId },
          this.gameRepository,
        );
        return result.game;
      },
      { ttlSeconds: CACHE_TTL.GAME_DETAIL }
    );
  }

  async listByOrganization(organizationId: string) {
    const cacheKey = this.cache.buildKey(
      CacheEntityTypes.GAMES,
      organizationId,
      'list'
    );

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const result = await listOrganizationGames(
          { organizationId },
          this.gameRepository,
        );
        return result.games;
      },
      { ttlSeconds: CACHE_TTL.GAME_LIST }
    );
  }

  async listByProject(organizationId: string, projectId: string) {
    const cacheKey = this.cache.buildKey(
      CacheEntityTypes.GAMES,
      organizationId,
      `project:${projectId}`
    );

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const result = await listProjectGames(
          { organizationId, projectId },
          this.gameRepository,
        );
        return result.games;
      },
      { ttlSeconds: CACHE_TTL.GAME_LIST }
    );
  }

  async getRanking(
    organizationId: string,
    gameId: string,
    groupBy: "user" | "team",
    _sectorId?: string,
  ) {
    const cacheKey = this.cache.buildKey(
      CacheEntityTypes.GAMES,
      organizationId,
      `ranking:${gameId}:${groupBy}`
    );

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        if (groupBy === "team") {
          const teams = await this.db
            .select()
            .from(teamGamePoints)
            .where(eq(teamGamePoints.gameId, gameId))
            .orderBy(desc(teamGamePoints.totalPoints));

          return teams.map((t) => ({
            teamId: t.teamId,
            name: t.teamId,
            points: t.totalPoints,
          }));
        }

        const users = await this.db
          .select()
          .from(userGamePoints)
          .where(eq(userGamePoints.gameId, gameId))
          .orderBy(desc(userGamePoints.totalPoints));

        return users.map((u) => ({
          userId: u.userId,
          name: u.userId,
          points: u.totalPoints,
        }));
      },
      { ttlSeconds: CACHE_TTL.GAME_RANKING }
    );
  }

  // ==================== WRITE OPERATIONS (invalidam cache) ====================

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

    // Invalida cache da lista de games (novo game foi adicionado)
    await this.invalidateGameCaches(createGameDto.organizationId);

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

    // Invalida cache do game específico E das listas
    await this.invalidateGameCaches(organizationId, gameId);

    return result.game;
  }

  async remove(organizationId: string, gameId: string) {
    await deleteGame({ organizationId, gameId }, this.gameRepository);

    // Invalida todos os caches de games da organização
    await this.invalidateGameCaches(organizationId, gameId);
  }

  async archive(organizationId: string, gameId: string) {
    const result = await archiveGame(
      { organizationId, gameId },
      this.gameRepository,
    );

    await this.invalidateGameCaches(organizationId, gameId);

    return result.game;
  }

  async unarchive(organizationId: string, gameId: string) {
    const result = await unarchiveGame(
      { organizationId, gameId },
      this.gameRepository,
    );

    await this.invalidateGameCaches(organizationId, gameId);

    return result.game;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Invalida caches relacionados a games de uma organização
   * 
   * @param organizationId - ID da organização
   * @param gameId - ID do game específico (opcional)
   */
  private async invalidateGameCaches(
    organizationId: string,
    gameId?: string
  ): Promise<void> {
    const invalidations: Promise<void>[] = [];

    // Sempre invalida a entidade inteira (listas, etc)
    invalidations.push(
      this.cache.invalidateByEntity(CacheEntityTypes.GAMES, organizationId)
    );

    // Se tiver gameId, invalida cache específico também
    if (gameId) {
      invalidations.push(
        this.cache.delete(
          this.cache.buildKey(CacheEntityTypes.GAMES, organizationId, gameId)
        )
      );
    }

    await Promise.all(invalidations);
  }
}
