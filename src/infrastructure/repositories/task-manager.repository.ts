import type {
  ITaskProgressRepository,
  TaskData,
} from "@domain/project-planning";
import { taskManagers } from "@infrastructure/database/schemas/task-manager.schema";
import { Inject, Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";

@Injectable()
export class TaskManagerRepository implements ITaskProgressRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async create(data: typeof taskManagers.$inferInsert) {
    const [result] = await this.db
      .insert(taskManagers)
      .values(data)
      .returning();
    return result;
  }

  async getById(id: string) {
    const [result] = await this.db
      .select()
      .from(taskManagers)
      .where(eq(taskManagers.id, id));
    return result;
  }

  async listByGameId(gameId: string) {
    return this.db
      .select()
      .from(taskManagers)
      .where(eq(taskManagers.gameId, gameId));
  }

  async update(id: string, data: Partial<typeof taskManagers.$inferInsert>) {
    const [result] = await this.db
      .update(taskManagers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(taskManagers.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    await this.db.delete(taskManagers).where(eq(taskManagers.id, id));
  }

  async updateChecklist(
    id: string,
    checklist: typeof taskManagers.$inferSelect.checklist,
  ) {
    const [result] = await this.db
      .update(taskManagers)
      .set({ checklist, updatedAt: new Date() })
      .where(eq(taskManagers.id, id))
      .returning();
    return result;
  }

  async incrementSequence(id: string, currentSequence: number) {
    const [result] = await this.db
      .update(taskManagers)
      .set({ sequence: currentSequence + 1, updatedAt: new Date() })
      .where(eq(taskManagers.id, id))
      .returning();
    return result;
  }

  /**
   * Busca task managers associados a uma activity específica
   * Usa query SQL para filtrar pelo campo JSONB macrostep.activityId
   */
  async listByActivityId(activityId: string) {
    return this.db
      .select()
      .from(taskManagers)
      .where(sql`${taskManagers.macrostep}->>'activityId' = ${activityId}`);
  }

  /**
   * Busca task managers associados a um macrostep específico
   */
  async listByMacrostepId(macrostepId: string) {
    return this.db
      .select()
      .from(taskManagers)
      .where(sql`${taskManagers.macrostep}->>'macrostepId' = ${macrostepId}`);
  }

  // ========== ITaskProgressRepository Implementation ==========

  /**
   * Busca tasks (TaskManagers) associadas a uma activity específica
   * Retorna apenas o progressAbsolute de cada uma
   */
  async findTasksByActivityId(activityId: string): Promise<TaskData[]> {
    const result = await this.db
      .select({ progressAbsolute: taskManagers.progressAbsolute })
      .from(taskManagers)
      .where(sql`${taskManagers.macrostep}->>'activityId' = ${activityId}`);

    return result.map((r) => ({
      progressAbsolute: r.progressAbsolute ?? 0,
    }));
  }
}
