import {
  TeamEntity,
  TeamMemberInfo,
  TeamWithDetails,
} from "@domain/team/entities/team.entity";
import { ITeamRepository } from "@domain/team/repositories/team.repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq, inArray } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";
import { DRIZZLE_CONNECTION } from "../database/drizzle.provider";
import { teams } from "../database/schemas/team.schema";
import { users } from "../database/schemas/user.schema";

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

  async findByOrganizationIdWithDetails(
    organizationId: string,
  ): Promise<TeamWithDetails[]> {
    // Busca todos os teams da organização
    const teamsResult = await this.db
      .select()
      .from(teams)
      .where(eq(teams.organizationId, organizationId));

    if (teamsResult.length === 0) {
      return [];
    }

    // Coleta todos os userIds únicos (managers e members)
    const userIds = new Set<string>();
    for (const team of teamsResult) {
      if (team.managerId) {
        userIds.add(team.managerId);
      }
      if (team.members && Array.isArray(team.members)) {
        for (const memberId of team.members) {
          userIds.add(memberId);
        }
      }
    }

    // Busca todos os usuários de uma vez
    const userMap = new Map<string, TeamMemberInfo>();
    if (userIds.size > 0) {
      const usersResult = await this.db
        .select({
          id: users.id,
          name: users.name,
          status: users.status,
          photo: users.photo,
        })
        .from(users)
        .where(inArray(users.id, Array.from(userIds)));

      for (const user of usersResult) {
        userMap.set(user.id, {
          id: user.id,
          name: user.name,
          status: user.status as "WAITING_CONFIRMATION" | "ACTIVE",
          photo: user.photo || undefined,
        });
      }
    }

    // Monta os teams com os detalhes dos membros e manager
    return teamsResult.map((row) => {
      const baseEntity = this.mapToEntity(row);
      const teamWithDetails: TeamWithDetails = {
        ...baseEntity,
      };

      // Adiciona dados do manager se existir
      if (row.managerId && userMap.has(row.managerId)) {
        teamWithDetails.manager = userMap.get(row.managerId);
      }

      // Adiciona dados dos membros se existirem
      if (row.members && Array.isArray(row.members) && row.members.length > 0) {
        teamWithDetails.membersDetails = row.members
          .map((memberId) => userMap.get(memberId))
          .filter((member): member is TeamMemberInfo => member !== undefined);
      }

      return teamWithDetails;
    });
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
