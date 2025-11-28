import type { TaskTemplateEntity } from "@domain/task-template/entities/task-template.entity";
import type { ITaskTemplateRepository } from "@domain/task-template/repositories/task-template.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { taskTemplates } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

@Injectable()
export class TaskTemplateRepository implements ITaskTemplateRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(entity: TaskTemplateEntity): Promise<TaskTemplateEntity> {
    const [result] = await this.db
      .insert(taskTemplates)
      .values({
        id: entity.id,
        organizationId: entity.organizationId,
        kpiId: entity.kpiId,
        name: entity.name,
        rewardPoints: entity.rewardPoints,
        description: entity.description,
        measurementUnit: entity.measurementUnit,
        totalMeasurementExpected: entity.totalMeasurementExpected,
      })
      .onConflictDoUpdate({
        target: taskTemplates.id,
        set: {
          kpiId: entity.kpiId,
          name: entity.name,
          rewardPoints: entity.rewardPoints,
          description: entity.description,
          measurementUnit: entity.measurementUnit,
          totalMeasurementExpected: entity.totalMeasurementExpected,
        },
      })
      .returning();

    return this.mapToEntity(result);
  }

  async findById(id: string): Promise<TaskTemplateEntity | null> {
    const [result] = await this.db
      .select()
      .from(taskTemplates)
      .where(eq(taskTemplates.id, id));

    return result ? this.mapToEntity(result) : null;
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<TaskTemplateEntity[]> {
    const results = await this.db
      .select()
      .from(taskTemplates)
      .where(eq(taskTemplates.organizationId, organizationId));

    return results.map((r) => this.mapToEntity(r));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(taskTemplates).where(eq(taskTemplates.id, id));
  }

  private mapToEntity(
    row: typeof taskTemplates.$inferSelect,
  ): TaskTemplateEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      kpiId: row.kpiId,
      name: row.name,
      rewardPoints: row.rewardPoints,
      description: row.description || undefined,
      measurementUnit: row.measurementUnit || undefined,
      totalMeasurementExpected: row.totalMeasurementExpected || undefined,
    };
  }
}
