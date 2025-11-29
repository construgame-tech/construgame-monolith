// Repositório de GameManager
// Implementa a interface IGameManagerRepository do domínio

import type {
  GameManagerEntity,
  IGameManagerRepository,
} from "@domain/game-manager";
import { gameManagers } from "@infrastructure/database/schemas/game-manager.schema";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  DRIZZLE_CONNECTION,
  type DrizzleDB,
} from "../database/drizzle.provider";

@Injectable()
export class GameManagerRepository implements IGameManagerRepository {
  constructor(@Inject(DRIZZLE_CONNECTION) private readonly db: DrizzleDB) {}

  async save(gameManager: GameManagerEntity): Promise<void> {
    await this.db
      .insert(gameManagers)
      .values({
        id: gameManager.id,
        organizationId: gameManager.organizationId,
        projectId: gameManager.projectId,
        name: gameManager.name,
        photo: gameManager.photo,
        objective: gameManager.objective,
        updateFrequency: gameManager.updateFrequency,
        managerId: gameManager.managerId,
        responsibles: gameManager.responsibles,
        startDate: gameManager.startDate,
        endDate: gameManager.endDate,
        gameLength: gameManager.gameLength,
      })
      .onConflictDoUpdate({
        target: gameManagers.id,
        set: {
          name: gameManager.name,
          photo: gameManager.photo,
          objective: gameManager.objective,
          updateFrequency: gameManager.updateFrequency,
          managerId: gameManager.managerId,
          responsibles: gameManager.responsibles,
          startDate: gameManager.startDate,
          endDate: gameManager.endDate,
          gameLength: gameManager.gameLength,
          updatedAt: new Date(),
        },
      });
  }

  async findById(id: string): Promise<GameManagerEntity | null> {
    const result = await this.db
      .select()
      .from(gameManagers)
      .where(eq(gameManagers.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      organizationId: row.organizationId,
      projectId: row.projectId,
      name: row.name,
      photo: row.photo ?? undefined,
      objective: row.objective ?? undefined,
      updateFrequency: row.updateFrequency ?? undefined,
      managerId: row.managerId ?? undefined,
      responsibles: row.responsibles ?? undefined,
      startDate: row.startDate ?? undefined,
      endDate: row.endDate ?? undefined,
      gameLength: row.gameLength ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<GameManagerEntity[]> {
    const result = await this.db
      .select()
      .from(gameManagers)
      .where(eq(gameManagers.organizationId, organizationId));

    return result.map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      projectId: row.projectId,
      name: row.name,
      photo: row.photo ?? undefined,
      objective: row.objective ?? undefined,
      updateFrequency: row.updateFrequency ?? undefined,
      managerId: row.managerId ?? undefined,
      responsibles: row.responsibles ?? undefined,
      startDate: row.startDate ?? undefined,
      endDate: row.endDate ?? undefined,
      gameLength: row.gameLength ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(gameManagers).where(eq(gameManagers.id, id));
  }
}
