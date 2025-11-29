import type { LeagueEntity } from "@domain/league/entities/league.entity";
import type { ILeagueRepository } from "@domain/league/repositories/league.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { leagues } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

@Injectable()
export class LeagueRepository implements ILeagueRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(league: LeagueEntity): Promise<void> {
    await this.db
      .insert(leagues)
      .values({
        id: league.id,
        organizationId: league.organizationId,
        gameId: league.games?.[0] ?? null,
        responsibleId: league.responsibleId || null,
        status: league.status,
        name: league.name,
        photo: league.photo || null,
        description: league.objective,
        startDate: league.startDate,
        endDate: league.endDate,
        prizes: league.prizes,
        projects: league.projects,
        games: league.games,
        hidden: league.hidden ?? false,
      })
      .onConflictDoUpdate({
        target: leagues.id,
        set: {
          responsibleId: league.responsibleId || null,
          status: league.status,
          name: league.name,
          photo: league.photo || null,
          description: league.objective,
          startDate: league.startDate,
          endDate: league.endDate,
          prizes: league.prizes,
          projects: league.projects,
          games: league.games,
          hidden: league.hidden ?? false,
        },
      });
  }

  async delete(organizationId: string, leagueId: string): Promise<void> {
    await this.db.delete(leagues).where(eq(leagues.id, leagueId));
  }

  async findById(
    organizationId: string,
    leagueId: string,
  ): Promise<LeagueEntity | null> {
    const result = await this.db
      .select()
      .from(leagues)
      .where(eq(leagues.id, leagueId))
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByOrganizationId(organizationId: string): Promise<LeagueEntity[]> {
    const result = await this.db
      .select()
      .from(leagues)
      .where(eq(leagues.organizationId, organizationId));

    return result.map((row) => this.mapToEntity(row));
  }

  async findByGameId(gameId: string): Promise<LeagueEntity[]> {
    const result = await this.db
      .select()
      .from(leagues)
      .where(eq(leagues.gameId, gameId));

    return result.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(row: typeof leagues.$inferSelect): LeagueEntity {
    return {
      id: row.id,
      organizationId: row.organizationId ?? "",
      responsibleId: row.responsibleId ?? "",
      status: row.status ?? "ACTIVE",
      name: row.name,
      photo: row.photo ?? undefined,
      objective: row.description ?? undefined,
      startDate: row.startDate ?? undefined,
      endDate: row.endDate ?? undefined,
      prizes: row.prizes ?? undefined,
      projects: row.projects ?? undefined,
      games: row.games ?? (row.gameId ? [row.gameId] : undefined),
      hidden: row.hidden ?? undefined,
    };
  }
}
