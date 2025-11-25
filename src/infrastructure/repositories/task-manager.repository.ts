import { taskManagers } from "@infrastructure/database/schemas/task-manager.schema";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";

@Injectable()
export class TaskManagerRepository {
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
}
