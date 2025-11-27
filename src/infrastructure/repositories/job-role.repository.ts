import type { JobRoleEntity } from "@domain/job-role/entities/job-role.entity";
import type { IJobRoleRepository } from "@domain/job-role/repositories/job-role.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { jobRoles } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

@Injectable()
export class JobRoleRepository implements IJobRoleRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(jobRole: JobRoleEntity): Promise<void> {
    await this.db
      .insert(jobRoles)
      .values({
        id: jobRole.id,
        organizationId: jobRole.organizationId,
        name: jobRole.name,
        variants: jobRole.variants ?? [],
        updatedBy: jobRole.updatedBy,
        updatedAt: jobRole.updatedAt,
        createdAt: jobRole.createdAt,
        createdBy: jobRole.createdBy,
        sequence: jobRole.sequence,
      })
      .onConflictDoUpdate({
        target: jobRoles.id,
        set: {
          name: jobRole.name,
          variants: jobRole.variants ?? [],
          updatedBy: jobRole.updatedBy,
          updatedAt: jobRole.updatedAt,
          sequence: jobRole.sequence,
        },
      });
  }

  async delete(organizationId: string, jobRoleId: string): Promise<void> {
    await this.db
      .delete(jobRoles)
      .where(
        and(
          eq(jobRoles.id, jobRoleId),
          eq(jobRoles.organizationId, organizationId),
        ),
      );
  }

  async findById(
    organizationId: string,
    jobRoleId: string,
  ): Promise<JobRoleEntity | null> {
    const result = await this.db
      .select()
      .from(jobRoles)
      .where(
        and(
          eq(jobRoles.id, jobRoleId),
          eq(jobRoles.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByOrganizationId(organizationId: string): Promise<JobRoleEntity[]> {
    const result = await this.db
      .select()
      .from(jobRoles)
      .where(eq(jobRoles.organizationId, organizationId));

    return result.map(this.mapToEntity);
  }

  private mapToEntity(row: typeof jobRoles.$inferSelect): JobRoleEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      variants: row.variants ?? [],
      updatedBy: row.updatedBy ?? undefined,
      updatedAt: row.updatedAt ?? undefined,
      createdAt: row.createdAt ?? undefined,
      createdBy: row.createdBy ?? undefined,
      sequence: row.sequence,
    };
  }
}
