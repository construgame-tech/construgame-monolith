import type { KpiEntity } from "@domain/kpi/entities/kpi.entity";
import type { IKpiRepository } from "@domain/kpi/repositories/kpi.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { kpis } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

@Injectable()
export class KpiRepository implements IKpiRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(kpi: KpiEntity & { organizationId?: string }): Promise<void> {
    await this.db
      .insert(kpis)
      .values({
        id: kpi.id,
        organizationId: kpi.organizationId ?? kpi.id, // Fallback para compatibilidade
        name: kpi.name,
        type: kpi.type,
        kpiType: kpi.kpiType,
        photo: kpi.photo,
        sequence: 0,
      })
      .onConflictDoUpdate({
        target: kpis.id,
        set: {
          name: kpi.name,
          type: kpi.type,
          kpiType: kpi.kpiType,
          photo: kpi.photo,
        },
      });
  }

  async delete(kpiId: string): Promise<void> {
    await this.db.delete(kpis).where(eq(kpis.id, kpiId));
  }

  async findById(kpiId: string): Promise<KpiEntity | null> {
    const result = await this.db
      .select()
      .from(kpis)
      .where(eq(kpis.id, kpiId))
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findAll(): Promise<KpiEntity[]> {
    const result = await this.db.select().from(kpis);
    return result.map(this.mapToEntity);
  }

  async findByOrganizationId(organizationId: string): Promise<KpiEntity[]> {
    const result = await this.db
      .select()
      .from(kpis)
      .where(eq(kpis.organizationId, organizationId));
    return result.map(this.mapToEntity);
  }

  private mapToEntity(row: typeof kpis.$inferSelect): KpiEntity {
    return {
      id: row.id,
      name: row.name,
      type: row.type ?? "",
      kpiType: row.kpiType ?? undefined,
      photo: row.photo ?? undefined,
    };
  }
}
