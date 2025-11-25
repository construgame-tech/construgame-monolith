import type { SectorEntity } from "@domain/organization-config/entities/sector.entity";
import type { ISectorRepository } from "@domain/organization-config/repositories/sector.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { sectors } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

@Injectable()
export class SectorRepository implements ISectorRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(sector: SectorEntity): Promise<void> {
    await this.db
      .insert(sectors)
      .values({
        id: sector.id,
        organizationId: sector.organizationId,
        name: sector.name,
      })
      .onConflictDoUpdate({
        target: sectors.id,
        set: {
          name: sector.name,
        },
      });
  }

  async delete(organizationId: string, sectorId: string): Promise<void> {
    await this.db
      .delete(sectors)
      .where(
        and(
          eq(sectors.id, sectorId),
          eq(sectors.organizationId, organizationId),
        ),
      );
  }

  async findById(
    organizationId: string,
    sectorId: string,
  ): Promise<SectorEntity | null> {
    const result = await this.db
      .select()
      .from(sectors)
      .where(
        and(
          eq(sectors.id, sectorId),
          eq(sectors.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByOrganizationId(organizationId: string): Promise<SectorEntity[]> {
    const result = await this.db
      .select()
      .from(sectors)
      .where(eq(sectors.organizationId, organizationId));

    return result.map(this.mapToEntity);
  }

  private mapToEntity(row: typeof sectors.$inferSelect): SectorEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
    };
  }
}
