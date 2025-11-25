import type { OrgKaizenConfigEntity } from "@domain/organization-config/entities/org-kaizen-config.entity";
import type { IOrgKaizenConfigRepository } from "@domain/organization-config/repositories/org-kaizen-config.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { orgKaizenConfigs } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

@Injectable()
export class OrgKaizenConfigRepository implements IOrgKaizenConfigRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(config: OrgKaizenConfigEntity): Promise<void> {
    await this.db
      .insert(orgKaizenConfigs)
      .values({
        organizationId: config.organizationId,
        categoryPoints: config.categoryPoints,
        sequence: config.sequence,
      })
      .onConflictDoUpdate({
        target: orgKaizenConfigs.organizationId,
        set: {
          categoryPoints: config.categoryPoints,
          sequence: config.sequence,
        },
      });
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<OrgKaizenConfigEntity | null> {
    const result = await this.db
      .select()
      .from(orgKaizenConfigs)
      .where(eq(orgKaizenConfigs.organizationId, organizationId))
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  private mapToEntity(
    row: typeof orgKaizenConfigs.$inferSelect,
  ): OrgKaizenConfigEntity {
    return {
      organizationId: row.organizationId,
      categoryPoints: row.categoryPoints,
      sequence: row.sequence,
    };
  }
}
