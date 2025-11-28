import type {
  TeamGamePointsEntity,
  UserGamePointsEntity,
} from "@domain/game-points/entities/game-points.entity";
import type {
  ITeamGamePointsRepository,
  IUserGamePointsRepository,
} from "@domain/game-points/repositories/game-points.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import {
  teamGamePoints,
  userGamePoints,
} from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";

@Injectable()
export class UserGamePointsRepository implements IUserGamePointsRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(points: UserGamePointsEntity): Promise<void> {
    await this.db
      .insert(userGamePoints)
      .values({
        userId: points.userId,
        gameId: points.gameId,
        organizationId: points.organizationId,
        projectId: points.projectId,
        taskPoints: points.taskPoints,
        kaizenPoints: points.kaizenPoints,
        totalPoints: points.totalPoints,
      })
      .onConflictDoUpdate({
        target: [userGamePoints.userId, userGamePoints.gameId],
        set: {
          taskPoints: points.taskPoints,
          kaizenPoints: points.kaizenPoints,
          totalPoints: points.totalPoints,
        },
      });
  }

  async findByUserAndGame(
    userId: string,
    gameId: string,
  ): Promise<UserGamePointsEntity | null> {
    const result = await this.db
      .select()
      .from(userGamePoints)
      .where(
        and(
          eq(userGamePoints.userId, userId),
          eq(userGamePoints.gameId, gameId),
        ),
      )
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByGameId(gameId: string): Promise<UserGamePointsEntity[]> {
    const result = await this.db
      .select()
      .from(userGamePoints)
      .where(eq(userGamePoints.gameId, gameId));

    return result.map(this.mapToEntity);
  }

  async getLeaderboard(
    gameId: string,
    limit = 10,
  ): Promise<UserGamePointsEntity[]> {
    const result = await this.db
      .select()
      .from(userGamePoints)
      .where(eq(userGamePoints.gameId, gameId))
      .orderBy(desc(userGamePoints.totalPoints))
      .limit(limit);

    return result.map(this.mapToEntity);
  }

  private mapToEntity(
    row: typeof userGamePoints.$inferSelect,
  ): UserGamePointsEntity {
    return {
      userId: row.userId,
      gameId: row.gameId,
      organizationId: row.organizationId,
      projectId: row.projectId,
      taskPoints: row.taskPoints,
      kaizenPoints: row.kaizenPoints,
      totalPoints: row.totalPoints,
    };
  }
}

@Injectable()
export class TeamGamePointsRepository implements ITeamGamePointsRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(points: TeamGamePointsEntity): Promise<void> {
    await this.db
      .insert(teamGamePoints)
      .values({
        teamId: points.teamId,
        gameId: points.gameId,
        organizationId: points.organizationId,
        projectId: points.projectId,
        taskPoints: points.taskPoints,
        kaizenPoints: points.kaizenPoints,
        totalPoints: points.totalPoints,
      })
      .onConflictDoUpdate({
        target: [teamGamePoints.teamId, teamGamePoints.gameId],
        set: {
          taskPoints: points.taskPoints,
          kaizenPoints: points.kaizenPoints,
          totalPoints: points.totalPoints,
        },
      });
  }

  async findByTeamAndGame(
    teamId: string,
    gameId: string,
  ): Promise<TeamGamePointsEntity | null> {
    const result = await this.db
      .select()
      .from(teamGamePoints)
      .where(
        and(
          eq(teamGamePoints.teamId, teamId),
          eq(teamGamePoints.gameId, gameId),
        ),
      )
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByGameId(gameId: string): Promise<TeamGamePointsEntity[]> {
    const result = await this.db
      .select()
      .from(teamGamePoints)
      .where(eq(teamGamePoints.gameId, gameId));

    return result.map(this.mapToEntity);
  }

  async getLeaderboard(
    gameId: string,
    limit = 10,
  ): Promise<TeamGamePointsEntity[]> {
    const result = await this.db
      .select()
      .from(teamGamePoints)
      .where(eq(teamGamePoints.gameId, gameId))
      .orderBy(desc(teamGamePoints.totalPoints))
      .limit(limit);

    return result.map(this.mapToEntity);
  }

  private mapToEntity(
    row: typeof teamGamePoints.$inferSelect,
  ): TeamGamePointsEntity {
    return {
      teamId: row.teamId,
      gameId: row.gameId,
      organizationId: row.organizationId,
      projectId: row.projectId,
      taskPoints: row.taskPoints,
      kaizenPoints: row.kaizenPoints,
      totalPoints: row.totalPoints,
    };
  }
}
