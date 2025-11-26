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
}

export interface ITeamGamePointsRepository {
  save(points: TeamGamePointsEntity): Promise<void>;
  findByTeamAndGame(
    teamId: string,
    gameId: string,
  ): Promise<TeamGamePointsEntity | null>;
}
