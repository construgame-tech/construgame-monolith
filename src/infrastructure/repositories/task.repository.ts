import {
  TaskChecklistItem,
  TaskEntity,
  TaskProgress,
  TaskUpdate,
} from "@domain/task/entities/task.entity";
import { ITaskRepository } from "@domain/task/repositories/task.repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";
import { DRIZZLE_CONNECTION } from "../database/drizzle.provider";
import { tasks } from "../database/schemas/task.schema";

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  async save(task: TaskEntity): Promise<void> {
    const taskData = {
      id: task.id,
      gameId: task.gameId,
      status: task.status,
      name: task.name,
      rewardPoints: task.rewardPoints,
      isLocked: (task.isLocked ? 1 : 0) as 0 | 1,
      location: task.location || null,
      teamId: task.teamId || null,
      userId: task.userId || null,
      kpiId: task.kpiId || null,
      taskManagerId: task.taskManagerId || null,
      managerId: task.managerId || null,
      description: task.description || null,
      measurementUnit: task.measurementUnit || null,
      totalMeasurementExpected: task.totalMeasurementExpected || null,
      videoUrl: task.videoUrl || null,
      embedVideoUrl: task.embedVideoUrl || null,
      checklist: task.checklist || null,
      startDate: task.startDate || null,
      endDate: task.endDate || null,
      progress: task.progress || null,
      updates: task.updates || null,
      pendingReviewUpdates: task.pendingReviewUpdates || null,
      updatedAt: new Date(),
    };

    // Upsert: insert or update if exists
    await this.db.insert(tasks).values(taskData).onConflictDoUpdate({
      target: tasks.id,
      set: taskData,
    });
  }

  async delete(gameId: string, taskId: string): Promise<void> {
    await this.db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.gameId, gameId)));
  }

  async findById(gameId: string, taskId: string): Promise<TaskEntity | null> {
    const result = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.gameId, gameId)))
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByGameId(gameId: string): Promise<TaskEntity[]> {
    const result = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.gameId, gameId));

    return result.map((row) => this.mapToEntity(row));
  }

  async findByTeamId(teamId: string): Promise<TaskEntity[]> {
    const result = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.teamId, teamId));

    return result.map((row) => this.mapToEntity(row));
  }

  async findByUserId(userId: string): Promise<TaskEntity[]> {
    const result = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    return result.map((row) => this.mapToEntity(row));
  }

  async findByTaskManagerId(taskManagerId: string): Promise<TaskEntity[]> {
    const result = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.taskManagerId, taskManagerId));

    return result.map((row) => this.mapToEntity(row));
  }

  // Helper to map from Drizzle schema to Domain Entity
  private mapToEntity(row: typeof tasks.$inferSelect): TaskEntity {
    return {
      id: row.id,
      gameId: row.gameId,
      status: row.status as "active" | "completed",
      name: row.name,
      rewardPoints: row.rewardPoints,
      isLocked: row.isLocked === 1,
      location: row.location || undefined,
      teamId: row.teamId || undefined,
      userId: row.userId || undefined,
      kpiId: row.kpiId || undefined,
      taskManagerId: row.taskManagerId || undefined,
      managerId: row.managerId || undefined,
      description: row.description || undefined,
      measurementUnit: row.measurementUnit || undefined,
      totalMeasurementExpected: row.totalMeasurementExpected || undefined,
      videoUrl: row.videoUrl || undefined,
      embedVideoUrl: row.embedVideoUrl || undefined,
      checklist: (row.checklist as TaskChecklistItem[]) || undefined,
      startDate: row.startDate || undefined,
      endDate: row.endDate || undefined,
      progress: (row.progress as TaskProgress) || undefined,
      updates: (row.updates as TaskUpdate[]) || undefined,
      pendingReviewUpdates:
        (row.pendingReviewUpdates as { count: number; progress: number }) ||
        undefined,
    };
  }

  /**
   * Find a task by ID only (without gameId).
   * Used for flat routes that only have taskId.
   */
  async findByTaskIdOnly(taskId: string): Promise<TaskEntity | null> {
    const result = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }
}
