// Implementação Drizzle do repositório de Game
// Implementa IGameRepository usando Drizzle ORM + PostgreSQL

import type { GameEntity, IGameRepository } from "@domain/game";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";
import { DRIZZLE_CONNECTION } from "../database/drizzle.provider";
import { games } from "../database/schemas/game.schema";

@Injectable()
export class GameRepository implements IGameRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  async save(game: GameEntity): Promise<void> {
    // Upsert: insert or update if exists
    await this.db
      .insert(games)
      .values({
        id: game.id,
        organizationId: game.organizationId,
        projectId: game.projectId,
        status: game.status,
        name: game.name,
        photo: game.photo || null,
        objective: game.objective || null,
        updateFrequency: game.updateFrequency || null,
        managerId: game.managerId || null,
        responsibles: game.responsibles || null,
        startDate: game.startDate || null,
        endDate: game.endDate || null,
        prizes: game.prizes || null,
        kpis: game.kpis || null,
        archived: (game.archived ? 1 : 0) as 0 | 1,
        gameManagerId: game.gameManagerId || null,
        sequence: game.sequence,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: games.id,
        set: {
          organizationId: game.organizationId,
          projectId: game.projectId,
          status: game.status,
          name: game.name,
          photo: game.photo || null,
          objective: game.objective || null,
          updateFrequency: game.updateFrequency || null,
          managerId: game.managerId || null,
          responsibles: game.responsibles || null,
          startDate: game.startDate || null,
          endDate: game.endDate || null,
          prizes: game.prizes || null,
          kpis: game.kpis || null,
          archived: (game.archived ? 1 : 0) as 0 | 1,
          gameManagerId: game.gameManagerId || null,
          sequence: game.sequence,
          updatedAt: new Date(),
        },
      });
  }

  async delete(organizationId: string, gameId: string): Promise<void> {
    await this.db
      .delete(games)
      .where(
        and(eq(games.id, gameId), eq(games.organizationId, organizationId)),
      );
  }

  async findById(
    organizationId: string,
    gameId: string,
  ): Promise<GameEntity | null> {
    const result = await this.db
      .select()
      .from(games)
      .where(
        and(eq(games.id, gameId), eq(games.organizationId, organizationId)),
      )
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByOrganizationId(organizationId: string): Promise<GameEntity[]> {
    const result = await this.db
      .select()
      .from(games)
      .where(eq(games.organizationId, organizationId));

    return result.map((row) => this.mapToEntity(row));
  }

  async findByProjectId(
    organizationId: string,
    projectId: string,
  ): Promise<GameEntity[]> {
    const result = await this.db
      .select()
      .from(games)
      .where(
        and(
          eq(games.organizationId, organizationId),
          eq(games.projectId, projectId),
        ),
      );

    return result.map((row) => this.mapToEntity(row));
  }

  // Helper para mapear do schema Drizzle para a entidade de domínio
  private mapToEntity(row: typeof games.$inferSelect): GameEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      projectId: row.projectId,
      status: row.status,
      name: row.name,
      photo: row.photo || undefined,
      objective: row.objective || undefined,
      updateFrequency: row.updateFrequency || undefined,
      managerId: row.managerId || undefined,
      responsibles: row.responsibles || undefined,
      startDate: row.startDate || undefined,
      endDate: row.endDate || undefined,
      prizes: row.prizes || undefined,
      kpis: row.kpis || undefined,
      archived: row.archived === 1,
      gameManagerId: row.gameManagerId || undefined,
      sequence: row.sequence,
    };
  }
}
