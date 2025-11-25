import type { KaizenTypeEntity } from "@domain/kaizen-type/entities/kaizen-type.entity";
import type { IKaizenTypeRepository } from "@domain/kaizen-type/repositories/kaizen-type.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { kaizenTypes } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

@Injectable()
export class KaizenTypeRepository implements IKaizenTypeRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(type: KaizenTypeEntity): Promise<void> {
    await this.db
      .insert(kaizenTypes)
      .values({
        id: type.id,
        organizationId: type.organizationId,
        name: type.name,
        description: type.description,
        points: type.points,
        ideaPoints: type.ideaPoints,
        ideaExecutionPoints: type.ideaExecutionPoints,
        sequence: type.sequence,
      })
      .onConflictDoUpdate({
        target: kaizenTypes.id,
        set: {
          name: type.name,
          description: type.description,
          points: type.points,
          ideaPoints: type.ideaPoints,
          ideaExecutionPoints: type.ideaExecutionPoints,
          sequence: type.sequence,
        },
      });
  }

  async delete(organizationId: string, typeId: string): Promise<void> {
    await this.db
      .delete(kaizenTypes)
      .where(
        and(
          eq(kaizenTypes.id, typeId),
          eq(kaizenTypes.organizationId, organizationId),
        ),
      );
  }

  async findById(
    organizationId: string,
    typeId: string,
  ): Promise<KaizenTypeEntity | null> {
    const result = await this.db
      .select()
      .from(kaizenTypes)
      .where(
        and(
          eq(kaizenTypes.id, typeId),
          eq(kaizenTypes.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<KaizenTypeEntity[]> {
    const result = await this.db
      .select()
      .from(kaizenTypes)
      .where(eq(kaizenTypes.organizationId, organizationId));

    return result.map(this.mapToEntity);
  }

  private mapToEntity(row: typeof kaizenTypes.$inferSelect): KaizenTypeEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      description: row.description ?? undefined,
      points: row.points,
      ideaPoints: row.ideaPoints ?? undefined,
      ideaExecutionPoints: row.ideaExecutionPoints ?? undefined,
      sequence: row.sequence,
    };
  }
}
