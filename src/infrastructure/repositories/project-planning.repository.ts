import {
  activities,
  macrostepOrders,
  macrosteps,
} from "@infrastructure/database/schemas/project-planning.schema";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";

@Injectable()
export class ProjectPlanningRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  // ========== Macrosteps ==========

  async createMacrostep(data: typeof macrosteps.$inferInsert) {
    const [result] = await this.db.insert(macrosteps).values(data).returning();
    return result;
  }

  async getMacrostepById(projectId: string, macrostepId: string) {
    const [result] = await this.db
      .select()
      .from(macrosteps)
      .where(
        and(
          eq(macrosteps.projectId, projectId),
          eq(macrosteps.id, macrostepId),
        ),
      );
    return result;
  }

  async listMacrostepsByProject(projectId: string) {
    return this.db
      .select()
      .from(macrosteps)
      .where(eq(macrosteps.projectId, projectId))
      .orderBy(desc(macrosteps.createdAt));
  }

  async updateMacrostep(
    projectId: string,
    macrostepId: string,
    data: Partial<typeof macrosteps.$inferInsert>,
  ) {
    const [result] = await this.db
      .update(macrosteps)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(macrosteps.projectId, projectId),
          eq(macrosteps.id, macrostepId),
        ),
      )
      .returning();
    return result;
  }

  async deleteMacrostep(projectId: string, macrostepId: string) {
    await this.db
      .delete(macrosteps)
      .where(
        and(
          eq(macrosteps.projectId, projectId),
          eq(macrosteps.id, macrostepId),
        ),
      );
  }

  // ========== Activities ==========

  async createActivity(data: typeof activities.$inferInsert) {
    const [result] = await this.db.insert(activities).values(data).returning();
    return result;
  }

  async getActivityById(macrostepId: string, activityId: string) {
    const [result] = await this.db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.macrostepId, macrostepId),
          eq(activities.id, activityId),
        ),
      );
    return result;
  }

  async listActivitiesByMacrostep(macrostepId: string) {
    return this.db
      .select()
      .from(activities)
      .where(eq(activities.macrostepId, macrostepId))
      .orderBy(desc(activities.createdAt));
  }

  async updateActivity(
    macrostepId: string,
    activityId: string,
    data: Partial<typeof activities.$inferInsert>,
  ) {
    const [result] = await this.db
      .update(activities)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(activities.macrostepId, macrostepId),
          eq(activities.id, activityId),
        ),
      )
      .returning();
    return result;
  }

  async deleteActivity(macrostepId: string, activityId: string) {
    await this.db
      .delete(activities)
      .where(
        and(
          eq(activities.macrostepId, macrostepId),
          eq(activities.id, activityId),
        ),
      );
  }

  // ========== Macrostep Orders ==========

  async getMacrostepOrder(projectId: string) {
    const [result] = await this.db
      .select()
      .from(macrostepOrders)
      .where(eq(macrostepOrders.projectId, projectId));
    return result;
  }

  async upsertMacrostepOrder(data: typeof macrostepOrders.$inferInsert) {
    const [result] = await this.db
      .insert(macrostepOrders)
      .values(data)
      .onConflictDoUpdate({
        target: macrostepOrders.projectId,
        set: {
          macrostepIds: data.macrostepIds,
          sequence: data.sequence,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Helper: Calcular progresso de um macrostep baseado em suas activities
  calculateMacrostepProgress(
    activitiesList: Array<{ progressPercent: number | null }>,
  ) {
    if (activitiesList.length === 0) return 0;
    const totalProgress = activitiesList.reduce(
      (sum, activity) => sum + (activity.progressPercent || 0),
      0,
    );
    return totalProgress / activitiesList.length;
  }
}
