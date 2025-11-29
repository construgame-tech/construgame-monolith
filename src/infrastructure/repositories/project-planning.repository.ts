import type {
  ActivityData,
  IActivityProgressRepository,
} from "@domain/project-planning";
import {
  activities,
  macrostepOrders,
  macrosteps,
} from "@infrastructure/database/schemas/project-planning.schema";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";

@Injectable()
export class ProjectPlanningRepository implements IActivityProgressRepository {
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
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // ========== IActivityProgressRepository Implementation ==========

  /**
   * Busca uma activity pelo ID (implementação de IActivityProgressRepository)
   */
  async findActivityById(activityId: string): Promise<ActivityData | null> {
    const [result] = await this.db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId));

    if (!result) return null;

    return {
      id: result.id,
      macrostepId: result.macrostepId,
      totalMeasurementExpected: result.totalMeasurementExpected,
      progressPercent: result.progressPercent,
    };
  }

  /**
   * Atualiza o progresso de uma activity pelo ID
   */
  async updateActivityProgress(
    activityId: string,
    progressPercent: number,
  ): Promise<void> {
    await this.db
      .update(activities)
      .set({ progressPercent, updatedAt: new Date() })
      .where(eq(activities.id, activityId));
  }

  /**
   * Busca activities pelo macrostepId (implementação de IActivityProgressRepository)
   */
  async findActivitiesByMacrostepId(
    macrostepId: string,
  ): Promise<ActivityData[]> {
    const result = await this.db
      .select()
      .from(activities)
      .where(eq(activities.macrostepId, macrostepId));

    return result.map((a) => ({
      id: a.id,
      macrostepId: a.macrostepId,
      totalMeasurementExpected: a.totalMeasurementExpected,
      progressPercent: a.progressPercent,
    }));
  }

  /**
   * Atualiza o progresso de um macrostep pelo ID
   */
  async updateMacrostepProgress(
    macrostepId: string,
    progressPercent: number,
  ): Promise<void> {
    await this.db
      .update(macrosteps)
      .set({ progressPercent, updatedAt: new Date() })
      .where(eq(macrosteps.id, macrostepId));
  }

  /**
   * Calcula o progresso do macrostep baseado nas activities
   */
  calculateMacrostepProgress(
    activitiesList: Array<{ progressPercent?: number | null }>,
  ): number {
    if (activitiesList.length === 0) return 0;
    const total = activitiesList.reduce(
      (sum, a) => sum + (a.progressPercent || 0),
      0,
    );
    return Math.round(total / activitiesList.length);
  }

  /**
   * Calcula e atualiza o progresso da activity baseado nas tasks
   */
  async calculateActivityProgress(activityId: string): Promise<void> {
    // Busca as tasks associadas à activity via TaskManager
    // Por enquanto, mantém o progresso atual - implementar cálculo real quando necessário
  }

  // ========== Legacy Methods (para manter compatibilidade) ==========

  /**
   * Busca uma activity apenas pelo ID (sem necessidade do macrostepId)
   * @deprecated Use findActivityById ao invés
   */
  async getActivityByIdOnly(activityId: string) {
    const [result] = await this.db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId));
    return result;
  }
}
