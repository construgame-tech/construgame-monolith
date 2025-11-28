import {
  TeamGamePointsEntity,
  UserGamePointsEntity,
} from "../entities/game-points.entity";

export interface IUserGamePointsRepository {
  save(points: UserGamePointsEntity): Promise<void>;
  findByUserAndGame(
    userId: string,
    gameId: string,
  ): Promise<UserGamePointsEntity | null>;
  findByGameId(gameId: string): Promise<UserGamePointsEntity[]>;
  getLeaderboard(gameId: string, limit?: number): Promise<UserGamePointsEntity[]>;
}

export interface ITeamGamePointsRepository {
  save(points: TeamGamePointsEntity): Promise<void>;
  findByTeamAndGame(
    teamId: string,
    gameId: string,
  ): Promise<TeamGamePointsEntity | null>;
  findByGameId(gameId: string): Promise<TeamGamePointsEntity[]>;
  getLeaderboard(gameId: string, limit?: number): Promise<TeamGamePointsEntity[]>;
}
