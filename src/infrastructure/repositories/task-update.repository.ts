import type {
  TaskUpdateEntity,
  TaskUpdateStatus,
} from "@domain/task-update/entities/task-update.entity";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { taskUpdates } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

@Injectable()
export class TaskUpdateRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(entity: TaskUpdateEntity): Promise<TaskUpdateEntity> {
    const [result] = await this.db
      .insert(taskUpdates)
      .values({
        id: entity.id,
        gameId: entity.gameId,
        taskId: entity.taskId,
        status: entity.status,
        submittedBy: entity.submittedBy,
        reviewedBy: entity.reviwedBy,
        reviewNote: entity.reviewNote,
        startDate: entity.startDate?.toISOString().split("T")[0],
        endDate: entity.endDate?.toISOString().split("T")[0],
        participants: entity.participants,
        photos: entity.photos,
        progress: entity.progress as any,
        checklist: entity.checklist,
        files: entity.files,
        sequence: entity.sequence,
      })
      .onConflictDoUpdate({
        target: taskUpdates.id,
        set: {
          status: entity.status,
          reviewedBy: entity.reviwedBy,
          reviewNote: entity.reviewNote,
          startDate: entity.startDate?.toISOString().split("T")[0],
          endDate: entity.endDate?.toISOString().split("T")[0],
          participants: entity.participants,
          photos: entity.photos,
          progress: entity.progress as any,
          checklist: entity.checklist,
          files: entity.files,
          sequence: entity.sequence,
        },
      })
      .returning();

    return this.mapToEntity(result);
  }

  async findById(id: string): Promise<TaskUpdateEntity | null> {
    const [result] = await this.db
      .select()
      .from(taskUpdates)
      .where(eq(taskUpdates.id, id));

    return result ? this.mapToEntity(result) : null;
  }

  async findByTaskId(taskId: string): Promise<TaskUpdateEntity[]> {
    const results = await this.db
      .select()
      .from(taskUpdates)
      .where(eq(taskUpdates.taskId, taskId));

    return results.map((r) => this.mapToEntity(r));
  }

  async findByGameId(gameId: string): Promise<TaskUpdateEntity[]> {
    const results = await this.db
      .select()
      .from(taskUpdates)
      .where(eq(taskUpdates.gameId, gameId));

    return results.map((r) => this.mapToEntity(r));
  }

  async findByStatus(
    gameId: string,
    status: TaskUpdateStatus,
  ): Promise<TaskUpdateEntity[]> {
    const results = await this.db
      .select()
      .from(taskUpdates)
      .where(
        and(eq(taskUpdates.gameId, gameId), eq(taskUpdates.status, status)),
      );

    return results.map((r) => this.mapToEntity(r));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(taskUpdates).where(eq(taskUpdates.id, id));
  }

  private mapToEntity(row: typeof taskUpdates.$inferSelect): TaskUpdateEntity {
    return {
      id: row.id,
      gameId: row.gameId,
      taskId: row.taskId,
      status: row.status as TaskUpdateStatus,
      submittedBy: row.submittedBy,
      reviwedBy: row.reviewedBy || undefined,
      reviewNote: row.reviewNote || undefined,
      startDate: row.startDate ? new Date(row.startDate) : undefined,
      endDate: row.endDate ? new Date(row.endDate) : undefined,
      participants: row.participants as string[] | undefined,
      photos: row.photos as string[] | undefined,
      progress: row.progress as any,
      checklist: row.checklist as any,
      files: row.files as any,
      sequence: row.sequence,
    };
  }
}
