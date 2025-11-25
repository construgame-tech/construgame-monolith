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
import { and, eq } from "drizzle-orm";

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
        sequence: points.sequence,
      })
      .onConflictDoUpdate({
        target: [userGamePoints.userId, userGamePoints.gameId],
        set: {
          taskPoints: points.taskPoints,
          kaizenPoints: points.kaizenPoints,
          totalPoints: points.totalPoints,
          sequence: points.sequence,
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
      sequence: row.sequence,
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
        sequence: points.sequence,
      })
      .onConflictDoUpdate({
        target: [teamGamePoints.teamId, teamGamePoints.gameId],
        set: {
          taskPoints: points.taskPoints,
          kaizenPoints: points.kaizenPoints,
          totalPoints: points.totalPoints,
          sequence: points.sequence,
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
      sequence: row.sequence,
    };
  }
}
