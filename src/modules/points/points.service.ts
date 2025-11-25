import type { DrizzleDB } from "@infrastructure/database/database.module";
import {
  gameKaizenPoints,
  gameTaskPoints,
  teamGamePoints,
  teamKaizenPoints,
  teamTaskPoints,
  userGamePoints,
  userKaizenPoints,
  userTaskPoints,
} from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";

@Injectable()
export class PointsService {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  // User Game Points
  async getUserGamePoints(userId: string, gameId: string) {
    const [points] = await this.db
      .select()
      .from(userGamePoints)
      .where(
        and(
          eq(userGamePoints.userId, userId),
          eq(userGamePoints.gameId, gameId),
        ),
      );
    return points || null;
  }

  async getUserGamePointsLeaderboard(gameId: string, limit = 10) {
    return this.db
      .select()
      .from(userGamePoints)
      .where(eq(userGamePoints.gameId, gameId))
      .orderBy(desc(userGamePoints.totalPoints))
      .limit(limit);
  }

  // Team Game Points
  async getTeamGamePoints(teamId: string, gameId: string) {
    const [points] = await this.db
      .select()
      .from(teamGamePoints)
      .where(
        and(
          eq(teamGamePoints.teamId, teamId),
          eq(teamGamePoints.gameId, gameId),
        ),
      );
    return points || null;
  }

  async getTeamGamePointsLeaderboard(gameId: string, limit = 10) {
    return this.db
      .select()
      .from(teamGamePoints)
      .where(eq(teamGamePoints.gameId, gameId))
      .orderBy(desc(teamGamePoints.totalPoints))
      .limit(limit);
  }

  // User Kaizen Points
  async getUserKaizenPoints(userId: string, gameId: string) {
    const [points] = await this.db
      .select()
      .from(userKaizenPoints)
      .where(
        and(
          eq(userKaizenPoints.userId, userId),
          eq(userKaizenPoints.gameId, gameId),
        ),
      );
    return points || null;
  }

  // Team Kaizen Points
  async getTeamKaizenPoints(teamId: string, gameId: string) {
    const [points] = await this.db
      .select()
      .from(teamKaizenPoints)
      .where(
        and(
          eq(teamKaizenPoints.teamId, teamId),
          eq(teamKaizenPoints.gameId, gameId),
        ),
      );
    return points || null;
  }

  // Game Kaizen Points
  async getGameKaizenPoints(gameId: string) {
    const [points] = await this.db
      .select()
      .from(gameKaizenPoints)
      .where(eq(gameKaizenPoints.gameId, gameId));
    return points || null;
  }

  // User Task Points
  async getUserTaskPoints(userId: string, gameId: string) {
    const [points] = await this.db
      .select()
      .from(userTaskPoints)
      .where(
        and(
          eq(userTaskPoints.userId, userId),
          eq(userTaskPoints.gameId, gameId),
        ),
      );
    return points || null;
  }

  // Team Task Points
  async getTeamTaskPoints(teamId: string, gameId: string) {
    const [points] = await this.db
      .select()
      .from(teamTaskPoints)
      .where(
        and(
          eq(teamTaskPoints.teamId, teamId),
          eq(teamTaskPoints.gameId, gameId),
        ),
      );
    return points || null;
  }

  // Game Task Points
  async getGameTaskPoints(gameId: string) {
    const [points] = await this.db
      .select()
      .from(gameTaskPoints)
      .where(eq(gameTaskPoints.gameId, gameId));
    return points || null;
  }
}
