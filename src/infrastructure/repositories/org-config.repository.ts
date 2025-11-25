import type { OrgConfigEntity } from "@domain/organization-config/entities/org-config.entity";
import type { IOrgConfigRepository } from "@domain/organization-config/repositories/org-config.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { orgConfigs } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

@Injectable()
export class OrgConfigRepository implements IOrgConfigRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(config: OrgConfigEntity): Promise<void> {
    await this.db
      .insert(orgConfigs)
      .values({
        organizationId: config.organizationId,
        missionsEnabled: config.missionsEnabled,
        financialEnabled: config.financialEnabled,
        kaizensEnabled: config.kaizensEnabled,
        projectDiaryEnabled: config.projectDiaryEnabled,
        missionConfig: config.missionConfig,
        theme: config.theme,
        auth: config.auth,
        sequence: config.sequence,
      })
      .onConflictDoUpdate({
        target: orgConfigs.organizationId,
        set: {
          missionsEnabled: config.missionsEnabled,
          financialEnabled: config.financialEnabled,
          kaizensEnabled: config.kaizensEnabled,
          projectDiaryEnabled: config.projectDiaryEnabled,
          missionConfig: config.missionConfig,
          theme: config.theme,
          auth: config.auth,
          sequence: config.sequence,
        },
      });
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<OrgConfigEntity | null> {
    const result = await this.db
      .select()
      .from(orgConfigs)
      .where(eq(orgConfigs.organizationId, organizationId))
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  private mapToEntity(row: typeof orgConfigs.$inferSelect): OrgConfigEntity {
    return {
      organizationId: row.organizationId,
      missionsEnabled: row.missionsEnabled,
      financialEnabled: row.financialEnabled,
      kaizensEnabled: row.kaizensEnabled,
      projectDiaryEnabled: row.projectDiaryEnabled ?? undefined,
      missionConfig: row.missionConfig ?? undefined,
      theme: row.theme,
      auth: row.auth,
      sequence: row.sequence,
    };
  }
}
