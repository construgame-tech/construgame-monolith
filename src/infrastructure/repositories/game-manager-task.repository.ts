// Repositório de GameManagerTask
// Implementa a interface IGameManagerTaskRepository do domínio

import type {
  GameManagerTaskEntity,
  IGameManagerTaskRepository,
} from "@domain/game-manager";
import { gameManagerTasks } from "@infrastructure/database/schemas/game-manager.schema";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  DRIZZLE_CONNECTION,
  type DrizzleDB,
} from "../database/drizzle.provider";

@Injectable()
export class GameManagerTaskRepository implements IGameManagerTaskRepository {
  constructor(@Inject(DRIZZLE_CONNECTION) private readonly db: DrizzleDB) {}

  async save(task: GameManagerTaskEntity): Promise<void> {
    await this.db
      .insert(gameManagerTasks)
      .values({
        id: task.id,
        gameManagerId: task.gameManagerId,
        organizationId: task.organizationId,
        projectId: task.projectId,
        name: task.name,
        kpiId: task.kpiId,
        description: task.description,
        rewardPoints: task.rewardPoints,
      })
      .onConflictDoUpdate({
        target: gameManagerTasks.id,
        set: {
          name: task.name,
          kpiId: task.kpiId,
          description: task.description,
          rewardPoints: task.rewardPoints,
          updatedAt: new Date(),
        },
      });
  }

  async findById(id: string): Promise<GameManagerTaskEntity | null> {
    const result = await this.db
      .select()
      .from(gameManagerTasks)
      .where(eq(gameManagerTasks.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      gameManagerId: row.gameManagerId,
      organizationId: row.organizationId,
      projectId: row.projectId,
      name: row.name,
      kpiId: row.kpiId ?? undefined,
      description: row.description ?? undefined,
      rewardPoints: row.rewardPoints ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findByGameManagerId(
    gameManagerId: string,
  ): Promise<GameManagerTaskEntity[]> {
    const result = await this.db
      .select()
      .from(gameManagerTasks)
      .where(eq(gameManagerTasks.gameManagerId, gameManagerId));

    return result.map((row) => ({
      id: row.id,
      gameManagerId: row.gameManagerId,
      organizationId: row.organizationId,
      projectId: row.projectId,
      name: row.name,
      kpiId: row.kpiId ?? undefined,
      description: row.description ?? undefined,
      rewardPoints: row.rewardPoints ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(gameManagerTasks).where(eq(gameManagerTasks.id, id));
  }

  async deleteByGameManagerId(gameManagerId: string): Promise<void> {
    await this.db
      .delete(gameManagerTasks)
      .where(eq(gameManagerTasks.gameManagerId, gameManagerId));
  }
}
