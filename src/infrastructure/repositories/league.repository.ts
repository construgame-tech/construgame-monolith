import type { LeagueEntity } from "@domain/league/entities/league.entity";
import type { ILeagueRepository } from "@domain/league/repositories/league.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { leagues } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

@Injectable()
export class LeagueRepository implements ILeagueRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(league: LeagueEntity): Promise<void> {
    await this.db
      .insert(leagues)
      .values({
        id: league.id,
        gameId: league.games?.[0] ?? league.organizationId, // Usa primeiro game ou organizationId como fallback
        name: league.name,
        description: league.objective,
        startDate: league.startDate,
        endDate: league.endDate,
        prizes: league.prizes,
      })
      .onConflictDoUpdate({
        target: leagues.id,
        set: {
          name: league.name,
          description: league.objective,
          startDate: league.startDate,
          endDate: league.endDate,
          prizes: league.prizes,
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

    return result[0] ? this.mapToEntity(result[0], organizationId) : null;
  }

  async findByOrganizationId(organizationId: string): Promise<LeagueEntity[]> {
    // Como não temos organizationId na tabela, retornamos todas as leagues
    // A filtragem por organização deve ser feita via gameId
    const result = await this.db.select().from(leagues);

    return result.map((row) => this.mapToEntity(row, organizationId));
  }

  async findByGameId(gameId: string): Promise<LeagueEntity[]> {
    const result = await this.db
      .select()
      .from(leagues)
      .where(eq(leagues.gameId, gameId));

    return result.map((row) => this.mapToEntity(row, gameId));
  }

  private mapToEntity(
    row: typeof leagues.$inferSelect,
    organizationId: string,
  ): LeagueEntity {
    return {
      id: row.id,
      organizationId: organizationId,
      responsibleId: "", // Não existe no banco atual
      status: "ACTIVE", // Não existe no banco atual
      name: row.name,
      objective: row.description ?? undefined,
      startDate: row.startDate ?? undefined,
      endDate: row.endDate ?? undefined,
      prizes: row.prizes ?? undefined,
      games: [row.gameId],
    };
  }
}
