import { TeamEntity } from "@domain/team/entities/team.entity";
import { ITeamRepository } from "@domain/team/repositories/team.repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";
import { DRIZZLE_CONNECTION } from "../database/drizzle.provider";
import { teams } from "../database/schemas/team.schema";

@Injectable()
export class TeamRepository implements ITeamRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  async save(team: TeamEntity): Promise<void> {
    const teamData = {
      id: team.id,
      organizationId: team.organizationId,
      name: team.name,
      managerId: team.managerId || null,
      fieldOfAction: team.fieldOfAction || null,
      members: team.members || null,
      photo: team.photo || null,
    };

    // Upsert: insert or update if exists
    await this.db.insert(teams).values(teamData).onConflictDoUpdate({
      target: teams.id,
      set: teamData,
    });
  }

  async delete(organizationId: string, teamId: string): Promise<void> {
    await this.db
      .delete(teams)
      .where(
        and(eq(teams.id, teamId), eq(teams.organizationId, organizationId)),
      );
  }

  async findById(
    organizationId: string,
    teamId: string,
  ): Promise<TeamEntity | null> {
    const result = await this.db
      .select()
      .from(teams)
      .where(
        and(eq(teams.id, teamId), eq(teams.organizationId, organizationId)),
      )
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByOrganizationId(organizationId: string): Promise<TeamEntity[]> {
    const result = await this.db
      .select()
      .from(teams)
      .where(eq(teams.organizationId, organizationId));

    return result.map(this.mapToEntity);
  }

  private mapToEntity(row: typeof teams.$inferSelect): TeamEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      managerId: row.managerId || undefined,
      fieldOfAction: row.fieldOfAction || undefined,
      members: row.members || undefined,
      photo: row.photo || undefined,
      color: row.color || undefined,
      description: row.description || undefined,
    };
  }
}
