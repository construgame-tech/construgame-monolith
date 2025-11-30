import type { PrizeEntity } from "@domain/organization-config/entities/prize.entity";
import type { IPrizeRepository } from "@domain/organization-config/repositories/prize.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { prizes } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

@Injectable()
export class PrizeRepository implements IPrizeRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(prize: PrizeEntity): Promise<void> {
    await this.db
      .insert(prizes)
      .values({
        id: prize.id,
        organizationId: prize.organizationId,
        name: prize.name,
        description: prize.description,
        icon: prize.icon,
        photo: prize.photo,
      })
      .onConflictDoUpdate({
        target: prizes.id,
        set: {
          name: prize.name,
          description: prize.description,
          icon: prize.icon,
          photo: prize.photo,
        },
      });
  }

  async delete(organizationId: string, prizeId: string): Promise<void> {
    await this.db
      .delete(prizes)
      .where(
        and(eq(prizes.id, prizeId), eq(prizes.organizationId, organizationId)),
      );
  }

  async findById(
    organizationId: string,
    prizeId: string,
  ): Promise<PrizeEntity | null> {
    const result = await this.db
      .select()
      .from(prizes)
      .where(
        and(eq(prizes.id, prizeId), eq(prizes.organizationId, organizationId)),
      )
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByOrganizationId(organizationId: string): Promise<PrizeEntity[]> {
    const result = await this.db
      .select()
      .from(prizes)
      .where(eq(prizes.organizationId, organizationId));

    return result.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(row: typeof prizes.$inferSelect): PrizeEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      description: row.description ?? undefined,
      icon: row.icon ?? undefined,
      photo: row.photo ?? undefined,
    };
  }
}
