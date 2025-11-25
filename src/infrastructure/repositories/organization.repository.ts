import type { OrganizationEntity } from "@domain/organization/entities/organization.entity";
import type { IOrganizationRepository } from "@domain/organization/repositories/organization.repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";
import { DRIZZLE_CONNECTION } from "../database/drizzle.provider";
import { organizations } from "../database/schemas/organization.schema";

@Injectable()
export class OrganizationRepository implements IOrganizationRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  async save(organization: OrganizationEntity): Promise<void> {
    const orgData = {
      id: organization.id,
      ownerId: organization.ownerId,
      name: organization.name,
      photo: organization.photo || null,
      sequence: organization.sequence,
      updatedAt: new Date(),
    };

    // Upsert: insert or update if exists
    await this.db.insert(organizations).values(orgData).onConflictDoUpdate({
      target: organizations.id,
      set: orgData,
    });
  }

  async delete(organizationId: string): Promise<void> {
    await this.db
      .delete(organizations)
      .where(eq(organizations.id, organizationId));
  }

  async findById(organizationId: string): Promise<OrganizationEntity | null> {
    const result = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findAll(): Promise<OrganizationEntity[]> {
    const result = await this.db.select().from(organizations);
    return result.map((row) => this.mapToEntity(row));
  }

  // Helper to map from Drizzle schema to Domain Entity
  private mapToEntity(
    row: typeof organizations.$inferSelect,
  ): OrganizationEntity {
    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      photo: row.photo || undefined,
      sequence: row.sequence,
    };
  }
}
