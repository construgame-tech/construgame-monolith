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
      })
      .onConflictDoUpdate({
        target: jobRoles.id,
        set: {
          name: jobRole.name,
          variants: jobRole.variants ?? [],
          updatedBy: jobRole.updatedBy,
          updatedAt: jobRole.updatedAt,
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

    return result.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(row: typeof jobRoles.$inferSelect): JobRoleEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      variants: row.variants ?? [],
      updatedBy: row.updatedBy ?? undefined,
      updatedAt: this.formatTimestamp(row.updatedAt),
      createdAt: this.formatTimestamp(row.createdAt),
      createdBy: row.createdBy ?? undefined,
    };
  }

  /**
   * Converte timestamp do banco para formato ISO 8601
   */
  private formatTimestamp(
    timestamp: string | null | undefined,
  ): string | undefined {
    if (!timestamp) return undefined;
    // Se já estiver em formato ISO, retorna como está
    if (timestamp.includes("T")) return timestamp;
    // Converte de "2025-11-28 23:52:15.493" para "2025-11-28T23:52:15.493Z"
    return new Date(timestamp).toISOString();
  }
}
